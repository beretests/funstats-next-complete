export function calculateAge(dobEpochMs?: number | null) {
  const currentEpochMs = Date.now();
  const msInYear = 1000 * 60 * 60 * 24 * 365.25;

  if (!dobEpochMs) return;
  const age = Math.floor((currentEpochMs - dobEpochMs) / msInYear);

  return age;
}
