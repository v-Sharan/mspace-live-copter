import dc8 from '~/skyc/dc-8.json';
import dc10 from '~/skyc/dc-10.json';
import dc5Runway from '~/skyc/dc-5-runway.json';
export const details = [
  {
    id: 1,
    takeoffPosition: [1, 2, 3, 4, 5],
    value: 'tambaram',
    name: 'Tambaram',
    options: [
      {
        name: 'All',
        number_od_drones: [6, 7, 8, 9, 10],
      },
      {
        name: 'TaxiWay',
        number_od_drones: [6, 7, 8, 9, 10],
      },
      {
        name: 'Runway',
        number_od_drones: [6, 7, 8, 9, 10],
      },
      {
        name: 'Apron',
        number_od_drones: [6, 7, 8, 9, 10],
      },
    ],
  },
  {
    id: 2,
    takeoffPosition: [1, 2, 3, 4],
    value: 'sholavaram',
    name: 'Sholavaram',
    options: [
      {
        name: 'All',
        number_od_drones: [6, 7, 8, 9, 10],
      },
      {
        name: 'TaxiWay',
        number_od_drones: [6, 7, 8, 9, 10],
      },
      {
        name: 'Runway',
        number_od_drones: [6, 7, 8, 9, 10],
      },
      {
        name: 'Apron',
        number_od_drones: [6, 7, 8, 9, 10],
      },
    ],
  },
  {
    id: 3,
    takeoffPosition: [1, 2],
    value: 'dc',
    name: 'DC',
    options: [
      {
        name: 'DC Grid',
        number_of_drones: [
          {
            num: 8,
            time: '13min 14sec',
            file: dc8,
          },
          {
            num: 10,
            time: '11min 44sec',
            file: dc10,
          },
        ],
      },
      {
        name: 'Runway',
        number_of_drones: [
          {
            num: 10,
            time: '10 min',
          },
          {
            num: 8,
            time: '10 min',
            file: dc8,
          },
          {
            num: 5,
            time: '23 min',
            file: dc5Runway,
          },
        ],
      },
    ],
  },
];
