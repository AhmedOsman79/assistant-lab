export const bothOrNone = (obj1, obj2) => {
  if (!!obj1 && !!obj2) return true;

  if (!obj1 && !obj2) return true;

  return false;
};
