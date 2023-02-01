import React, { FC, useContext, PropsWithChildren, useEffect } from 'react';
import metadataReducer from './reducer';
import {
  METADATA_CONTEXT_INITIAL_STATE,
  IMetadataStateContext,
  IMetadataActionsContext,
  IMetadataContext,
  MetadataContext,
} from './contexts';
import { setMetadataAction } from './actions';
import useThunkReducer from 'react-hook-thunk-reducer';
import { useMetadataDispatcher } from '../../providers';

export interface IMetadataProviderProps {
  id?: string;
  modelType: string;
}

const MetadataProvider: FC<PropsWithChildren<IMetadataProviderProps>> = ({ id, modelType, children }) => {
  const initial: IMetadataStateContext = {
    ...METADATA_CONTEXT_INITIAL_STATE,
    id,
    modelType,
  };

  const [state, dispatch] = useThunkReducer(metadataReducer, initial);

  // register provider in the dispatcher if exists
  const { registerProvider, getMetadata: fetchMeta } = useMetadataDispatcher();

  useEffect(() => {
    if (modelType)
      fetchMeta({ modelType }).then(meta => {
        dispatch(setMetadataAction({ metadata: meta }));
      });
  }, [modelType]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const getMetadata = () => {
    return fetchMeta({ modelType });
  };

  const metadataActions: IMetadataActionsContext = {
    /* NEW_ACTION_GOES_HERE */
    getMetadata,
  };

  const contextValue: IMetadataContext = { ...state, ...metadataActions };
  registerProvider({ id, modelType, contextValue });

  return <MetadataContext.Provider value={contextValue}>{children}</MetadataContext.Provider>;
};

function useMetadata(require: boolean) {
  const context = useContext(MetadataContext);

  if (context === undefined && require) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }

  return context;
}

export { MetadataProvider, useMetadata };
