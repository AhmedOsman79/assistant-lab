import { MedicineType, MedicineSubType } from '@prisma/client';

export const MedicineTypes = {
  [MedicineType.tablets]: [
    MedicineSubType.normal_tablets,
    MedicineSubType.lozenges_tablets,
    MedicineSubType.sublingual_tablets,
  ],
  [MedicineType.liquids]: [
    MedicineSubType.syrups,
    MedicineSubType.suspension,
    MedicineSubType.gargle,
    MedicineSubType.oral_ampoules,
  ],
  [MedicineType.injection]: [
    MedicineSubType.IM,
    MedicineSubType.IV,
    MedicineSubType.SC,
    MedicineSubType.ID,
  ],
  [MedicineType.drops]: [
    MedicineSubType.eye_drops,
    MedicineSubType.oral_drops,
    MedicineSubType.ear_drops,
    MedicineSubType.nasal_drops,
    MedicineSubType.nasal_spray,
  ],
  [MedicineType.suppositories]: [
    MedicineSubType.rectal,
    MedicineSubType.vaginal,
  ],
  [MedicineType.topical]: [
    MedicineSubType.creams,
    MedicineSubType.ointments,
    MedicineSubType.lotions,
    MedicineSubType.local_sprays,
    MedicineSubType.dermal_patches,
  ],
};
