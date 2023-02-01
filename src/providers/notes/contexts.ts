import { createContext } from 'react';
import { NoteDto } from '../../apis/note';
import { IFlagsSetters, IFlagsState } from '../../interfaces';

export type IFlagProgressFlags = 'fetchNotes' | 'postNotes' | 'deleteNotes' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = 'fetchNotes' | 'postNotes' | 'deleteNotes' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = 'fetchNotes' | 'postNotes' | 'deleteNotes' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface INoteSettings {
  ownerId: string;
  ownerType: string;
  category?: number;
  allCategories?: boolean;
}

export interface INote extends NoteDto {}

export interface ICreateNotePayload {
  ownerId?: string;
  ownerType?: string;
  category?: number;
  priority?: number;
  parentId?: string;
  noteText: string;
  id?: string;
}

export interface INotesStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  notes?: INote[];
  newNotes?: ICreateNotePayload | INote;
  commentIdToBeDeleted?: string;
  errorInfo?: any;
  settings?: INoteSettings;
}

export interface INotesActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  fetchNotesRequest: () => void;
  postNotes: (payload: ICreateNotePayload) => void;
  deleteNotes: (selectedCommentId: string) => void;
  refreshNotes: () => void;
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const COMMENTS_CONTEXT_INITIAL_STATE: INotesStateContext = {
  isInProgress: {},
  succeeded: {},
  error: {},
  actioned: {},
  notes: [],
};

export const NotesStateContext = createContext<INotesStateContext>(COMMENTS_CONTEXT_INITIAL_STATE);

export const NotesActionsContext = createContext<INotesActionsContext>(undefined);
