import React, { useEffect, useState } from 'react';
import config from 'config';
import {
  InputLabel,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  RadioGroup,
  Radio,
  MenuItem,
  Box,
  Select,
  Input,
} from '@material-ui/core';

const StrikePanel = () => {
  const [MSG, setMSG] = useState({
    id: 1,
    latitude: 0.0,
    longitude: 0.0,
    withRTL: false,
  });

  const url = config['strike_url'];

  return (
    <Box style={{ margin: 10, gap: 20 }}>
      <FormGroup>
        <Box style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <FormControl fullWidth variant='standard'>
            <InputLabel id='drone-id'>Choose Drone:</InputLabel>
            <Select
              style={{ padding: 5 }}
              value={MSG.id}
              labelId='drone-id'
              onChange={({ target: { value } }) =>
                setMSG((prev) => {
                  return { ...prev, id: value };
                })
              }
            >
              {url?.length != 0 &&
                url.map((item) => (
                  <MenuItem value={item.id}>{item.id}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl fullWidth variant='standard'>
            <InputLabel id='drone-id'>Target Latitude:</InputLabel>
            <Input
              style={{ padding: 5 }}
              type='number'
              value={MSG.latitude}
              onChange={({ target: { value } }) =>
                setMSG((prev) => {
                  return { ...prev, latitude: value };
                })
              }
            />
          </FormControl>
        </Box>
        <FormControl fullWidth variant='standard'>
          <InputLabel id='drone-id'>Target Longitude:</InputLabel>
          <Input
            style={{ padding: 5 }}
            type='number'
            value={MSG.longitude}
            onChange={({ target: { value } }) =>
              setMSG((prev) => {
                return { ...prev, longitude: value };
              })
            }
          />
        </FormControl>
      </FormGroup>
    </Box>
  );
};

export default StrikePanel;

{
  /*
drone number --> done
heading,height
target lat,lon
with RTL,without RTL
Strike
Abort mission
*/
}
