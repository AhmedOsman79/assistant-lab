import { Medicines } from '@prisma/client';

export type TodayMedicineType = Medicines & {
  alarm?: string;
  dosageOrder?: number;
  taken?: string;
  isSoon?: boolean;
  isCourseEnded?: boolean;
};

export type PauseMapValue = {
  resumedAt?: string;
};
