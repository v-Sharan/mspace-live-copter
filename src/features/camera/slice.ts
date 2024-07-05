/**
 * @file Slice of the state object that handles the contents of the log window.
 */

import isNil from 'lodash-es/isNil';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
// import { type ReadonlyDeep } from 'type-fest';

type cameraActionsType = {
  isConnected: boolean;
  cameraIds: string[] | [];
};

const initialState: cameraActionsType = {
  isConnected: false,
  cameraIds: [],
};

const { actions, reducer } = createSlice({
  name: 'cameraActions',
  initialState,
  reducers: {
    setCameraIds: (state, action: PayloadAction<string[] | []>) => {
      state.cameraIds = action.payload;
    },
    setCameraConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
});

export const { setCameraIds, setCameraConnected } = actions;

export default reducer;
