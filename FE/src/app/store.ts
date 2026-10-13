import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Reducer, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import assignmentsReducer from '../features/assignments/assignmentsSlice';
import type { AssignmentsState } from '../features/assignments/assignmentsSlice';

export interface RootState {
  assignments: AssignmentsState;
}

// Annotation `Reducer<RootState>` buộc interface khớp reducer thật: lệch là lỗi biên dịch.
const rootReducer: Reducer<RootState, UnknownAction, Partial<RootState>> = combineReducers({
  assignments: assignmentsReducer,
});

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({ reducer: rootReducer, preloadedState });
}

export type AppDispatch = ThunkDispatch<RootState, undefined, UnknownAction>;
