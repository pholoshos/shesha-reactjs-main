import React, { FC, useEffect, useMemo, useState } from 'react';
import { Form, message, Spin } from 'antd';
import ComponentsContainer from '../formDesigner/componentsContainer';
import { ROOT_COMPONENT_KEY } from '../../providers/form/models';
import { useForm } from '../../providers/form';
import { IConfigurableFormRendererProps } from './models';
import { useGet, useMutate } from 'restful-react';
import { IAnyObject, ValidateErrorEntity } from '../../interfaces';
import { addFormFieldsList, hasFiles, jsonToFormData } from '../../utils/form';
import { useGlobalState, useSheshaApplication } from '../../providers';
import moment from 'moment';
import {
  evaluateComplexString,
  evaluateKeyValuesToObjectMatchedData,
  evaluateString,
  getObjectWithOnlyIncludedKeys,
} from '../../providers/form/utils';
import cleanDeep from 'clean-deep';
import { useSubmitUrl } from './useSubmitUrl';
import { getQueryParams, joinUrlAndPath } from '../../utils/url';
import _ from 'lodash';
import { usePrevious } from 'react-use';
import { axiosHttp } from '../../apis/axios';
import qs from 'qs';
import axios, { AxiosResponse } from 'axios';
import { FormConfigurationDto } from '../../providers/form/api';
import { IAbpWrappedGetEntityResponse } from '../../interfaces/gql';
import { nanoid } from 'nanoid/non-secure';
import { useFormDesigner } from '../../providers/formDesigner';

export const ConfigurableFormRenderer: FC<IConfigurableFormRendererProps> = ({
  children,
  skipPostOnFinish,
  form,
  httpVerb = 'POST',
  parentFormValues,
  initialValues,
  beforeSubmit,
  prepareInitialValues,
  skipFetchData,
  ...props
}) => {
  const { setFormData, formData, allComponents, formMode, formSettings, setValidationErrors } = useForm();
  const { isDragging = false } = useFormDesigner(false) ?? {};
  const {
    excludeFormFieldsInPayload,
    onDataLoaded,
    onUpdate,
    onInitialized,
    formKeysToPersist,
    uniqueFormId,
  } = formSettings;
  const { globalState } = useGlobalState();
  const submitUrl = useSubmitUrl(formSettings, httpVerb, formData, parentFormValues, globalState);
  const { backendUrl } = useSheshaApplication();
  const [lastTruthyPersistedValue, setLastTruthyPersistedValue] = useState<IAnyObject>(null);
  const { refetch: fetchEntity, data: fetchedEntity } = useGet({
    path: formSettings?.getUrl || '',
    lazy: true,
  });

  const queryParamsFromAddressBar = useMemo(() => getQueryParams(), []);

  // Execute onInitialized if provided
  useEffect(() => {
    if (onInitialized) {
      getExpressionExecutor(onInitialized);
    }
  }, [onInitialized]);

  //#region PERSISTED FORM VALUES
  // I decided to do the persisting manually since the hook way fails in prod. Only works perfectly, but on Storybook
  // TODO: Revisit this
  useEffect(() => {
    if (window && uniqueFormId) {
      const itemFromStorage = window?.localStorage?.getItem(uniqueFormId);
      setLastTruthyPersistedValue(_.isEmpty(itemFromStorage) ? null : JSON.parse(itemFromStorage));
    }
  }, [uniqueFormId]);

  useEffect(() => {
    if (uniqueFormId && formKeysToPersist?.length && !_.isEmpty(formData)) {
      localStorage.setItem(uniqueFormId, JSON.stringify(getObjectWithOnlyIncludedKeys(formData, formKeysToPersist)));
    } else {
      localStorage.removeItem(uniqueFormId);
    }
  }, [formData]);
  //#endregion

  const onFieldsChange = (changedFields: any[], allFields: any[]) => {
    if (props.onFieldsChange) props.onFieldsChange(changedFields, allFields);

    // custom handling here...
  };

  const onValuesChangeInternal = (changedValues: any, values: any) => {
    if (props.onValuesChange) props.onValuesChange(changedValues, values);

    // recalculate components visibility
    setFormData({ values, mergeValues: true });

    // update validation rules
  };

  const initialValuesFromSettings = useMemo(() => {
    const computedInitialValues = {} as object;

    formSettings?.initialValues?.forEach(({ key, value }) => {
      const evaluatedValue = value?.includes('{{')
        ? evaluateComplexString(value, [
            { match: 'data', data: formData },
            { match: 'parentFormValues', data: parentFormValues },
            { match: 'globalState', data: globalState },
            { match: 'query', data: queryParamsFromAddressBar },
            { match: 'initialValues', data: initialValues },
          ])
        : value;
      _.set(computedInitialValues, key, evaluatedValue);
    });

    return computedInitialValues;
  }, [formSettings?.initialValues]);

  const getUrl = formSettings?.getUrl;

  const previousUrl = usePrevious(getUrl);
  const fetchFormData = () => {
    if (
      _.isEqual(previousUrl, getUrl)
      // !_.isEqual(previousFormData, formData) ||
      // !_.isEqual(previousGlobalState, globalState) ||
      // !_.isEqual(previousParentFormValues, parentFormValues)
    ) {
      return;
    }

    if (getUrl) {
      const evaluatedGetUrl = getUrl?.includes('{{')
        ? evaluateComplexString(getUrl, [
            { match: 'data', data: formData },
            { match: 'parentFormValues', data: parentFormValues },
            { match: 'globalState', data: globalState },
            { match: 'query', data: queryParamsFromAddressBar },
          ])
        : getUrl;

      const fullUrl = joinUrlAndPath(backendUrl, evaluatedGetUrl);
      const urlObj = new URL(decodeURIComponent(fullUrl));
      const queryParams = getQueryParams(fullUrl);

      if (!_.isEmpty(queryParams)) {
        if (Object.hasOwn(queryParams, 'id') && !Boolean(queryParams['id'])) {
          console.error('id cannot be null');
          return;
        }

        fetchEntity({
          queryParams,
          path: urlObj?.pathname,
        });
      }
    }
  };

  useEffect(() => {
    if (!skipFetchData) fetchFormData();
  }, [getUrl, formData, globalState, parentFormValues, skipFetchData]);

  const fetchedFormEntity = fetchedEntity?.result as object;

  useEffect(() => {
    if (fetchedFormEntity && onDataLoaded) {
      getExpressionExecutor(onDataLoaded, true, true, true, true, fetchedFormEntity); // On Initialize
    }
  }, [onDataLoaded, fetchedFormEntity]);

  useEffect(() => {
    if (onUpdate) {
      getExpressionExecutor(onUpdate); // On Update
    }
  }, [formData, onUpdate]);

  // reset form to initial data on any change of components or initialData
  useEffect(() => {
    setFormData({ values: initialValues, mergeValues: true });

    if (fetchedFormEntity) return;

    if (form) {
      form.resetFields();
    }
  }, [allComponents, initialValues]);

  useEffect(() => {
    let incomingInitialValues = null;

    // By default the `initialValuesFromSettings` are merged with `fetchedFormEntity`
    // If you want only `initialValuesFromSettings`, then pass skipFetchData
    // If you want only `fetchedFormEntity`, don't pass `initialValuesFromSettings`
    if (!_.isEmpty(initialValuesFromSettings)) {
      incomingInitialValues = fetchedFormEntity
        ? Object.assign(fetchedFormEntity, initialValuesFromSettings)
        : initialValuesFromSettings;
    } else if (!_.isEmpty(fetchedFormEntity) || !_.isEmpty(lastTruthyPersistedValue)) {
      // `fetchedFormEntity` will always be merged with persisted values from local storage
      // To override this, to not persist values or pass skipFetchData
      let computedInitialValues = fetchedFormEntity
        ? prepareInitialValues
          ? prepareInitialValues(fetchedFormEntity)
          : fetchedFormEntity
        : initialValues;

      if (!_.isEmpty(lastTruthyPersistedValue)) {
        computedInitialValues = { ...computedInitialValues, ...lastTruthyPersistedValue };
      }
      incomingInitialValues = computedInitialValues;
    }
    // }

    if (incomingInitialValues) {
      // TODO: setFormData doesn't update the fields when the form that needs to be initialized it modal.
      // TODO: Tried with mergeValues as both true | false. The state got updated properly but that doesn't reflect on the form
      // TODO: Investigate this
      if (form) {
        form?.setFieldsValue(incomingInitialValues);
      }
      setFormData({ values: incomingInitialValues, mergeValues: false });
    }
  }, [fetchedFormEntity, lastTruthyPersistedValue, initialValuesFromSettings, uniqueFormId]);

  const { mutate: doSubmit, loading: submitting } = useMutate({
    verb: httpVerb || 'POST', // todo: convert to configurable
    path: submitUrl,
  });

  const sheshaUtils = {
    prepareTemplate: (templateId: string, replacements: object): Promise<string> => {
      if (!templateId) return Promise.resolve(null);

      const payload = {
        id: templateId,
        properties: 'markup',
      };
      const url = `${backendUrl}/api/services/Shesha/FormConfiguration/Query?${qs.stringify(payload)}`;
      return axios.get<any, AxiosResponse<IAbpWrappedGetEntityResponse<FormConfigurationDto>>>(url).then(response => {
        const markup = response.data.result.markup;

        const preparedMarkup = evaluateString(markup, {
          NEW_KEY: nanoid(),
          GEN_KEY: nanoid(),
          ...(replacements ?? {}),
        });

        return preparedMarkup;
      });
    },
  };

  const getExpressionExecutor = (
    expression: string,
    includeInitialValues = true,
    includeMoment = true,
    includeAxios = true,
    includeMessage = true,
    exposedData = null
  ) => {
    if (!expression) {
      return null;
    }

    // tslint:disable-next-line:function-constructor
    return new Function(
      'data, parentFormValues, initialValues, globalState, moment, http, message, shesha',
      expression
    )(
      exposedData || formData,
      parentFormValues,
      includeInitialValues ? initialValues : undefined,
      globalState,
      includeMoment ? moment : undefined,
      includeAxios ? axiosHttp(backendUrl) : undefined,
      includeMessage ? message : undefined,
      sheshaUtils
    );
  };

  const getDynamicPreparedValues = (): Promise<object> => {
    const { preparedValues } = formSettings;

    return Promise.resolve(preparedValues ? getExpressionExecutor(preparedValues) : {});
  };

  const getInitialValuesFromFormSettings = () => {
    const initialValuesFromFormSettings = formSettings?.initialValues;

    const values = evaluateKeyValuesToObjectMatchedData(initialValuesFromFormSettings, [
      { match: 'data', data: formData },
      { match: 'parentFormValues', data: parentFormValues },
      { match: 'globalState', data: globalState },
    ]);

    return cleanDeep(values, {
      // cleanKeys: [], // Don't Remove specific keys, ie: ['foo', 'bar', ' ']
      // cleanValues: [], // Don't Remove specific values, ie: ['foo', 'bar', ' ']
      // emptyArrays: false, // Don't Remove empty arrays, ie: []
      // emptyObjects: false, // Don't Remove empty objects, ie: {}
      // emptyStrings: false, // Don't Remove empty strings, ie: ''
      // NaNValues: true, // Remove NaN values, ie: NaN
      // nullValues: true, // Remove null values, ie: null
      undefinedValues: true, // Remove undefined values, ie: undefined
    });
  };

  const options = { setValidationErrors };

  const prepareDataToSubmit = (data: any) => {
    return data && hasFiles(data)
      ? jsonToFormData(data)
      : data;
  }

  const onFinish = () => {
    const initialValuesFromFormSettings = getInitialValuesFromFormSettings();

    getDynamicPreparedValues()
      .then(dynamicValues => {
        const initialValues = getInitialValuesFromFormSettings();
        const nonFormValues = { ...dynamicValues, ...initialValues };

        const postData = excludeFormFieldsInPayload 
          ? { ...formData, ...nonFormValues } 
          : addFormFieldsList(formData, nonFormValues, form);

        if (excludeFormFieldsInPayload) {
          delete postData._formFields;
        } else {
          if (initialValuesFromFormSettings) {
            postData._formFields = Array.from(
              new Set<string>([...(postData._formFields || []), ...Object.keys(initialValuesFromFormSettings)])
            );
          }
        }

        if (skipPostOnFinish) {
          if (props?.onFinish) {
            props?.onFinish(postData, null, options);
          }

          return;
        }

        if (submitUrl) {
          setValidationErrors(null);

          console.log('prepare data');
          const preparedData = prepareDataToSubmit(postData);

          const doPost = () =>
            doSubmit(preparedData)
              .then(response => {
                // note: we pass merged values
                if (props.onFinish) props.onFinish(postData, response?.result, options);
              })
              .catch(e => {
                setValidationErrors(e?.data?.error || e);
                console.log('ConfigurableFormRenderer onFinish e: ', e);
              }); // todo: test and show server-side validation

          if (typeof beforeSubmit === 'function') {
            beforeSubmit(postData)
              .then(() => {
                console.log('beforeSubmit then');

                doPost();
              })
              .catch(() => {
                console.log('beforeSubmit catch');
              });
          } else {
            doPost();
          }
        } // note: we pass merged values
        else if (props.onFinish) props.onFinish(postData, null, options);
      })
      .catch(error => console.error(error));
  };

  const onFinishFailed = (errorInfo: ValidateErrorEntity) => {
    setValidationErrors(null);
    if (props.onFinishFailed) props.onFinishFailed(errorInfo);
  };

  const mergedProps = {
    layout: props.layout ?? formSettings.layout,
    labelCol: props.labelCol ?? formSettings.labelCol,
    wrapperCol: props.wrapperCol ?? formSettings.wrapperCol,
    colon: formSettings.colon,
  };

  return (
    <Spin spinning={submitting}>
      <Form
        form={form}
        size={props.size}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={onValuesChangeInternal}
        onFieldsChange={onFieldsChange}
        fields={props.fields}
        initialValues={initialValues}
        className={`sha-form sha-form-${formMode} ${isDragging ? 'sha-dragging' : ''}`}
        {...mergedProps}
      >
        <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
        {children}
      </Form>
    </Spin>
  );
};

export default ConfigurableFormRenderer;
