import React, { FC, useReducer, useContext, PropsWithChildren, useRef } from 'react';
import appConfiguratorReducer from './reducer';
import {
  DEFAULT_ACCESS_TOKEN_NAME,
  DEFAULT_SHESHA_ROUTES,
  ISheshaRutes,
  SheshaApplicationActionsContext,
  SheshaApplicationStateContext,
  SHESHA_APPLICATION_CONTEXT_INITIAL_STATE,
} from './contexts';
import { RestfulProvider } from 'restful-react';
import IRequestHeaders from '../../interfaces/requestHeaders';
import { setBackendUrlAction, setHeadersAction } from './actions';
import { Router } from 'next/router';
import AuthProvider from '../auth';
import AuthorizationSettingsProvider from '../authorizationSettings';
import ShaRoutingProvider from '../shaRouting';
import { AppConfiguratorProvider } from '../appConfigurator';
import { DynamicModalProvider } from '../dynamicModal';
import { UiProvider } from '../ui';
import { MetadataDispatcherProvider } from '../metadataDispatcher';
import { IAuthProviderRefProps, IToolboxComponentGroup, ThemeProvider, ThemeProviderProps } from '../..';
import { ReferenceListDispatcherProvider } from '../referenceListDispatcher';
import { StackedNavigationProvider } from '../../pages/dynamic/navigation/stakedNavigation';
import ConditionalWrap from '../../components/conditionalWrapper';
import { ConfigurableActionDispatcherProvider } from '../configurableActionsDispatcher';
import { ApplicationActionsProcessor } from './configurable-actions/applicationActionsProcessor';
import { ConfigurationItemsLoaderProvider } from '../configurationItemsLoader';
import { FRONT_END_APP_HEADER_NAME } from './models';

export interface IShaApplicationProviderProps {
  backendUrl: string;
  applicationName?: string;
  accessTokenName?: string;
  router?: Router; // todo: replace with IRouter
  toolboxComponentGroups?: IToolboxComponentGroup[];
  unauthorizedRedirectUrl?: string;
  whitelistUrls?: string[];
  themeProps?: ThemeProviderProps;
  routes?: ISheshaRutes;
  noAuth?: boolean;
  /**
   * Unique identifier (key) of the front-end application, is used to separate some settings and application parts when use multiple front-ends
   */
  applicationKey?: string;
}

const ShaApplicationProvider: FC<PropsWithChildren<IShaApplicationProviderProps>> = props => {
  const {
    children,
    backendUrl,
    applicationName,
    applicationKey,
    accessTokenName,
    router,
    toolboxComponentGroups = [],
    unauthorizedRedirectUrl,
    whitelistUrls,
    themeProps,
    routes,
  } = props;
  const initialHeaders = applicationKey 
    ? {[FRONT_END_APP_HEADER_NAME]: applicationKey} 
    : {};
  const [state, dispatch] = useReducer(appConfiguratorReducer, {
    ...SHESHA_APPLICATION_CONTEXT_INITIAL_STATE,
    routes: routes ?? DEFAULT_SHESHA_ROUTES,
    backendUrl,
    applicationName,
    toolboxComponentGroups,
    applicationKey,
    httpHeaders: initialHeaders,
  });

  const authRef = useRef<IAuthProviderRefProps>();

  const setRequestHeaders = (headers: IRequestHeaders) => {
    dispatch(setHeadersAction(headers));
  };

  const changeBackendUrl = (newBackendUrl: string) => {
    dispatch(setBackendUrlAction(newBackendUrl));
  };

  const anyOfPermissionsGranted = (permissions: string[]) => {
    if (permissions?.length === 0) return true;

    const authorizer = authRef?.current?.anyOfPermissionsGranted;
    return authorizer && authorizer(permissions);
  };

  return (
    <SheshaApplicationStateContext.Provider value={state}>
      <SheshaApplicationActionsContext.Provider
        value={{
          changeBackendUrl,
          setRequestHeaders,
          // This will always return false if you're not authorized
          anyOfPermissionsGranted: anyOfPermissionsGranted, // NOTE: don't pass ref directly here, it leads to bugs because some of components use old reference even when authRef is updated
        }}
      >
        <RestfulProvider
          base={state.backendUrl}
          requestOptions={{
            headers: state.httpHeaders,
          }}
        >
          <ConfigurableActionDispatcherProvider>
            <UiProvider>
              <ShaRoutingProvider router={router}>
                <ConditionalWrap
                  condition={!props?.noAuth}
                  wrap={authChildren => (
                    <AuthProvider
                      tokenName={accessTokenName || DEFAULT_ACCESS_TOKEN_NAME}
                      onSetRequestHeaders={setRequestHeaders}
                      unauthorizedRedirectUrl={unauthorizedRedirectUrl}
                      whitelistUrls={whitelistUrls}
                      authRef={authRef}
                    >
                      <AuthorizationSettingsProvider>{authChildren}</AuthorizationSettingsProvider>
                    </AuthProvider>
                  )}
                >
                  <ConfigurationItemsLoaderProvider>
                    <ThemeProvider {...(themeProps || {})}>
                      <AppConfiguratorProvider>
                        <ReferenceListDispatcherProvider>
                          <MetadataDispatcherProvider>
                            <StackedNavigationProvider>
                              <DynamicModalProvider>
                                <ApplicationActionsProcessor>{children}</ApplicationActionsProcessor>
                              </DynamicModalProvider>
                            </StackedNavigationProvider>
                          </MetadataDispatcherProvider>
                        </ReferenceListDispatcherProvider>
                      </AppConfiguratorProvider>
                    </ThemeProvider>
                  </ConfigurationItemsLoaderProvider>
                </ConditionalWrap>
              </ShaRoutingProvider>
            </UiProvider>
          </ConfigurableActionDispatcherProvider>
        </RestfulProvider>
      </SheshaApplicationActionsContext.Provider>
    </SheshaApplicationStateContext.Provider>
  );
};

function useSheshaApplication(require: boolean = true) {
  const stateContext = useContext(SheshaApplicationStateContext);
  const actionsContext = useContext(SheshaApplicationActionsContext);

  if (require && (stateContext === undefined || actionsContext === undefined)) {
    throw new Error('useSheshaApplication must be used within a SheshaApplicationStateContext');
  }

  return { ...stateContext, ...actionsContext };
}

export { ShaApplicationProvider, useSheshaApplication };
