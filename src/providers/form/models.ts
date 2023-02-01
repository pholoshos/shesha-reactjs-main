import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { ReactNode } from 'react';
import { IAsyncValidationError } from '../../interfaces';
import { FormLayout } from 'antd/lib/form/Form';
import { IKeyValue } from '../../interfaces/keyValue';
import { ColProps } from 'antd';
import { IHasVersion } from '../../utils/fluentMigrator/migrator';
import { IPersistedFormProps } from '../formPersisterProvider/models';

export const ROOT_COMPONENT_KEY: string = 'root'; // root key of the flat components structure
export const TOOLBOX_COMPONENT_DROPPABLE_KEY: string = 'toolboxComponent';
export const TOOLBOX_DATA_ITEM_DROPPABLE_KEY: string = 'toolboxDataItem';
export const SILENT_KEY: string = '_#@';

export type FormMode = 'designer' | 'edit' | 'readonly';

export type ViewType = 'details' | 'table' | 'form' | 'blank' | 'masterDetails' | 'menu' | 'dashboard';

export type LabelAlign = 'left' | 'right';

export type VisibilityType = 'Yes' | 'No' | 'Removed';

/**
 * Component container
 */
export interface IFormComponentContainer {
  /** Unique Id of the component */
  id: string;
  /** Id of the parent component */
  parentId?: string;
}

export interface IComponentValidationRules {
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  message?: string;
  validator?: string;
}

export type ConfigurableFormComponentTypes =
  | 'alert'
  | 'address'
  | 'toolbar'
  | 'dropdown'
  | 'textField'
  | 'textField'
  | 'textArea'
  | 'iconPicker'
  | 'container'
  | 'collapsiblePanel'
  | 'autocomplete'
  | 'checkbox'
  | 'numberField'
  | 'sectionSeparator'
  | 'queryBuilder'
  | 'labelValueEditor';

/**
 * Base model of the configurable component
 */
export interface IConfigurableFormComponent extends IFormComponentContainer, IHasVersion {
  /** component name */
  name: string;

  /** The label for this field that will appear next to it. */
  label?: string;

  /** Type of the component */
  type: string;

  /** Description of the field, is used for tooltips */
  description?: string;

  /** Validation rules */
  validate?: IComponentValidationRules;

  /** Hidden field is still a part of the form but not visible on it */
  hidden?: boolean;

  /** Add an enhanced Visibility property to cater for the 3 options Yes (To display both to user and payload) No (To only display on the payload)  Removed (To remove from both user and payload) */
  visibility?: VisibilityType;

  /** Hide label of the field */
  hideLabel?: boolean;

  /** Position of the label */
  labelAlign?: LabelAlign;

  disabled?: boolean; // todo: move to the model level

  /** Custom visibility code */
  customVisibility?: string;

  /** Custom visibility code */
  customEnabled?: string;

  /** Default value of the field */
  defaultValue?: any;

  //#region runtime properties
  visibilityFunc?: (data: any) => boolean;

  //#region runtime properties
  enabledFunc?: (data: any) => boolean;
  /**/
  settingsValidationErrors?: IAsyncValidationError[];

  /** Custom onBlur handler */
  onBlurCustom?: string;

  /** Custom onChange handler */
  onChangeCustom?: string;

  /** Custom onFocus handler */
  onFocusCustom?: string;
  //#endregion

  /** Whether the component is read-only */
  readOnly?: boolean;

  /** Control size */
  size?: SizeType;

  /** If true, indicates that component is rendered dynamically and some of rules (e.g. visibility) shouldn't be applied to this component */
  isDynamic?: boolean;

  /**
   * This allows a component to display a quickview popover with entity details.
   * The quickview is only displayed in readonly mode
   */
  enableQuickview?: boolean;

  subscribedEventNames?: string[];
  dispatchedEventNames?: string[];
  dispatchedEventDebouncedMilliseconds?: number;
  style?: string;

  tooltip?: string;
}

export interface IComponentsContainer {
  id: string;
  components: IConfigurableFormComponent[];
}

export interface IComponentsDictionary {
  [index: string]: IConfigurableFormComponent;
}

export interface IComponentRelations {
  [index: string]: string[];
}

export interface IFlatComponentsStructure {
  allComponents: IComponentsDictionary;
  componentRelations: IComponentRelations;
}

export interface IFormProps extends IFlatComponentsStructure {
  id?: string;
  module?: string;
  name?: string;
  label?: string;
  description?: string;
  formSettings: IFormSettings;
}

export declare type StoreValue = any;
export interface Store {
  [name: string]: StoreValue;
}

export interface FormMarkupWithSettings {
  formSettings: IFormSettings;
  components: IConfigurableFormComponent[];
}
export type FormRawMarkup = IConfigurableFormComponent[];
export type FormMarkup =
  | FormRawMarkup
  | FormMarkupWithSettings
  | ((data: any) => FormRawMarkup | FormMarkupWithSettings);

export interface FormFullName {
  readonly name: string;
  readonly module?: string;
  readonly version?: number;
}
export type FormUid = string;
export type FormIdentifier = FormFullName | FormUid;

export interface IConfigurableFormBaseProps {
  formId?: FormIdentifier;
  markup?: FormMarkup;
  formProps?: IPersistedFormProps;
}

export type FormAction = (values?: any, parameters?: any) => void;

export type FormSection = (data?: any) => ReactNode;

export interface IFormActionDesc {
  url: string;
  params: any;
}

export interface IFormActions {
  [key: string]: FormAction;
}

export interface IFormSections {
  [key: string]: FormSection;
}

/** Form action available in the designer */
export interface IFormAction {
  /** Action owner (id of the owner component or null - form) */
  owner?: string;
  /** Action name */
  name: string;
  /** Action body */
  body: (values?: any, parameters?: any) => void;
}

/** Form section available in the designer */
export interface IFormSection {
  /** Action owner (id of the owner component or null - form) */
  owner?: string;
  /** Action name */
  name: string;
  /** Action body */
  body: (data?: any) => ReactNode;
}

/**
 * Form DTO
 */
export interface FormDto {
  id?: string;
  /**
   * Form name
   */
  name?: string;

  /**
   * Module
   */
  module?: string;
  /**
   * Form label
   */
  label?: string | null;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Form markup (components) in JSON format
   */
  markup?: string | null;
  /**
   * Type of the form model
   */
  modelType?: string | null;
  /**
   * Type
   */
  type?: string | null;

  versionNo?: number;
  versionStatus?: number;
  isLastVersion?: boolean;
}

export interface IFormDto extends Omit<FormDto, 'markup'> {
  markup: FormRawMarkup;
  settings: IFormSettings;
}

export interface IFormValidationRulesOptions {
  formData?: any;
}

export interface IFormSettings {
  modelType?: string;
  postUrl?: string;
  putUrl?: string;
  deleteUrl?: string;
  getUrl?: string;
  layout: FormLayout;
  colon: boolean;
  labelCol: ColProps;
  wrapperCol: ColProps;
  showModeToggler?: boolean;
  preparedValues?: string;
  size?: SizeType;
  formKeysToPersist?: string[];
  fieldsToFetch?: string[];
  excludeFormFieldsInPayload?: string;
  uniqueFormId?: string;
  onDataLoaded?: string;
  onInitialized?: string;
  onUpdate?: string;
  initialValues?: IKeyValue[];
}

/** Default form settings */
export const DEFAULT_FORM_SETTINGS: IFormSettings = {
  layout: 'horizontal',
  colon: true,
  labelCol: { span: 5 },
  wrapperCol: { span: 13 },
};

export type ActionParametersJs = string;
export type ActionParametersDictionary = [{ key: string; value: string }];
export type ActionParameters = ActionParametersJs | ActionParametersDictionary;
export type ActionArguments = { [key: string]: any };
export type GenericDictionary = { [key: string]: any };
