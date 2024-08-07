/**
 * This file was automatically generated by joi-to-typescript
 * Do not modify this file manually
 */

export interface MedicinesDTO {
  date: string;
  medicines?: {
    days: number;
    dosage?: number;
    dosagePerDay: string | number;
    dosageSchedule: object;
    gapInDays?: number;
    id?: string;
    image?: string | null;
    name?: string;
    pauseMap: {
      /**
       * Unknown Property
       */
      [x: string]: unknown;
    };
    startDatetime: string;
    subType: string;
    type: string;
    userId?: string;
  }[];
}
