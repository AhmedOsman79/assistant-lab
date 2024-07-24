import { LocaleStrings } from './errorUtils';

// if there is no translation for a keyword, it will fallback to the english version (the default locale)
// if there is no english version, it will fallback to the keyword itself (the object key)
export const keywords: Record<string, Partial<LocaleStrings>> = {
  email: {
    ar: 'البريد الالكنروني',
  },
  phone: {
    ar: 'رقم المحمول',
  },
  name: {
    ar: 'الاسم',
  },
  title: {
    ar: 'الاسم',
  },
  disease: {
    ar: 'المرض',
  },
  resource: {
    ar: 'المورد',
  },
  user: {
    ar: 'المستخدم',
  },
  article: {
    ar: 'المقال',
  },
  availableFrom: {
    ar: 'الوقت من',
  },
  availableUntil: {
    ar: 'الوقت حتى',
  },
  tablets: {
    ar: 'أقراص',
  },

  capsules: {
    ar: 'كبسولات',
  },
  liquids: {
    ar: 'سائل',
  },
  injection: {
    ar: 'حقن',
  },
  drops: {
    ar: 'نقط',
  },
  effervescent: {
    ar: 'فوار',
  },
  inhalers: {
    ar: 'استنشاق',
  },
  suppositories: {
    ar: 'تحاميل ( لبوس )',
  },
  topical: {
    ar: 'موضعي',
  },
  vaginal_douches: {
    en: 'vaginal douches',
    ar: 'دش مهبلي',
  },
  enema: {
    ar: 'حقنة شرجية',
  },

  normal_tablets: {
    en: 'normal tablets',
    ar: 'أقراص عادية',
  },
  lozenges_tablets: {
    en: 'lozenges tablets',
    ar: 'أقراص معينات',
  },
  sublingual_tablets: {
    en: 'sublingual tablets',
    ar: 'أقراص تحت اللسان',
  },
  syrups: {
    ar: 'شراب',
  },
  suspension: {
    ar: 'معلق',
  },
  gargle: {
    ar: 'غرغرة',
  },
  oral_ampoules: {
    en: 'oral ampoules',
    ar: 'أمبوالت عن طريق الفم',
  },
  IM: {
    ar: 'حقن بالعضل',
  },
  IV: {
    ar: 'حقن بالوريد',
  },
  SC: {
    ar: 'حقن تحت الجلد',
  },
  ID: {
    ar: 'حقن فى الطبقة الثانية من الجلد',
  },
  eye_drops: {
    en: 'eye drops',
    ar: 'قطرات للعين',
  },
  oral_drops: {
    en: 'oral drops',
    ar: 'نقط فموية',
  },
  ear_drops: {
    en: 'ear drops',
    ar: 'قطرات للأذن',
  },
  nasal_drops: {
    en: 'nasal drops',
    ar: 'قطرات للأنف',
  },
  nasal_spray: {
    en: 'nasal spray',
    ar: 'بخاخ للأنف',
  },
  rectal: {
    ar: 'شرجى',
  },
  vaginal: {
    ar: 'مهبلى',
  },
  creams: {
    ar: 'كريمات',
  },
  ointments: {
    ar: 'مراهم',
  },
  lotions: {
    ar: 'غسول (لوشن)',
  },
  local_sprays: {
    en: 'local sprays',
    ar: 'بخاخات موضعية',
  },
  dermal_patches: {
    en: 'dermal patches',
    ar: 'لاصقات موضعية',
  },
  medicine: {
    ar: 'الدواء',
  },
  assistant: {
    ar: 'المساعد',
  },
  doctor: {
    ar: 'الطبيب',
  },
};
