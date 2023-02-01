import { IUiStateContext } from './contexts';
import { UiActionEnums } from './actions';
import flagsReducer from '../utils/flagsReducer';

export function uiReducer(
  incomingState: IUiStateContext,
  action: ReduxActions.Action<IUiStateContext>
): IUiStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case UiActionEnums.SetControlsSize:
    case UiActionEnums.ToggleModalInvisible:
    case UiActionEnums.ToggleRoleAppointmentVisible:
    case UiActionEnums.TogglePersonPickerVisible:
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };

    default: {
      return state;
    }
  }
}
