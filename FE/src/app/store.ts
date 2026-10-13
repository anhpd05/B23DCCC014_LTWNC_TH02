import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Reducer, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import assignmentsReducer from '../features/assignments/assignmentsSlice';
import type { AssignmentsState } from '../features/assignments/assignmentsSlice';
import { IS_DEV } from '../shared/env';

export interface RootState {
  assignments: AssignmentsState;
}

const rootReducer: Reducer<RootState, UnknownAction, Partial<RootState>> = combineReducers({
  assignments: assignmentsReducer,
});

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      IS_DEV
        ? getDefaultMiddleware().concat(createLogger({ collapsed: false }))
        : getDefaultMiddleware(),
  });
}

export type AppDispatch = ThunkDispatch<RootState, undefined, UnknownAction>;
