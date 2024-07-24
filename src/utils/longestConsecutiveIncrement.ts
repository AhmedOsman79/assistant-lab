export function longestConsecutiveIncrement(arr) {
  if (arr.length === 0) {
    return 0;
  }

  let longestStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < arr.length; i++) {
    const current = parseInt(arr[i]);
    const prev = parseInt(arr[i - 1]);
    if (current === prev + 1) {
      currentStreak++;
    } else if (current !== prev) {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(longestStreak, currentStreak);
}
