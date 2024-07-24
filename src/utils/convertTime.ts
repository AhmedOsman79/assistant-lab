import * as moment from 'moment';

export const formatTime = (time: string) => {
  // time will be like 15:40:20 or 15:00
  return moment(time, 'HH:mm').format('h:mm A'); // will give something like 3:30 PM
};
