import { createContext } from 'react';
import { IProperty } from './models';

export interface IQueryBuilderStateContext {
  fields: IProperty[];
  id?: string;
}

export interface IQueryBuilderActionsContext {
  setFields: (fields: IProperty[]) => void;
  fetchFields: (fieldNames: string[]) => void;

  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const QUERY_BUILDER_CONTEXT_INITIAL_STATE: IQueryBuilderStateContext = {
  fields: [],
};

export const QueryBuilderStateContext = createContext<IQueryBuilderStateContext>(QUERY_BUILDER_CONTEXT_INITIAL_STATE);

export const QueryBuilderActionsContext = createContext<IQueryBuilderActionsContext>(undefined);
