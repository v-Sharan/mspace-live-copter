import React, { useRef } from 'react';
import MapView from './map';
import VideoComponent from './VideoComponent';

const MapViewWithLog = () => {
  const videoRef = useRef(null);
  return (
    <div style={{ height: '100%' }}>
      <video
        src='https://archive.org/download/ElephantsDream/ed_hd.ogv'
        controls
        ref={videoRef}
        style={{ height: '100%' }}
      />
      <MapView />
    </div>
  );
};

export default MapViewWithLog;
