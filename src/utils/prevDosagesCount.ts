import * as moment from 'moment-timezone';
import { DEFAULT_TIMEZONE } from '@/constants';

export const getPreDosagesCount = (
  medicine,
  currentDate: moment.Moment,
  timezone = DEFAULT_TIMEZONE,
) => {
  // -------------- get the first dosage order of the day --------------
  const dosagesPerDay = parseInt(medicine.dosagePerDay);
  const hoursBetweenDosages = 24 / dosagesPerDay;
  // each loop is a medicine day and some number of gap days
  const loopDays = medicine.gapInDays + 1;

  const kickStartOfTheCourse = moment.tz(medicine.startDatetime, timezone);

  const hoursSinceStart = currentDate.diff(kickStartOfTheCourse, 'hours');

  // this number will be a constant for each medicine
  // if the medicine has no gap days it will be 24 hours
  const fullLoopHours = loopDays * 24;

  // we want to know how many loops have passed since the start of the course
  // it can be 1.5 , 1.7 or 2
  const loopsCount = hoursSinceStart / fullLoopHours;

  // each loop has a specific number of dosages which is the dosages per day stored in the db
  // we want  to get the number of dosages in the full loops
  const prevDosagesCountInCompleteLoop = Math.floor(loopsCount) * dosagesPerDay;

  // get the rate of the medicine day to the gap days
  // we want to divide the medicine day to the total number of days in the loop
  const takesToGaps = 1 / loopDays;

  // we now will get the decimal part of the full loops count
  // so the fullLoopsCount can be as we said 1.5 and now we will get this .5 part
  // to get the dosages number in this part
  const inCompleteLoop = loopsCount % 1;

  let dosgesCountInIncompleteLoop = 0;

  // if the loop part is bigger than the rate of the medicine day to the gap days
  // then that means this part is a medicine day and gap days (of course these gap days are not complete)
  // then we will add the full dosages count in each loop which is the dosages per day

  // if not that means this part is a part of one medicine day (please note the medicine day doesn't have to be a calender day it can be 12 hours of some day and another 12 hours of the next day because the medicine can start say at 4 pm so the medicine day will be over at 4 pm of the next day)
  // so we will get the number of hours in this part and divide it by the hours between dosages to get the number of dosages in this part
  if (inCompleteLoop > takesToGaps) {
    dosgesCountInIncompleteLoop += dosagesPerDay;
  } else {
    dosgesCountInIncompleteLoop += Math.ceil(
      (inCompleteLoop * fullLoopHours) / hoursBetweenDosages,
    );
  }

  // now we can get the total dosages count by adding the dosages count in the full loops and the dosages count in the incomplete loop
  const totlaDosagesCount =
    prevDosagesCountInCompleteLoop + dosgesCountInIncompleteLoop;
  return totlaDosagesCount;
};
