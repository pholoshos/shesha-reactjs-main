import { MutableRefObject } from 'react';
import { ColProps } from 'antd/lib/col';
import { FormInstance, FormProps } from 'antd/lib/form';
import { FormLayout } from 'antd/lib/form/Form';
import { ConfigurableFormInstance } from '../../providers/form/contexts';
import { FormMode, Store, IConfigurableFormBaseProps, IFormActions, IFormSections } from '../../providers/form/models';
import { ValidateErrorEntity } from '../../interfaces';

type BaseFormProps = Pick<FormProps, 'size'>;

export interface IConfigurableFormRendererProps<Values = any, FieldData = any> extends BaseFormProps {
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  layout?: FormLayout;
  initialValues?: Store;
  parentFormValues?: Store;
  onValuesChange?: (changedValues: any, values: Values) => void;
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void;
  fields?: FieldData[];

  /**
   * Returns the form data and the response data as well, only if an API was made and came back successful
   *
   * @param values form data before being submitted
   * @param response response data
   */
  onFinish?: (values: Values, response?: any, options?: object) => void;
  onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;

  /**
   * If specified, the form will only be submitted if this function return true
   */
  beforeSubmit?: (values: Values) => Promise<boolean>;

  /**
   * If passed and the form has `getUrl` defined, you can use this function to prepare `fetchedData` for as `initialValues`
   * If you want to use only `initialValues` without combining them with `fetchedData` and then ignore `fetchedData`
   *
   * If not passed, `fetchedData` will be used as `initialValues` and, thus override initial values
   *
   * Whenever the form has a getUrl and that url has queryParams, buy default, the `dynamicModal` will fetch the form and, subsequently, the data
   * for that form
   */
  prepareInitialValues?: (fetchedData: any) => any;

  form?: FormInstance<any>;
  actions?: IFormActions;
  sections?: IFormSections;
  context?: any; // todo: make generic

  /**
   * Submit http verb to use. By default it's `POST`
   */
  httpVerb?: 'POST' | 'PUT' | 'DELETE';
  /**
   * Pass this if you do not want an API call to be made on your behalf when you submit the form
   */
  skipPostOnFinish?: boolean;

  /**
   * By default, if the GET Url has parameters, the form configurator will proceed to fetch the entity
   * Pass this this is you wanna bypass that
   */
  skipFetchData?: boolean;

  /**
   * External data fetcher, is used to refresh form data from the back-end. 
   */
  refetchData?: () => Promise<any>;

  //onFinishFailed?: (errorInfo: ValidateErrorEntity<Values>) => void;
}

export interface IConfigurableFormProps<Values = any, FieldData = any>
  extends IConfigurableFormRendererProps<Values, FieldData>,
    IConfigurableFormBaseProps {
  mode: FormMode;
  formRef?: MutableRefObject<Partial<ConfigurableFormInstance> | null>;
  switchToReadOnlyOnSuccess?: boolean;
  className?: string;
  isActionsOwner?: boolean;
}
