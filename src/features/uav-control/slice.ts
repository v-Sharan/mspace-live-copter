/**
 * @file Slice of the state object that handles widgets and dialogs related to
 * the direct control of UAVs.
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type ReadonlyDeep, type SetOptional } from 'type-fest';

import { noPayload } from '~/utils/redux';

import { type FlyToTargetParameters } from './types';

type UAVControlSliceState = ReadonlyDeep<{
  flyToTargetDialog: {
    open: boolean;
    takeoffAlt: number;
    initialValues: FlyToTargetParameters;
  };
}>;

const initialState: UAVControlSliceState = {
  flyToTargetDialog: {
    open: false,
    takeoffAlt: 2.5,
    initialValues: {
      coords: '',
      mode: 'relative',
      altitude: 0,
    },
  },
};

const { actions, reducer } = createSlice({
  name: 'uavControl',
  initialState,
  reducers: {
    closeFlyToTargetDialog: noPayload<UAVControlSliceState>((state) => {
      state.flyToTargetDialog.open = false;
    }),

    changeTakeOffAlt(state, action) {
      console.log(action.payload);
      state.flyToTargetDialog.takeoffAlt = action.payload;
    },

    openFlyToTargetDialog(
      state,
      {
        payload: { coords, mode = 'ahl', altitude = 10 },
      }: PayloadAction<SetOptional<FlyToTargetParameters, 'mode' | 'altitude'>>
    ) {
      state.flyToTargetDialog.initialValues = { coords, mode, altitude };
      state.flyToTargetDialog.open = true;
    },
  },
});

export const {
  closeFlyToTargetDialog,
  openFlyToTargetDialog,
  changeTakeOffAlt,
} = actions;

export default reducer;
