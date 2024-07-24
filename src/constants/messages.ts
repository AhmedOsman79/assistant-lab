import { CONTACT_TYPE } from '@/types';
import * as codes from './errorCodes';
import { ResposnseMessageLocalType, getLocalizedKeyword } from './errorUtils';
import { prismaErrors } from './prisma-errors';

export const localizedMessages: Record<string, ResposnseMessageLocalType> = {
  [codes.INVALID_LOGIN]: {
    en: 'invalid email or password',
    ar: 'خطأ في البريد الالكتروني او كلمة السر',
  },
  [codes.USER_NOT_VERIFIED]: {
    en: 'this account is not verified',
    ar: 'هذا الحساب غير مفعل',
  },
  [prismaErrors.INSERT_UNIQUE]: {
    en: (keyName) => `this ${getLocalizedKeyword(keyName)} already exists`,
    ar: (keyName) => `${getLocalizedKeyword(keyName, 'ar')} موجود بالفعل`,
  },
  [codes.RESOURCE_NOT_FOUND]: {
    en: (keyName) => `${getLocalizedKeyword(keyName)} is not found`,
    ar: (keyName) => `لم يتم العثور على ${getLocalizedKeyword(keyName, 'ar')}`,
  },
  [codes.NO_VERIFICATION_WAS_SENT]: {
    en: 'No verification email was sent',
    ar: 'لم يتم ارسال ايميل تاكيدي لهذا الحساب ',
  },

  [codes.INVALID_VERIFICATION_CODE]: {
    en: 'invalid verification code',
    ar: 'كود التفعيل غير صحيح',
  },
  [codes.ACCOUNT_VERIFIED]: {
    en: 'Account is verified successfully',
    ar: 'تم تفعيل الحساب بنجاح',
  },
  [codes.CONTACT_ADDED]: {
    en: 'Contact is added successfully',
    ar: 'تم اضافة المساعد بنجاح',
  },
  [codes.PERMISSION_ERROR]: {
    en: "you don't have the right permission to do this action",
    ar: 'ليس لديك الصلاحية الكافية لأداء هذا الإجراء',
  },
  [codes.INTERNAL_SERVER_ERROR]: {
    en: 'Internal Server Error. Please contact support.',
    ar: 'خطأ في الخادم الداخلي. يُرجى التواصل مع الدعم.',
  },
  [codes.LOCALE_NOT_SUPPORTED]: {
    en: 'This language is not supported',
    ar: 'هذه اللغة غير مدعومة',
  },
  [codes.BOTH_OR_NONE]: {
    en: (obj1, obj2) =>
      `Please provide both the ${obj1} and ${obj2} or leave both fields empty`,
    ar: (obj1, obj2) =>
      `يُرجى تقديم ${getLocalizedKeyword(obj1, 'ar')} و ${getLocalizedKeyword(
        obj2,
        'ar',
      )} معًا، أو عدم توفير أي منهما`,
  },
  [codes.UNKNOWN_CONTACT_TYPE]: {
    en: `Unknown contact type, allowed types are ${Object.keys(
      CONTACT_TYPE,
    ).join(',')}`,
    ar: `نوع المساعد غير معروف، الأنواع المسموحة هي ${Object.keys(
      CONTACT_TYPE,
    ).join(',')}`,
  },
  [codes.ACCOUNR_ALREADY_VIRIFIED]: {
    en: 'This account is already verified',
    ar: 'هذا الحساب مفعل بالفعل',
  },
  [codes.IMAGE_TOO_LARGE]: {
    en: (maxSize) => `Image size should be less than ${maxSize} MB`,
    ar: (maxSize) => `يجب أن يكون حجم الصورة أقل من ${maxSize} ميجا بايت`,
  },
  [codes.NO_BASE64_IMAGE]: {
    en: (requiredImageName) =>
      `Please provide a base64 image, field name should be "${requiredImageName}"`,
    ar: (requiredImageName) =>
      `يُرجى تقديم صورة بصيغة base64، اسم الحقل يجب أن يكون "${requiredImageName}"`,
  },
  [codes.INVALID_BASE64]: {
    en: 'Invalid base64 image',
    ar: 'صورة base64 غير صالحة',
  },
  [codes.MEDICINE_ALREADY_PAUSED]: {
    en: 'This medicine is already paused',
    ar: 'هذا الدواء متوقف بالفعل',
  },
  [codes.MEDICINE_NOT_PAUSED]: {
    en: 'This medicine is not paused',
    ar: 'هذا الدواء ليس متوقف',
  },
};
