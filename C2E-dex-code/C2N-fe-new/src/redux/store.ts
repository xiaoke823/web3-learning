import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { ThunkAction, Action } from '@reduxjs/toolkit'
import createMiddleware from './middleware/clientMiddleware';
import reducer from './reducer'
import axios from '@src/api/axios'

export function createStore(history, client, data) {
  const middleware = [createMiddleware(client), thunk];

  let finalCreateStore;
  finalCreateStore = applyMiddleware(...middleware)(_createStore);
  const store = finalCreateStore(reducer, data);

  return store;
}


const store = createStore({}, axios, {});

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>

export default store
