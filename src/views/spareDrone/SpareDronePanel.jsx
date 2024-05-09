import React, { useState } from 'react';
import {
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';
import { getCurrentServerState } from '~/features/servers/selectors';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
import { connect } from 'react-redux';
import store from '~/store';
import messageHub from '~/message-hub';
import { ConnectionState } from '~/model/enums';

const SpareDronePanel = ({ connectionState }) => {
  let uavList = ['01', '02'];
  const [data, setData] = useState({
    uav: 0,
    mission: 0,
  });

  const uploadMission = async () => {
    if (connectionState != ConnectionState.CONNECTED) {
      store.dispatch(
        showNotification({
          message: "Server isn't Connected",
          semantics: MessageSemantics.ERROR,
        })
      );
      return;
    }
    try {
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: 'sparedrone',
        ...data,
      });
      if (Boolean(res.body.message)) {
        store.dispatch(
          showNotification({
            message: `Spare Drone Mission ${data.uav} Message sent`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      }
    } catch (e) {
      store.dispatch(
        showNotification({
          message: `Spare Drone Mission ${data.uav} Command is Failed`,
          semantics: MessageSemantics.ERROR,
        })
      );
    }
  };

  return (
    <Box
      style={{
        margin: 10,
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FormControl variant='standard' fullWidth>
        <InputLabel style={{ padding: 5 }} htmlFor='uavs-spare-drone'>
          Uavs
        </InputLabel>
        <Select
          disabled={uavList?.length === 0}
          value={data.uav}
          name='uav'
          variant='filled'
          inputProps={{ id: 'uavs-spare-drone' }}
          fullWidth
          onChange={({ target: { value, name } }) =>
            setData((prev) => {
              return { ...prev, [name]: value };
            })
          }
        >
          {uavList?.length != 0 &&
            uavList?.map((uavid) => (
              <MenuItem value={uavid}>{Number(uavid)}</MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl variant='standard' fullWidth>
        <InputLabel htmlFor='mission-spare-drone' style={{ padding: 5 }}>
          Mission
        </InputLabel>
        <Select
          disabled={uavList?.length === 0}
          value={data.mission}
          name='mission'
          variant='filled'
          inputProps={{ id: 'mission-spare-drone' }}
          fullWidth
          onChange={({ target: { value, name } }) =>
            setData((prev) => {
              return { ...prev, [name]: value };
            })
          }
        >
          {uavList?.length != 0 &&
            uavList?.map((uavid) => (
              <MenuItem value={uavid}>{Number(uavid)}</MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl variant='standard' fullWidth>
        <Button
          disabled={!(data.uav && data.mission)}
          variant='contained'
          onClick={uploadMission}
        >
          Start
        </Button>
      </FormControl>
    </Box>
  );
};

export default connect(
  // mapStateToProps
  (state) => ({
    // uavList: getUAVIdList(state),
    connectionState: getCurrentServerState(state).state,
  }),
  // mapDispatchToProps
  (dispatch) => ({})
)(SpareDronePanel);
