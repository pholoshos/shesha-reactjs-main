import { FormInstance } from 'antd';
import { MessageApi } from 'antd/lib/message';
import { AxiosInstance } from 'axios';
import { DOMAttributes } from 'react';
import { IAnyObject, IConfigurableFormComponent } from '../../..';
import { FormMode } from '../../../providers/form/models';
import { CustomLabeledValue } from '../../autocomplete';

export interface ICustomEventHandler {
  model: IConfigurableFormComponent;
  form: FormInstance;
  formData: any;
  formMode: FormMode;
  globalState: IAnyObject;
  http: AxiosInstance;
  message: MessageApi;
  moment: object;
}

export const onCustomEventsHandler = <FormCustomEvent = any>(
  event: FormCustomEvent,
  customEventAction: string,
  form: FormInstance,
  formData: any,
  formMode: FormMode,
  globalState: IAnyObject,
  http: AxiosInstance,
  message: MessageApi,
  moment: object
) => {
  /* tslint:disable:function-constructor */
  const eventFunc = new Function(
    'data',
    'event',
    'form',
    'formMode',
    'globalState',
    'http',
    'message',
    'moment',
    customEventAction
  );

  return eventFunc(formData, event, form, formMode, globalState, http, message, moment);
};

export const customEventHandler = <T = any>({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
}: ICustomEventHandler): DOMAttributes<T> => {
  const onCustomEvent = (event: any, key: string) =>
    onCustomEventsHandler(event, model?.[key], form, formData, formMode, globalState, http, message, moment);

  return {
    onBlur: event => onCustomEvent(event, 'onBlurCustom'),
    onChange: event => onCustomEvent(event, 'onChangeCustom'),
    onFocus: event => onCustomEvent(event, 'onFocusCustom'),
  };
};

export const customDateEventHandler = ({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
}: ICustomEventHandler) => ({
  onChange: (value: any | null, dateString: string | [string, string]) => {
    const eventFunc = new Function(
      'data, dateString, form, formMode, globalState, http, message, moment, value',
      model?.onChangeCustom
    );
    return eventFunc(formData, dateString, form, formMode, globalState, http, message, moment, value);
  },
});

export const customDropDownEventHandler = <T = any>({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
}: ICustomEventHandler) => ({
  onChange: (value: CustomLabeledValue<T>, option: any) => {
    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, option, value',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, formMode, globalState, http, message, moment, option, value);
  },
});

export const customInputNumberEventHandler = ({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
}: ICustomEventHandler) => ({
  onChange: (value: any) => {
    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, value',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, formMode, globalState, http, message, moment, value);
  },
});

export const customRateEventHandler = ({
  model,
  form,
  formData,
  formMode,
  globalState,
  http,
  message,
  moment,
}: ICustomEventHandler) => ({
  onChange: (value: number) => {
    const eventFunc = new Function(
      'data, form, formMode, globalState, http, message, moment, value',
      model?.onChangeCustom
    );

    return eventFunc(formData, form, formMode, globalState, http, message, moment, value);
  },
});
