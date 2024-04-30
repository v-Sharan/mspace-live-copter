import React, { useEffect, useState } from 'react';
import config from 'config';
import {
  InputLabel,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Button,
  Radio,
  MenuItem,
  Box,
  Select,
  Input,
  RadioGroup,
} from '@material-ui/core';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
import { openOnLoadImage } from '~/features/show/slice';
import { connect } from 'react-redux';
import store from '~/store';

const SwarmPanel = ({ onLoadImage }) => {
  const semantics = {
    SUCCESS: MessageSemantics.SUCCESS,
    INFO: MessageSemantics.INFO,
    ERROR: MessageSemantics.ERROR,
    WARNING: MessageSemantics.WARNING,
  };

  const {
    flashLight,
    holdPosition,
    land,
    reset,
    returnToHome,
    shutdown,
    sleep,
    takeOff,
    turnMotorsOff,
    turnMotorsOn,
    wakeUp,
    guided,
  } = bindActionCreators(
    createUAVOperationThunks({
      getTargetedUAVIds(state) {
        return broadcast ? getUAVIdList(state) : selectedUAVIds;
      },

      getTransportOptions(state) {
        const result = {
          channel: getPreferredCommunicationChannelIndex(state),
        };

        if (broadcast) {
          result.broadcast = true;
          result.ignoreIds = true;
        }

        return result;
      },
    }),
    dispatch
  );

  socket;

  const handleURL = () => {};

  const handleTest = async () => {};

  const handleStopCapture = async () => {};

  const handleStartCapture = async () => {};

  // const handleLoadImage = () => {};

  return (
    <Box style={{ margin: 10, gap: 20 }}>
      <Box>
        <h3>Swarm</h3>
        <Button onClick={handleTest} variant='contained'>
          Test All Camera
        </Button>
        <Button onClick={handleURL} variant='contained'>
          Load Url
        </Button>
        <Button onClick={onLoadImage} variant='contained'>
          Load Image
        </Button>
      </Box>
      <Button onClick={handleStartCapture} variant='contained'>
        Start Capture
      </Button>
      <Button onClick={handleStopCapture} variant='contained'>
        Stop Capture
      </Button>
    </Box>
  );
};

// export default connect({
//   onLoadImage: openOnLoadImage,
// })(CameraPanel);
export default connect(
  // mapStateToProps
  (state) => ({
    // status: getSetupStageStatuses(state).setupEnvironment,
    // secondaryText: getEnvironmentDescription(state),
  }),
  // mapDispatchToProps
  {
    onLoadImage: openOnLoadImage,
  }
)(SwarmPanel);
