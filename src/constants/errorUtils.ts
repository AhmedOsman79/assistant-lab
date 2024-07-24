import { Locales } from '@prisma/client';
import { keywords } from './keywords';
import { localizedMessages } from './messages';

export const getLocalizedKeyword = (
  enWord: string,
  locale: Locale = DEFAULT_LOCALE,
) => {
  return keywords[enWord] ? keywords[enWord][locale] || enWord : enWord;
};

export const getMessageFromCode = (
  code: string,
  formattedString?: string[],
  lang = DEFAULT_LOCALE,
): string => {
  // to handle if the user entered unsupported language
  // UPDATE: this is not needed anymore since we are preventing the user from entering unsupported language but I will keep it for now
  const finalLang = Object.values(Locales).find((l) => l == lang)
    ? lang
    : DEFAULT_LOCALE;

  const localizedMessage = localizedMessages[code];
  if (!localizedMessage) return undefined;

  const message =
    localizedMessage[finalLang] || localizedMessage[DEFAULT_LOCALE];

  const isFormattedMessage = typeof message === 'function';

  return isFormattedMessage ? message(...formattedString) : message;
};

export type Locale = keyof typeof Locales;

export const DEFAULT_LOCALE: Locale = 'en';
export type LocaleStrings = {
  [K in Locale]: string;
};

//Messages
// message can be either a string or a function that takes formatting strings and returns the formatted message
export type ResposnseMessageLocalType = {
  [K in Locale]: string | ((...formatStrings: string[]) => string);
};
