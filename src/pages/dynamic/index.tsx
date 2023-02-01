import { LoadingOutlined } from '@ant-design/icons';
import { Button, Form, message, notification, Result, Spin } from 'antd';
import classNames from 'classnames';
import { nanoid } from 'nanoid/non-secure';
import Link from 'next/link';
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useMutate } from 'restful-react';
import { ConfigurableForm, ValidationErrors } from '../../components';
import { usePubSub, usePrevious } from '../../hooks';
import { PageWithLayout } from '../../interfaces';
import {
  useGlobalState,
  MetadataProvider,
  useShaRouting,
  useSheshaApplication,
  useAppConfigurator,
} from '../../providers';
import { ConfigurableFormInstance, ISetFormDataPayload } from '../../providers/form/contexts';
import {
  evaluateComplexString,
} from '../../providers/form/utils';
import { getQueryParams, isValidSubmitVerb } from '../../utils/url';
import { IDynamicPageProps, IDynamicPageState, INavigationState } from './interfaces';
import { DynamicFormPubSubConstants } from './pubSub';
import { useStackedModal } from './navigation/stackedNavigationModalProvider';
import isDeepEqual from 'fast-deep-equal/react';
import { useStackedNavigation } from './navigation/stakedNavigation';
import StackedNavigationModal from './navigation/stackedNavigationModal';
import { useFormWithData } from '../../providers/form/api';
import { IErrorInfo } from '../../interfaces/errorInfo';
import moment from 'moment';
import { axiosHttp } from '../../apis/axios';
import { DEFAULT_FORM_SETTINGS } from '../../providers/form/models';

const DynamicPage: PageWithLayout<IDynamicPageProps> = props => {
  const { backendUrl } = useSheshaApplication();
  const [state, setState] = useState<IDynamicPageState>({});
  const formRef = useRef<ConfigurableFormInstance>();
  const { globalState } = useGlobalState();
  const { router } = useShaRouting();
  const { configurationItemMode } = useAppConfigurator();

  const { publish } = usePubSub();

  const { id, formId } = state;

  const formWithData = useFormWithData({ formId: formId, dataId: id, configurationItemMode: configurationItemMode });
  //console.log('PERF: hook', formWithData)
  const formSettings = formWithData.loadingState === 'ready'
    ? formWithData.form?.settings ?? DEFAULT_FORM_SETTINGS
    : null;

  const [form] = Form.useForm();

  // submit verb (PUT/POST)
  const submitVerb = useMemo(() => {
    const verb = state?.submitVerb?.toUpperCase() as typeof state.submitVerb;

    const defaultSubmitVerb = id || Boolean(formWithData.fetchedData) ? 'PUT' : 'POST';

    return verb && isValidSubmitVerb(verb) ? verb : defaultSubmitVerb;
  }, [formSettings, formWithData.fetchedData]);

  // submit URL
  const submitUrl = useMemo(() => {
    const url = formSettings ? formSettings[`${submitVerb?.toLocaleLowerCase()}Url`] : null;

    if (!url && formSettings) {
      console.warn(`Please make sure you have specified the '${submitVerb}' URL`);
    }

    return url
      ? evaluateComplexString(url, [
        { match: 'query', data: getQueryParams() },
        { match: 'globalState', data: globalState },
      ])
      : '';
  }, [formSettings, submitVerb]);

  const { mutate: postData, loading: isPostingData } = useMutate({
    path: submitUrl,
    verb: submitVerb,
  });

  //#region routing
  const { setCurrentNavigator, navigator } = useStackedNavigation();
  const [navigationState, setNavigationState] = useState<INavigationState>();
  const { parentId } = useStackedModal(); // If the parentId is null, we're in the root page
  const closing = useRef(false);

  useEffect(() => {
    const stackId = nanoid();

    if (props?.navMode === 'stacked' || navigationState) {
      //const isInitialized = state?.formId || state?.entityPathId; // todo: review
      const isInitialized = state?.formId;

      if (!isInitialized) {
        setState({ ...props, stackId });
        setCurrentNavigator(stackId);
      } else if (navigationState && navigationState?.closing) {
        setNavigationState(null); // We're closing the dialog
      }
    } else {
      setState({ ...props, stackId });
      setCurrentNavigator(stackId);
    }
  }, [props]);

  const previousProps = usePrevious(props);
  const previousRouter = usePrevious(router?.query);

  useEffect(() => {
    if (!router?.query?.navMode && !navigationState) {
      return;
    } else if (!parentId && !router?.query?.navMode) {
      setNavigationState(null);
      setCurrentNavigator(state?.stackId);

      setState(prev => ({ ...prev, ...router?.query }));
      closing.current = false;
      return;
    }

    if (
      navigator &&
      state?.stackId === navigator &&
      !navigationState &&
      !closing?.current &&
      !isDeepEqual(previousProps, router?.query) &&
      !isDeepEqual(previousRouter, router?.query)
    ) {
      const fullPath =
        props && Array.isArray(props.path)
          ? props.path.length === 1
            ? [null, props.path[0]]
            : props.path.length === 2
              ? [props.path[0], props.path[1]]
              : [null, null]
          : [null, null];

      setNavigationState({
        ...router?.query,
        formId: {
          module: fullPath[0],
          name: fullPath[1],
        },
      });
      closing.current = false;
    }
    closing.current = false;
  }, [router]);

  useEffect(() => {
    if (navigationState?.closing) {
      router?.back();
    }
  }, [navigationState?.closing]);

  const onStackedDialogClose = () => {
    closing.current = true;

    setNavigationState(prev => ({ ...prev, closing: true }));
    setCurrentNavigator(state?.stackId);
  };

  const hasDialog = Boolean(props?.onCloseDialog);
  //#endregion

  //#region get form data

  const onChangeId = (localId: string) => {
    setState(prev => ({ ...prev, id: localId }));
  };

  const onChangeFormData = (payload: ISetFormDataPayload) => {
    form?.setFieldsValue(payload?.values);
    formRef?.current?.setFormData({ values: payload?.values, mergeValues: payload?.mergeValues });
  };

  //#endregion

  const onFinish = (values: any, _response?: any, options?: any) => {
    postData(values)
      .then(() => {
        message.success('Data saved successfully!');

        publish(DynamicFormPubSubConstants.DataSaved);

        formRef?.current?.setFormMode('readonly');
      })
      .catch(error => {
        if (options?.setValidationErrors) {
          options.setValidationErrors(error);
        }
      });
  };

  //#region Error messages
  useEffect(() => {
    if (formWithData.loadingState === 'failed') {
      displayNotificationError(formWithData.error);
    }
  }, [formWithData.loadingState]);

  const displayNotificationError = (error: IErrorInfo) => {
    notification.error({
      message: 'Sorry! An error occurred.',
      icon: null,
      description: <ValidationErrors error={error} renderMode="raw" defaultMessage={null} />,
    });
  };
  //#endregion

  //#region On Data Loaded handler

  const executeExpression = (expression: string, data: any) => {
    if (!expression) {
      return null;
    }

    // tslint:disable-next-line:function-constructor
    return new Function('data, globalState, moment, http, message', expression)(
      data,
      globalState,
      moment,
      axiosHttp(backendUrl),
      message
    );
  };

  // effect that executes onDataLoaded handler
  useEffect(() => {
    if (formWithData.loadingState === 'ready') {
      const onDataLoaded = formWithData.form?.settings?.onDataLoaded;
      if (onDataLoaded) {
        executeExpression(onDataLoaded, formWithData.fetchedData);
      }
    }
  }, [formWithData.loadingState]);

  useEffect(() => {
    // call onInitialized (if specified) if the form already loaded but loading of other parts are still in progress
    if (formWithData.loadingState === 'loading') {
      const onInitialized = formWithData.form?.settings?.onInitialized;
      if (onInitialized) {
        executeExpression(onInitialized, formWithData.fetchedData);
      }
    }
  }, [formWithData.loadingState]);

  //#endregion

  const markupErrorCode = formWithData.loadingState === 'failed'
    ? formWithData.error?.code
    : null;

  //console.log('PERF: render form', formWithData)

  if (markupErrorCode === 404) {
    return (
      <Result
        status="404"
        style={{ height: '100vh - 55px' }}
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={
          <Button type="primary">
            <Link href={'/'}>
              <a>Back Home</a>
            </Link>
          </Button>
        }
      />
    );
  }

  const refetchFormData = () => {
    return formWithData.dataFetcher
      ? formWithData.dataFetcher()
      : Promise.reject('Data fetcher is not available');
  }

  return (
    <Fragment>
      <div id="modalContainerId" className={classNames('sha-dynamic-page', { 'has-dialog': hasDialog })}>
        <Spin spinning={isPostingData} tip="Saving data..." indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}>
          <Spin spinning={formWithData.loadingState === 'loading'} tip={formWithData.loaderHint} indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />}>
            <MetadataProvider id="dynamic" modelType={formSettings?.modelType}>
              {formWithData.loadingState === 'ready' && (
                <ConfigurableForm
                  markup={{ components: formWithData.form?.markup, formSettings: { ...formWithData.form?.settings, onInitialized: null } }} // pass empty markup to prevent unneeded form fetching
                  formId={formId}
                  formProps={formWithData.form}
                  formRef={formRef}
                  mode={state?.mode}
                  form={form}
                  actions={{ onChangeId, onChangeFormData }}
                  onFinish={onFinish}
                  initialValues={formWithData.fetchedData}
                  skipPostOnFinish
                  skipFetchData
                  refetchData={() => refetchFormData()}
                  className="sha-dynamic-page"
                  isActionsOwner={true}
                />
              )
              }
            </MetadataProvider>
          </Spin>

        </Spin>
      </div>

      <StackedNavigationModal
        onCancel={onStackedDialogClose}
        title="NAVIGATE"
        visible={Boolean(navigationState)}
        parentId={state?.stackId}
      >
        <DynamicPage onCloseDialog={onStackedDialogClose} {...navigationState} />
      </StackedNavigationModal>
    </Fragment>
  );
};
export default DynamicPage;