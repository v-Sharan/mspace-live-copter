import React, { useRef, useState, useEffect } from 'react';
import {
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@material-ui/core';
import { getCurrentServerState } from '~/features/servers/selectors';
import { connect } from 'react-redux';
import { getMissionState } from '~/utils/messaging';
import {
  requestRemovalOfUAVsByIds,
  requestRemovalOfUAVsMarkedAsGone,
} from '~/features/uavs/actions';
import { openUAVDetailsDialog } from '~/features/uavs/details';
import { bindActionCreators } from 'redux';
import {
  updateUavNumberToMission,
  updateMissionNumberToMission,
} from '~/features/uav-control/slice';
import { getUAVIdList, getSelectedUAVIds } from '~/features/uavs/selectors';
import { createUAVOperationThunks } from '~/utils/messaging';
import { getPreferredCommunicationChannelIndex } from '~/features/mission/selectors';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
import { isBroadcast } from '~/features/session/selectors';

const SpareDronePanel = ({
  uavList,
  uav,
  mission,
  updateUav,
  updateMission,
  dispatch,
}) => {
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
    uploadMission,
  } = bindActionCreators(
    createUAVOperationThunks({
      getTargetedUAVIds(state) {
        return isBroadcast(state)
          ? getUAVIdList(state)
          : getSelectedUAVIds(state);
      },

      getTransportOptions(state) {
        const result = {
          channel: getPreferredCommunicationChannelIndex(state),
        };
        const broadcast = isBroadcast(state);

        if (broadcast) {
          result.broadcast = true;
          result.ignoreIds = true;
        }

        return result;
      },
    }),
    dispatch
  );
  const videoRef = useRef(null);

  // useEffect(() => {
  //   const enableVideoStream = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       });
  //       videoRef.current.srcObject = stream;
  //     } catch (err) {
  //       console.error('Error accessing webcam:', err);
  //     }
  //   };

  //   enableVideoStream();

  //   return () => {
  //     // Clean up by stopping the video stream when the component unmounts
  //     if (videoRef.current.srcObject) {
  //       const stream = videoRef.current.srcObject;
  //       const tracks = stream.getTracks();

  //       tracks.forEach((track) => {
  //         track.stop();
  //       });
  //     }
  //   };
  // }, []);

  return (
    // <Box
    //   style={{
    //     margin: 10,
    //     display: 'flex',
    //     flexDirection: 'row',
    //     gap: 15,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //   }}
    // >
    //   <FormControl variant='standard' fullWidth>
    //     <InputLabel style={{ padding: 5 }} htmlFor='uavs-spare-drone'>
    //       Uavs
    //     </InputLabel>
    //     <Select
    //       disabled={uavList?.length === 0}
    //       value={uav}
    //       variant='filled'
    //       inputProps={{ id: 'uavs-spare-drone' }}
    //       fullWidth
    //       onChange={({ target: { value } }) => updateUav(value)}
    //     >
    //       {uavList?.length != 0 &&
    //         uavList?.map((uavid) => (
    //           <MenuItem value={uavid}>{Number(uavid)}</MenuItem>
    //         ))}
    //     </Select>
    //   </FormControl>
    //   <FormControl variant='standard' fullWidth>
    //     <InputLabel htmlFor='mission-spare-drone' style={{ padding: 5 }}>
    //       Mission
    //     </InputLabel>
    //     <Select
    //       disabled={uavList?.length === 0}
    //       value={mission}
    //       variant='filled'
    //       inputProps={{ id: 'mission-spare-drone' }}
    //       fullWidth
    //       onChange={({ target: { value } }) => updateMission(value)}
    //     >
    //       {uavList?.length != 0 &&
    //         uavList?.map((uavid) => (
    //           <MenuItem value={uavid}>{Number(uavid)}</MenuItem>
    //         ))}
    //     </Select>
    //   </FormControl>
    //   <FormControl variant='standard' fullWidth>
    //     <Button
    //       disabled={!(uav && mission)}
    //       variant='contained'
    //       onClick={uploadMission}
    //     >
    //       Upload Mission and Start
    //     </Button>
    //   </FormControl>
    // </Box>
    // <video controls autoPlay>
    //   <source
    //     src='https://www.youtube.com/embed/K4TOrB7at0Y?si=1eCoC2iupa2GY5jE'
    //     type='multipart/x-mixed-replace; boundary=frame'
    //   />
    // </video>
    <iframe
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: '100%',
        height: '100%',
      }}
      src='http://192.168.0.127:5000/video_feed'
      title='YouTube video player'
      frameborder='0'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      referrerpolicy='strict-origin-when-cross-origin'
      allowfullscreen
    ></iframe>
  );
};

export default connect(
  // mapStateToProps
  (state) => ({
    connectionState: getCurrentServerState(state).state,
    ...getMissionState(state),
    uavList: getUAVIdList(state),
  }),
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
    updateUav(UavNum) {
      dispatch(updateUavNumberToMission(UavNum));
    },
    updateMission(MissionNum) {
      dispatch(updateMissionNumberToMission(MissionNum));
    },
  })
  // (dispatch) => ({
  //   ...bindActionCreators(
  //     {
  //       openUAVDetailsDialog,
  //       requestRemovalOfUAVsMarkedAsGone,
  //       requestRemovalOfUAVsByIds,
  //     },
  //     dispatch
  //   ),
  //   dispatch,
  //   updateUav(UavNum) {
  //     dispatch(updateUavNumberToMission(UavNum));
  //   },
  //   updateMission(MissionNum) {
  //     dispatch(updateMissionNumberToMission(MissionNum));
  //   },
  // })
)(SpareDronePanel);

// export default connect(
//   // mapStateToProps
//   (state) => ({
//     alt: getTakeOff(state),
//   }),
//   // mapDispatchToProps
//   (dispatch) => ({
//     ...bindActionCreators(
//       {
//         openUAVDetailsDialog,
//         requestRemovalOfUAVsMarkedAsGone,
//         requestRemovalOfUAVsByIds,
//       },
//       dispatch
//     ),
//     dispatch,
// TakeoffChangeFunc(alt) {
//   dispatch(changeTakeOffAlt(alt));
// },
//   })
// )(withTranslation()(UAVOperationsButtonGroup));
