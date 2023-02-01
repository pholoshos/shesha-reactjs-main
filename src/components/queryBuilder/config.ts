// For AntDesign widgets only:
import { Type, Config } from 'react-awesome-query-builder';
import AntdConfig from 'react-awesome-query-builder/lib/config/antd';
import EntityAutocompleteWidget from './widgets/entityAutocomplete';
import RefListDropdownWidget from './widgets/refListDropDown';
import DateTimeDynamicWidget from './widgets/dateTimeDynamic';
import moment from 'moment';
import EntityReferenceType from './types/entityReference';
import RefListType from './types/refList';
import DateTimeDynamicType from './types/dateTimeDynamic';

const setTypeOperators = (type: Type, operators: string[]): Type => {
  const result = {
    ...type, 
    operators: operators
  };
  return result;
}

const types = {
  ...AntdConfig.types,
  entityReference: EntityReferenceType,
  refList: RefListType,
  dateTimeDynamic: DateTimeDynamicType,
  text: setTypeOperators(AntdConfig.types.text, [
    'equal',
    'not_equal',
    'is_empty',
    'is_not_empty',
    'like',
    'not_like',
    'starts_with',
    'ends_with',
    //"proximity"
  ]),
};

const operators = {
  ...AntdConfig.operators,
  starts_with: {
    ...AntdConfig.operators.starts_with,
    jsonLogic: 'startsWith',
  },
  ends_with: {
    ...AntdConfig.operators.ends_with,
    jsonLogic: 'endsWith',
  },
};

const widgets = {
  ...AntdConfig.widgets,
  entityAutocomplete: EntityAutocompleteWidget,
  refListDropdown: RefListDropdownWidget,
  dateTimeDynamic: DateTimeDynamicWidget,
  datetime: {
    ...AntdConfig.widgets.datetime,
    timeFormat: 'HH:mm',
    jsonLogic: (val, _, wgtDef) => {
      return moment(val, wgtDef.valueFormat).format();
    },
  },
  date: {
    ...AntdConfig.widgets.date,
    jsonLogic: (val, _, wgtDef) => {
      return moment(val, wgtDef.valueFormat).format();
    },
  },
};

export const config: Config = {
  ...AntdConfig,
  // @ts-ignore
  types,
  operators,
  widgets, 
};