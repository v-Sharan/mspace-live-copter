import React, { useEffect, useRef } from 'react';
import store from '~/store';
const { dispatch } = store;

const VideoComponent = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log(videoRef.current?.currentTime);
  }, [videoRef.current?.currentTime]);

  // dispatch()

  return (
    <div style={{ width: '50%', height: '100%' }}>
      <video
        src='https://archive.org/download/ElephantsDream/ed_hd.ogv'
        controls
        ref={videoRef}
        style={{ height: '100%' }}
      />
    </div>
  );
};

export default VideoComponent;
