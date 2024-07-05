import React, { useEffect } from 'react';
import config from 'config';
import { Button, Box } from '@material-ui/core';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
import { openOnLoadImage } from '~/features/show/slice';
import { connect } from 'react-redux';
// import store from '~/store';
import { getCameraConnected } from '~/selectors/camera';
import messageHub from '~/message-hub';

const CameraPanel = ({ onLoadImage, isConnected, dispatch }) => {
  useEffect(() => {
    async () => {
      dispatch(
        showNotification({
          message: `${isConnected} Message sent`,
          semantics: MessageSemantics.SUCCESS,
        })
      );
    };
  }, []);

  const handleMsg = async (message) => {
    try {
      const res = await messageHub.sendMessage({
        type: 'X-CAMERA-ACTION',
        message,
      });
      if (Boolean(res?.body?.message)) {
        dispatch(
          showNotification({
            message: `${res?.body?.message}`,
            semantics: MessageSemantics.SUCCESS,
          })
        );
      }
    } catch (e) {
      dispatch(
        showNotification({
          message: `${message} Message sent`,
          semantics: MessageSemantics.SUCCESS,
        })
      );
    }
  };

  return (
    <Box style={{ margin: 10, gap: 20 }}>
      <Box>
        <h3>Camera Test</h3>
        <Button
          onClick={handleMsg.bind(this, 'start_capture')}
          variant='contained'
        >
          start Capture
        </Button>
        <Button
          onClick={handleMsg.bind(this, 'stop_Capture')}
          variant='contained'
        >
          stop Capture
        </Button>
        <Button onClick={handleMsg.bind(this, 'connect')} variant='contained'>
          Connect Camera
        </Button>
        <Button onClick={handleMsg.bind(this, 'test')} variant='contained'>
          Test Camera
        </Button>
        {/* <Button onClick={handleURL} variant='contained'>
          Load Url
        </Button>
        <Button onClick={onLoadImage} variant='contained'>
          Load Image
        </Button> */}
      </Box>
      {/* <Button onClick={handleStartCapture} variant='contained'>
        Start Capture
      </Button>
      <Button onClick={handleStopCapture} variant='contained'>
        Stop Capture
      </Button> */}
    </Box>
  );
};

export default connect(
  // mapStateToProps
  (state) => ({
    isConnected: getCameraConnected(state),
  }),
  // mapDispatchToProps
  (dispatch) => ({
    onLoadImage: openOnLoadImage,
    dispatch,
  })
)(CameraPanel);
