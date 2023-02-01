import { evaluateComplexStringWithResult } from './../form/utils';
import { ColumnSorting, IStoredFilter, ITableColumn, ITableFilter, SortDirection } from './interfaces';
import { IMatchData } from '../form/utils';
import moment, { Moment, isMoment, isDuration, Duration } from 'moment';
import { IDataTableUserConfig } from './contexts';

// Filters should read properties as camelCase ?:(
export const evaluateDynamicFilters = (filters: IStoredFilter[], mappings: IMatchData[]) => {
  if (filters?.length === 0 || !mappings?.length) return filters;

  return filters.map(filter => {
    const expressionString = JSON.stringify(filter?.expression);

    if (expressionString?.includes('{{')) {
      const { result, success, unevaluatedExpressions } = evaluateComplexStringWithResult(expressionString, mappings);

      return {
        ...filter,
        expression: JSON.parse(result),
        allFieldsEvaluatedSuccessfully: success,
        unevaluatedExpressions,
      };
    }

    return filter;
  });
};

export const hasDynamicFilter = (filters: IStoredFilter[]) => {
  if (filters?.length === 0) return false;

  const found = filters?.find(({ expression }) => {
    const _expression = typeof expression === 'string' ? expression : JSON.stringify(expression);

    return _expression?.includes('{{') && _expression?.includes('}}');
  });

  return Boolean(found);
};

export const sortDirection2ColumnSorting = (value?: SortDirection): ColumnSorting => {
  switch (value) {
    case 0:
      return 'asc';
    case 1:
      return 'desc';
    default:
      return null;
  }
};
export const columnSorting2SortDirection = (value?: ColumnSorting): SortDirection => {
  switch (value) {
    case 'asc':
      return 0;
    case 'desc':
      return 1;
    default:
      return null;
  }
};

const convertFilterValue = (value: any, column: ITableColumn): any => {
  switch (column?.dataType) {
    case 'date':
      return getMoment(value, ADVANCEDFILTER_DATE_FORMAT)?.format();
    case 'date-time':
      return getMoment(value, ADVANCEDFILTER_DATETIME_FORMAT)?.format();
    case 'time':
      return getDuration(value)?.asSeconds();
  }
  return value;
};

export const ADVANCEDFILTER_DATE_FORMAT = 'DD/MM/YYYY';
export const ADVANCEDFILTER_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const ADVANCEDFILTER_TIME_FORMAT = 'HH:mm';

export const getMoment = (value: any, format: string): Moment => {
  if (value === null || value === undefined) return undefined;

  if (isMoment(value)) return value;

  return moment(value as string, format).isValid() ? moment.utc(value as string, format) : undefined;
};

export const getDuration = (value: any): Duration => {
  if (value === null || value === undefined) return undefined;

  if (isDuration(value)) return value;

  const durationValue = moment.duration(value as string);
  return durationValue.isValid() ? durationValue : undefined;
};

export const advancedFilter2JsonLogic = (advancedFilter: ITableFilter[], columns: ITableColumn[]): object[] => {
  if (!advancedFilter || advancedFilter.length === 0) return null;

  const filterItems = advancedFilter
    .map(f => {
      const property = { var: f.columnId };
      const column = columns.find(c => c.id == f.columnId);

      const filterValues = Array.isArray(f.filter)
        ? f.filter.map(filterValue => convertFilterValue(filterValue, column))
        : convertFilterValue(f.filter, column);

      let filterOption = f.filterOption;
      if (!filterOption) {
        if (column.dataType === 'reference-list-item') filterOption = 'contains';
        if (column.dataType === 'entity') filterOption = 'equals';
        if (column.dataType === 'boolean') filterOption = 'equals';
      }

      switch (filterOption) {
        case 'equals':
          return {
            '==': [property, filterValues],
          };
        case 'contains':
          return column.dataType === 'string'
            ? { in: [filterValues, property] /* for strings arguments are reversed */ }
            : { in: [property, filterValues] };
        case 'greaterThan':
          return {
            '>': [property, filterValues],
          };
        case 'after':
          return {
            '>': [property, filterValues],
          };
        case 'lessThan':
          return {
            '<': [property, filterValues],
          };
        case 'before':
          return {
            '<': [property, filterValues],
          };
        case 'startsWith':
          return {
            startsWith: [property, filterValues],
          };
        case 'endsWith':
          return {
            endsWith: [property, filterValues],
          };
        case 'between':
          if (Array.isArray(filterValues) && filterValues.length == 2) {
            return {
              '<=': [filterValues[0], property, filterValues[1]],
            };
          } else console.error(`argument of the '${f.filterOption}' filter option must be an array with two values`);
      }

      console.error('operator is not supported: ' + f.filterOption);

      return null;
    })
    .filter(f => Boolean(f));

  return filterItems;
};

export const getIncomingSelectedStoredFilterIds = (filters: IStoredFilter[], id: string) => {
  const fallback = filters?.length ? [filters[0]?.id] : [];

  try {
    if (id && localStorage.getItem(id)) {
      const filter = (JSON.parse(localStorage.getItem(id)) as IDataTableUserConfig)?.selectedFilterIds;

      return filter?.length ? filter : fallback;
    }

    return fallback;
  } catch (_e) {
    return fallback;
  }
};
