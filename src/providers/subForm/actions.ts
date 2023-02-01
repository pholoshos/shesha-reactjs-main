import { createAction } from 'redux-actions';
import { FormMarkupWithSettings } from '../form/models';

export enum SubFormActionEnums {
  SetMarkupWithSettings = 'SET_MARKUP_WITH_SETTINGS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setMarkupWithSettingsAction = createAction<FormMarkupWithSettings, FormMarkupWithSettings>(
  SubFormActionEnums.SetMarkupWithSettings,
  p => p
);

/* NEW_ACTION_GOES_HERE */
