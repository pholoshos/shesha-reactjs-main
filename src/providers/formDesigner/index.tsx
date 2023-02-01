import React, { FC, useContext, PropsWithChildren, useEffect, MutableRefObject } from 'react';
import formReducer from './reducer';
import {
    FormDesignerActionsContext,
    FormDesignerStateContext,
    UndoableFormDesignerStateContext,
    FORM_DESIGNER_CONTEXT_INITIAL_STATE,
    IComponentAddPayload,
    IComponentDeletePayload,
    IComponentUpdatePayload,
    IUpdateChildComponentsPayload,
    IFormDesignerStateContext,
    IFormDesignerActionsContext,
    IAddDataPropertyPayload,
    IComponentAddFromTemplatePayload,
    IComponentDuplicatePayload,
} from './contexts';
import {
    IFormSettings,
    IFlatComponentsStructure
} from '../form/models';
import { getFlagSetters } from '../utils/flagsSetters';
import {
    setReadOnlyAction,
    setFlatComponentsAction,
    componentAddAction,
    componentDeleteAction,
    componentDuplicateAction,
    componentUpdateAction,
    componentUpdateSettingsValidationAction,
    setDebugModeAction,
    startDraggingAction,
    endDraggingAction,
    updateChildComponentsAction,
    setValidationErrorsAction,
    setSelectedComponentAction,
    updateFormSettingsAction,
    addDataSourceAction,
    removeDataSourceAction,
    setActiveDataSourceAction,
    dataPropertyAddAction,
    componentAddFromTemplateAction,
} from './actions';
import {
    useFormDesignerComponentGroups,
    useFormDesignerComponents,
} from '../form/utils';
import { ActionCreators } from 'redux-undo';
import useThunkReducer from 'react-hook-thunk-reducer';
import {
    IAsyncValidationError,
    IFormValidationErrors,
    IToolboxComponent,
} from '../../interfaces';
import { IDataSource } from '../formDesigner/models';
import { useMetadataDispatcher } from '../../providers';

export interface IFormDesignerProviderProps {
    flatComponents: IFlatComponentsStructure;
    formSettings: IFormSettings;
    readOnly: boolean;
}

const FormDesignerProvider: FC<PropsWithChildren<IFormDesignerProviderProps>> = ({
    children,
    flatComponents,
    formSettings,
    readOnly,
}) => {
    const toolboxComponentGroups = useFormDesignerComponentGroups();
    const toolboxComponents = useFormDesignerComponents();

    const getToolboxComponent = (type: string) => toolboxComponents[type];

    const initial: IFormDesignerStateContext = {
        ...FORM_DESIGNER_CONTEXT_INITIAL_STATE,
        readOnly: readOnly,
        toolboxComponentGroups: toolboxComponentGroups,
        ...flatComponents,
        formSettings: formSettings,
    };

    const { activateProvider } = useMetadataDispatcher(false) ?? {};

    const [state, dispatch] = useThunkReducer(formReducer, {
        past: [],
        present: initial,
        future: [],
    });

    useEffect(() => {
        if (flatComponents && (flatComponents.allComponents !== state.present.allComponents || flatComponents.componentRelations !== state.present.componentRelations)) {
            setFlatComponents(flatComponents);
        }
    }, [flatComponents]);

    useEffect(() => {
        setReadOnly(readOnly);
    }, [readOnly]);

    /* NEW_ACTION_DECLARATION_GOES_HERE */

    const setReadOnly = (value: boolean) => {
        dispatch(setReadOnlyAction(value));
    };

    const addDataProperty = (payload: IAddDataPropertyPayload) => {
        dispatch(dataPropertyAddAction(payload));
    };

    const addComponent = (payload: IComponentAddPayload) => {
        dispatch(componentAddAction(payload));
    };

    const addComponentsFromTemplate = (payload: IComponentAddFromTemplatePayload) => {
        dispatch(componentAddFromTemplateAction(payload));
    };

    const deleteComponent = (payload: IComponentDeletePayload) => {
        dispatch(componentDeleteAction(payload));
    };

    const duplicateComponent = (payload: IComponentDuplicatePayload) => {
        dispatch(componentDuplicateAction(payload));
    };

    const getComponentModel = componentId => {
        return state.present.allComponents[componentId];
    };

    const updateComponent = (payload: IComponentUpdatePayload) => {
        dispatch(componentUpdateAction(payload));

        const component = getComponentModel(payload.componentId);
        const toolboxComponent = getToolboxComponent(component.type) as IToolboxComponent;
        if (toolboxComponent.validateSettings) {
            toolboxComponent
                .validateSettings(payload.settings)
                .then(() => {
                    dispatch(componentUpdateSettingsValidationAction({ componentId: payload.componentId, validationErrors: [] }));
                })
                .catch(({ errors }) => {
                    const validationErrors = errors as IAsyncValidationError[];
                    dispatch(
                        componentUpdateSettingsValidationAction({
                            componentId: payload.componentId,
                            validationErrors,
                        })
                    );
                });
        }
    };

    const getChildComponents = (componentId: string) => {
        const childIds = state.present.componentRelations[componentId];
        if (!childIds) return [];
        const components = childIds.map(childId => {
            return state.present.allComponents[childId];
        });
        return components;
    };

    const setFlatComponents = (flatComponents: IFlatComponentsStructure) => {
        dispatch((dispatchThunk, _getState) => {
            dispatchThunk(setFlatComponentsAction(flatComponents));
            dispatchThunk(ActionCreators.clearHistory());
          });
    };

    const setDebugMode = (isDebug: boolean) => {
        dispatch(setDebugModeAction(isDebug));
    };

    const startDragging = () => {
        dispatch(startDraggingAction());
    };

    const endDragging = () => {
        dispatch(endDraggingAction());
    };

    const setValidationErrors = (payload: IFormValidationErrors) => {
        dispatch(setValidationErrorsAction(payload));
    };

    const updateChildComponents = (payload: IUpdateChildComponentsPayload) => {
        dispatch(updateChildComponentsAction(payload));
    };

    const undo = () => {
        dispatch(ActionCreators.undo());
    };

    const redo = () => {
        dispatch(ActionCreators.redo());
    };

    const setSelectedComponent = (componentId: string, dataSourceId: string, componentRef?: MutableRefObject<any>) => {
        if (activateProvider) activateProvider(dataSourceId);
        dispatch(setSelectedComponentAction({ id: componentId, dataSourceId, componentRef }));
    };

    const updateFormSettings = (settings: IFormSettings) => {
        dispatch(updateFormSettingsAction(settings));
    };

    //#region move to designer
    const addDataSource = (dataSource: IDataSource) => {
        dispatch(addDataSourceAction(dataSource));
    };
    const removeDataSource = (datasourceId: string) => {
        dispatch(removeDataSourceAction(datasourceId));
    };

    const setActiveDataSource = (datasourceId: string) => {
        dispatch(setActiveDataSourceAction(datasourceId));
    };

    const getActiveDataSource = () => {
        return state.present.activeDataSourceId
            ? state.present.dataSources.find(ds => ds.id === state.present.activeDataSourceId)
            : null;
    };
    //#endregion

    const configurableFormActions: IFormDesignerActionsContext = {
        ...getFlagSetters(dispatch),
        addDataProperty,
        addComponent,
        addComponentsFromTemplate,
        deleteComponent,
        duplicateComponent,
        getComponentModel,
        updateComponent,
        getChildComponents,
        setDebugMode,
        startDragging,
        endDragging,
        setValidationErrors,
        updateChildComponents,
        undo,
        redo,
        setSelectedComponent,
        updateFormSettings,
        getToolboxComponent,
        addDataSource,
        removeDataSource,
        setActiveDataSource,
        getActiveDataSource,
        setReadOnly,
        /* NEW_ACTION_GOES_HERE */
    };

    return (
        <UndoableFormDesignerStateContext.Provider value={state}>
            <FormDesignerStateContext.Provider value={state.present}>
                <FormDesignerActionsContext.Provider value={configurableFormActions}>{children}</FormDesignerActionsContext.Provider>
            </FormDesignerStateContext.Provider>
        </UndoableFormDesignerStateContext.Provider>
    );
};

function useFormDesignerState(require: boolean = true) {
    const context = useContext(FormDesignerStateContext);

    if (require && context === undefined) {
        throw new Error('useFormDesignerState must be used within a FormDesignerProvider');
    }

    return context;
}

function useFormDesignerActions(require: boolean = true) {
    const context = useContext(FormDesignerActionsContext);

    if (require && context === undefined) {
        throw new Error('useFormDesignerActions must be used within a FormDesignerProvider');
    }

    return context;
}

function useUndoableState(require: boolean = true) {
    const context = useContext(UndoableFormDesignerStateContext);

    if (require && context === undefined) {
        throw new Error('useUndoableState must be used within a FormDesignerProvider');
    }

    return {
        canUndo: context.past.length > 0,
        canRedo: context.future.length > 0,
    };
}

function useFormDesigner(require: boolean = true) {
    const actionsContext = useFormDesignerActions(require);
    const stateContext = useFormDesignerState(require);
  
    // useContext() returns initial state when provider is missing
    // initial context state is useless especially when require == true
    // so we must return value only when both context are available
    return actionsContext !== undefined && stateContext !== undefined
      ? { ...actionsContext, ...stateContext, ...useUndoableState(require) }
      : undefined;
}

export { FormDesignerProvider, useFormDesignerState, useFormDesignerActions, useFormDesigner };
