import { Locale, getLocalizedKeyword } from '@/constants';
import * as lodash from 'lodash';

// keys in payload objects we will localize
const allowedPayloadLocalizedKeys = ['type', 'subType', 'dosagePerDay'];

export const localizePayload = (payload, lang: Locale): typeof payload => {
  if (typeof payload !== 'object') return;
  const localizedPayload = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const willBeLocalized = allowedPayloadLocalizedKeys.find(
        (localizeKey) => localizeKey === key,
      );
      if (!willBeLocalized) localizedPayload[key] = value;
      else localizedPayload[key] = getLocalizedKeyword(value, lang);
    } else if (typeof value === 'object') {
      // support nesting localization
      if (lodash.isPlainObject(value)) {
        // normal js object
        localizedPayload[key] = localizePayload(value, lang);
      } else {
        // dates, arrays, null in js is considered to be objects
        localizedPayload[key] = value;
      }
    } else {
      //if it's not a string just return the same value
      localizedPayload[key] = value;
    }
  });

  return localizedPayload;
};
