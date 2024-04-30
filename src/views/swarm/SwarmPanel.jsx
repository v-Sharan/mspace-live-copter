import PropTypes from 'prop-types';
import { Button, Box } from '@material-ui/core';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
import { connect } from 'react-redux';
import store from '~/store';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import {
  requestRemovalOfUAVsByIds,
  requestRemovalOfUAVsMarkedAsGone,
} from '~/features/uavs/actions';
import { openUAVDetailsDialog } from '~/features/uavs/details';
import { createUAVOperationThunks } from '~/utils/messaging';
import { getPreferredCommunicationChannelIndex } from '~/features/mission/selectors';
import messageHub from '~/message-hub';

const SwarmPanel = ({
  broadcast,
  dispatch,
  hideSeparators,
  openUAVDetailsDialog,
  requestRemovalOfUAVsByIds,
  requestRemovalOfUAVsMarkedAsGone,
  selectedUAVIds,
  size,
  startSeparator,
  t,
}) => {
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
    socket,
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

  const handleURL = async () => {
    const version = 12;
    try {
      const res = await messageHub.sendMessage({
        type: 'X-UAV-socket',
        message: 'Start',
      });
      store.dispatch(
        showNotification({
          message: `Message ${res}`,
          semantics: semantics.SUCCESS,
        })
      );
    } catch (e) {
      store.dispatch(
        showNotification({
          message: `Start Command is Failed`,
          semantics: semantics.ERROR,
        })
      );
    }
  };

  const handleTest = async () => {};

  const handleStopCapture = async () => {};

  const handleStartCapture = async () => {};

  // const handleLoadImage = () => {};

  return (
    <Box style={{ margin: 10, gap: 20 }}>
      <Box>
        <h3>Swarm</h3>
        <Button onClick={socket} variant='contained'>
          Test All Camera
        </Button>
        <Button onClick={handleURL} variant='contained'>
          Load Url
        </Button>
        <Button onClick={() => {}} variant='contained'>
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

SwarmPanel.propTypes = {
  broadcast: PropTypes.bool,
  dispatch: PropTypes.func,
  openUAVDetailsDialog: PropTypes.func,
  requestRemovalOfUAVsByIds: PropTypes.func,
  requestRemovalOfUAVsMarkedAsGone: PropTypes.func,
  selectedUAVIds: PropTypes.arrayOf(PropTypes.string),
  hideSeparators: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium']),
  startSeparator: PropTypes.bool,
  t: PropTypes.func,
};

export default connect(
  // mapStateToProps
  () => ({}),
  // mapDispatchToProps
  (dispatch) => ({
    ...bindActionCreators(
      {
        openUAVDetailsDialog,
        requestRemovalOfUAVsMarkedAsGone,
        requestRemovalOfUAVsByIds,
      },
      dispatch
    ),
    dispatch,
  })
)(withTranslation()(SwarmPanel));
