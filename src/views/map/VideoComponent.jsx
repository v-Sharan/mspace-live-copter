import React, { useEffect, useRef } from 'react';
import store from '~/store';
import { showNotification } from '~/features/snackbar/slice';
import { MessageSemantics } from '~/features/snackbar/types';
// import VideoSample from '~/../assets/sample.mp4';

const VideoComponent = ({ handleTime }) => {
  const videoRef = useRef(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      handleTime(parseInt(videoRef.current?.currentTime));
    }
  };

  return (
    <div style={{ width: '50%', height: '100%' }}>
      <video
        src={require('../../../assets/sample.mp4')}
        controls
        ref={videoRef}
        style={{ height: '100%' }}
        onTimeUpdate={handleTimeUpdate}
        onSeeking={handleTimeUpdate}
      />
    </div>
  );
};

export default VideoComponent;
