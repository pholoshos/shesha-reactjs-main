import { IStoredFileStateContext } from './contexts';
import { StoredFileActionEnums } from './actions';
import flagsReducer from '../utils/flagsReducer';

export function storedFilesReducer(
  incomingState: IStoredFileStateContext,
  action: ReduxActions.Action<IStoredFileStateContext>
): IStoredFileStateContext {
  //#region Register flags reducer
  const state = flagsReducer(incomingState, action);

  const { type, payload } = action;
  //#endregion

  switch (type) {
    case StoredFileActionEnums.DownloadFileRequest:
    case StoredFileActionEnums.DownloadFileSuccess:
    case StoredFileActionEnums.DownloadFileError:
    case StoredFileActionEnums.FetchFileInfoSuccess:
    case StoredFileActionEnums.DeleteFileRequest:
    case StoredFileActionEnums.DeleteFileError:
    case StoredFileActionEnums.FetchFileInfoRequest:
    case StoredFileActionEnums.FetchFileInfoError:
    case StoredFileActionEnums.UploadFileRequest:
    case StoredFileActionEnums.UploadFileSuccess:
    case StoredFileActionEnums.UploadFileError:
      /* NEW_ACTION_ENUM_GOES_HERE */

      return {
        ...state,
        ...payload,
      };

    case StoredFileActionEnums.DeleteFileSuccess: {
      return {
        ...state,
        fileInfo: null,
      };
    }

    default: {
      return state;
    }
  }
}
