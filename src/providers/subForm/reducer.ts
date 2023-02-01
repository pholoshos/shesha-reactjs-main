import { ISubFormStateContext } from './contexts';
import { SubFormActionEnums } from './actions';

export function uiReducer(
  state: ISubFormStateContext,
  action: ReduxActions.Action<ISubFormStateContext>
): ISubFormStateContext {
  //#region Register flags reducer

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case SubFormActionEnums.SetMarkupWithSettings:
      const { components, formSettings } = payload || {};
      
      return {
        ...state,
        components,
        formSettings,
      };

    default: {
      return state;
    }
  }
}
