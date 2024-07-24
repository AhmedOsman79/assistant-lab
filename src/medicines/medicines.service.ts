import { Injectable } from '@nestjs/common';
import { Medicines, Prisma } from '@prisma/client';
import * as moment from 'moment-timezone';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';
import { PrismaService } from '@/database/prisma.service';
import { localizePayload } from '@/utils/locallizePayload';
import { whenRequiredDosagePerDay } from './validation-schemas';
import { PauseMapValue, TodayMedicineType } from '@/types/medicine';
import {
  DEFAULT_TIMEZONE,
  Locale,
  MEDICINE_ALREADY_PAUSED,
  MEDICINE_NOT_PAUSED,
  MEDICINE_TAKEN_STATUS,
  SOON_MINUTES,
} from '@/constants';
import { ErrorResponse } from '@/common/response';
import { modelNames } from '@/constants/models';
import { longestConsecutiveIncrement } from '@/utils/longestConsecutiveIncrement';
import { pasueAndResumeDTO } from '@/interfaces';
import { BaseService } from '@/common/base';

@Injectable()
export class MedicinesService extends BaseService<
  Medicines,
  Prisma.MedicinesSelect,
  Prisma.MedicinesInclude
> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {
    super(prisma, modelNames.Medicines);
  }

  async create(userId: string, data) {
    const { image, ...createData } = data;
    const medicine = await this.prisma.medicines.create({
      data: {
        userId,
        ...createData,
        dosageSchedule: {},
      },
    });

    if (image) {
      const [, imageUrl] = await this.cloudinary.updateImageNoValidation(
        medicine.id,
        modelNames.Medicines,
        image,
      );
      medicine.image = imageUrl;
    }

    return medicine;
  }

  // private createMedicineSchadule(
  //   prevSchedule,
  //   commingDosageDate: moment.Moment,
  //   medicine: Medicines,
  // ) {
  //   const dosagesSchedule = [...prevSchedule];

  //   const { gapInDays, dosagePerDay, startDatetime } = medicine;

  //   const today = moment.tz();
  //   const nextDosageDate = commingDosageDate.clone().add(gapInDays + 1, 'day');
  //   const endCourse = this.getEndDate(moment.tz(startDatetime), medicine.days);
  //   const lastScheduleId = dosagesSchedule.length
  //     ? dosagesSchedule[dosagesSchedule.length - 1].id
  //     : 0;
  //   if (commingDosageDate.isAfter(endCourse)) return dosagesSchedule;

  //   if (commingDosageDate.isSameOrAfter(today)) {
  //     const whenRequired = dosagePerDay == whenRequiredDosagePerDay;
  //     if (!whenRequired) {
  //       const dosagePerDayNumber = isNumber(dosagePerDay)
  //         ? dosagePerDay
  //         : parseInt(dosagePerDay);
  //       const hoursBetweenDosages = 24 / dosagePerDayNumber;
  //       for (let i = 0; i < dosagePerDayNumber; i++) {
  //         dosagesSchedule.push({
  //           id: lastScheduleId + i + 1,
  //           datetime: commingDosageDate
  //             .clone()
  //             .add(hoursBetweenDosages * i, 'hours'),
  //           taken: false,
  //         });
  //       }
  //     }
  //   }

  //   return this.createMedicineSchadule(
  //     dosagesSchedule,
  //     nextDosageDate,
  //     medicine,
  //   );
  // }

  private getEndDate(start: moment.Moment, days: number) {
    return start.clone().add(days - 1, 'day'); // the -1 is because we count the start day
  }

  async getUserMedicines(userId: string, lang): Promise<Medicines[]> {
    const medicines = await this.prisma.medicines.findMany({
      where: { userId },
    });

    return medicines.map((m) => {
      m['isPaused'] = this.checkIfMedicineIsPaused(m);
      delete m.dosageSchedule;
      delete m.pauseMap;
      return localizePayload(m, lang);
    });
  }

  async getUserActiveMedicines(
    userId: string,
    date: string,
    lang,
    timezone,
  ): Promise<TodayMedicineType[]> {
    // Get active medicines based on startDatetime and days
    const activeMedicines = await this.prisma.medicines.findMany({
      where: {
        userId,
        days: { gt: 0 },
      },
      orderBy: { startDatetime: 'asc' },
    });

    return this.proccessMedicines(activeMedicines, date, lang, timezone);
  }

  async proccessMedicines(medicines, date, lang, timezone) {
    const currentDate = moment.tz(date, timezone);

    const medicinesByDate = medicines
      .filter((medicine) => {
        const { startDatetime, days } = medicine;

        const start = moment.tz(startDatetime, timezone);
        const endDate = this.getEndDate(start, days);

        const isCourseEnded = currentDate.isAfter(endDate);

        const didStarted = start.isSameOrBefore(
          currentDate.clone().add(1, 'day'),
        ); // add 1 day to count the start day as a medicine day so if the start date is 1/1/2021 and the current date is 1/1/2021 the medicine will be active

        const isWhenRequired =
          medicine.dosagePerDay === whenRequiredDosagePerDay;

        const isPaused = this.checkIfMedicineIsPaused(medicine);

        return !isCourseEnded && didStarted && !isWhenRequired && !isPaused;
      })
      .map((medicine) => {
        // -------------- get the first dosage order of the day --------------
        const dosagesPerDay = parseInt(medicine.dosagePerDay);
        const hoursBetweenDosages = 24 / dosagesPerDay;
        // each loop is a medicine day and some number of gap days
        const loopDays = medicine.gapInDays + 1;

        const kickStartOfTheCourse = moment.tz(
          medicine.startDatetime,
          timezone,
        );

        const hoursSinceStart = currentDate.diff(
          kickStartOfTheCourse,
          'hours',
          true,
        );

        // this number will be a constant for each medicine
        // if the medicine has no gap days it will be 24 hours
        const fullLoopHours = loopDays * 24;

        // we want to know how many loops have passed since the start of the course
        // it can be 1.5 , 1.7 or 2
        const fullLoopsCount = hoursSinceStart / fullLoopHours;

        // each loop has a specific number of dosages which is the dosages per day stored in the db
        // we want  to get the number of dosages in the full loops
        const prevDosagesCountInCompleteLoop =
          Math.floor(fullLoopsCount) * dosagesPerDay;

        // get the rate of the medicine day to the gap days
        // we want to divide the medicine day to the total number of days in the loop
        const takesToGaps = 1 / loopDays;

        // we now will get the decimal part of the full loops count
        // so the fullLoopsCount can be as we said 1.5 and now we will get this .5 part
        // to get the dosages number in this part
        const inCompleteLoop = fullLoopsCount % 1;

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

        // so the order of the first dosage this day will be the total dosages count + 1
        let order = totlaDosagesCount + 1;

        // order will be 0 or a negative number using this calculation if the current day is the first day of the course
        // so if it's the first day the order will be 1
        order = order <= 0 ? 1 : order;

        // -------------- get the date time by order --------------
        // get the number of full loops before the current order
        const fullLoops = Math.floor((order - 1) / dosagesPerDay);

        // get the number of gap days before the current order
        const gapDays = fullLoops * medicine.gapInDays;

        const orderInTheCurrentLoop = order - fullLoops * dosagesPerDay;

        // to calculate the days we can just add the full loops to the gap days
        // becuase each one full loop represent one medicine day and each loop has a specific gap days stored in the db
        const daysToAdd = fullLoops + gapDays;

        // we calculate the hours by the order in the current loop
        // so if the order is 1 we add 0 hours and if it is 2 we add 8 hours (suppose the hours between dosages is 8)
        const hoursToAdd = (orderInTheCurrentLoop - 1) * hoursBetweenDosages;

        const alarm = moment
          .tz(medicine.startDatetime, timezone)
          .add(daysToAdd, 'days')
          .add(hoursToAdd, 'hours');

        medicine['alarm'] = alarm.toISOString();
        medicine['dosageOrder'] = order;
        medicine['taken'] = this.checkIfMedicineIsTaken(medicine, timezone);
        medicine['isSoon'] = this.getIsSoon(alarm, timezone);

        const medicines: TodayMedicineType[] = [medicine];

        // get other dosages this day
        for (let i = orderInTheCurrentLoop; i < dosagesPerDay; i++) {
          const lastAlarm = medicines[medicines.length - 1].alarm;
          const alarm = moment
            .tz(lastAlarm, timezone)
            .add(hoursBetweenDosages, 'hours');
          const newMedicine: TodayMedicineType = {
            ...medicine,
            dosageOrder: i + order,
            alarm: alarm.toISOString(),
            isSoon: this.getIsSoon(alarm, timezone),
          };
          newMedicine.taken = this.checkIfMedicineIsTaken(
            newMedicine,
            timezone,
          );
          delete newMedicine.dosageSchedule;
          delete newMedicine.pauseMap;
          medicines.push(newMedicine);
        }
        if (medicines.length >= 1) {
          delete medicines[0].dosageSchedule;
          delete medicines[0].pauseMap;
        }
        return medicines;
      })
      .flat()
      .filter((m) => {
        const isSameDay = moment
          .tz(m.alarm, timezone)
          .isSame(currentDate, 'day');
        if (isSameDay) return true;
        return false;
      });

    return medicinesByDate.map((m) => localizePayload(m, lang));
  }

  private checkIfMedicineIsTaken(medicine: TodayMedicineType, timezone) {
    let taken = MEDICINE_TAKEN_STATUS.MEDICINE_NOT_YET_TIME; // this means the time has not come yet

    const didTimePassed = moment
      .tz(medicine.alarm, timezone)
      .isSameOrBefore(moment.tz(timezone));

    if (didTimePassed) {
      // check if the user has taken the medicine
      const schedule = medicine.dosageSchedule as Prisma.JsonObject;

      // search for the dosage order in the schedule
      const dosage = schedule[medicine.dosageOrder];
      if (dosage) taken = MEDICINE_TAKEN_STATUS.MEDICINE_TAKEN;
      else taken = MEDICINE_TAKEN_STATUS.MEDICINE_MISSED;
    }

    return taken;
  }

  async setMedicineTaken(userId: string, data, timezone = DEFAULT_TIMEZONE) {
    const { medicineId, dosageOrder } = data;
    const medicine = await this.findByMedicineId(medicineId, userId);

    const schedule = medicine.dosageSchedule as Prisma.JsonObject;

    const dosage = schedule[dosageOrder];

    if (dosage) {
      // this means the user has taken the medicine
      // so we will return the taken value
      return true;
    }

    // the user has not taken the medicine

    const newDosage = {
      timestamp: moment.tz(timezone).toISOString(),
    };
    await this.prisma.medicines.update({
      where: { id: medicineId },
      data: {
        dosageSchedule: {
          ...schedule,
          [dosageOrder]: newDosage,
        },
      },
    });

    return true;
  }

  private getIsSoon(alarm: moment.Moment, timezone) {
    const minutesDiff = alarm.diff(moment.tz(timezone), 'minutes', true);
    if (minutesDiff <= 0) {
      // the alarm is in the past
      return false;
    }
    return minutesDiff <= SOON_MINUTES;
  }

  async getMedicineById(
    userId: string,
    medicineId: string,
    lang: Locale,
    timezone = DEFAULT_TIMEZONE,
  ) {
    const medicine = await this.findByMedicineId(medicineId, userId);

    if (medicine.dosagePerDay !== whenRequiredDosagePerDay) {
      const dosagePerDay = parseInt(medicine.dosagePerDay);
      // determine the days the user took the medicine regularly without missing any day
      const longestConsecutiveDosageNumbers = longestConsecutiveIncrement(
        Object.keys(medicine.dosageSchedule),
      );
      const longestConsecutiveDays = Math.floor(
        longestConsecutiveDosageNumbers / dosagePerDay,
      );

      medicine['longestConsecutiveDays'] = longestConsecutiveDays;
      // get the number of dosages from the start of the course until now
      const now = moment.tz(timezone);

      const hoursSinceStart = now.diff(
        moment.tz(medicine.startDatetime, timezone),
        'hours',
        true,
      );

      const pausedDays = this.getTotalpauseDays(medicine, timezone);
      const pausedHours = pausedDays * 24;
      const hoursSinceStartWithoutPause = hoursSinceStart - pausedHours;

      const fullLoopHours = (medicine.gapInDays + 1) * 24;
      const loopsCount = hoursSinceStartWithoutPause / fullLoopHours;
      const dosages = loopsCount * dosagePerDay;
      const pastdDosages = Math.floor(dosages);

      const missedDosages =
        pastdDosages - Object.keys(medicine.dosageSchedule).length;
      medicine['missedDosages'] = missedDosages;
    }

    medicine['isPaused'] = this.checkIfMedicineIsPaused(medicine);

    delete medicine.dosageSchedule;

    return localizePayload(medicine, lang);
  }

  async pauseMedicine(userId: string, data: pasueAndResumeDTO, timezone) {
    const { medicineId } = data;

    const medicine = await this.findByMedicineId(medicineId, userId);

    // make sure the medicine is not already paused
    const isPaused = this.checkIfMedicineIsPaused(medicine);

    if (isPaused)
      throw new ErrorResponse({
        statusCode: 400,
        code: MEDICINE_ALREADY_PAUSED,
      });

    const pauseMap = medicine.pauseMap as Prisma.JsonObject;
    const now = moment().tz(timezone).toISOString();
    const pasueMapItem: PauseMapValue = { resumedAt: null };
    pauseMap[now] = pasueMapItem;

    await this.prisma.medicines.update({
      where: { id: medicineId },
      data: { pauseMap },
    });

    return true;
  }

  async resumeMedicine(userId: string, data: pasueAndResumeDTO, timezone) {
    const { medicineId } = data;

    const medicine = await this.findByMedicineId(medicineId, userId);

    const isPaused = this.checkIfMedicineIsPaused(medicine);
    if (!isPaused)
      throw new ErrorResponse({
        statusCode: 400,
        code: MEDICINE_NOT_PAUSED,
      });

    const pauseMap = medicine.pauseMap as Prisma.JsonObject;

    const lastPauseDays = this.getLastPauseDays(medicine, timezone);

    const days = medicine.days + lastPauseDays;

    const currentPauseKey = Object.keys(pauseMap).find((key) => {
      const { resumedAt } = pauseMap[key] as PauseMapValue;
      if (!resumedAt) return true;
      return false;
    });

    const resumedAt = moment().tz(timezone).toISOString();
    const pasueMapItem: PauseMapValue = { resumedAt };
    pauseMap[currentPauseKey] = pasueMapItem;

    await this.prisma.medicines.update({
      where: { id: medicineId },
      data: { pauseMap, days },
    });

    return true;
  }

  private checkIfMedicineIsPaused(medicine: Medicines) {
    const pauseMap = medicine.pauseMap as Prisma.JsonObject;
    if (Object.keys(pauseMap).length === 0) return false;
    return Object.values(pauseMap).some((pause) => {
      const { resumedAt } = pause as PauseMapValue;
      if (!resumedAt) return true;
      return false;
    });
  }

  private getTotalpauseDays(medicine: Medicines, timezone = DEFAULT_TIMEZONE) {
    let totalPausedDays = 0;
    const pauseMap = medicine.pauseMap as Prisma.JsonObject;
    Object.entries(pauseMap).forEach(([pausedAt, pause]) => {
      const { resumedAt } = pause as PauseMapValue;
      if (!resumedAt) {
        const pausedAtMoment = moment.tz(pausedAt, timezone);
        const now = moment.tz(timezone);
        const diff = now.diff(pausedAtMoment, 'days', true);
        console.log({ pausedAtMoment, now });

        totalPausedDays += diff;
      } else {
        const pausedAtMoment = moment.tz(pausedAt, timezone);
        const resumedAtMoment = moment.tz(resumedAt, timezone);
        const diff = resumedAtMoment.diff(pausedAtMoment, 'days', true);
        totalPausedDays += diff;
      }
    });

    return totalPausedDays;
  }

  private getLastPauseDays(medicine: Medicines, timezone = DEFAULT_TIMEZONE) {
    const pauseMap = medicine.pauseMap as Prisma.JsonObject;

    for (const [pausedAt, pause] of Object.entries(pauseMap)) {
      const { resumedAt } = pause as PauseMapValue;
      if (resumedAt) continue; // this means the medicine is passed before the last pause

      const pausedAtMoment = moment.tz(pausedAt, timezone);
      const now = moment.tz(timezone);
      const diff = now.diff(pausedAtMoment, 'days', true);
      return diff;
    }
  }

  private async findByMedicineId(medicineId: string, userId: string) {
    const medicine = await this.findByField('id', medicineId, null, true, {
      userId,
    });
    return medicine;
  }
}
