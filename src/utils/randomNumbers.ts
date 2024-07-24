import { VERIFICATION_CODE_LENGTH } from '@/constants';

const generateRandomNumbers = (chars, len) =>
  [...Array(len)]
    .map((i) => chars[Math.floor(Math.random() * chars.length)])
    .join('');

export const getRandomCode = (length: number = VERIFICATION_CODE_LENGTH) => {
  return generateRandomNumbers('0123456789', length);
};
