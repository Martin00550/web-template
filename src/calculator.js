export function calculateEstimate(pricing, selection) {
  if (
    !pricing ||
    !pricing.rates ||
    !Object.keys(pricing.rates).length ||
    (!pricing.approved && !selection.demo)
  )
    return { available: false };
  const length = Number(selection.length);
  const gates = Number(selection.gates ?? 0);
  const height = pricing.heights.find(
    (h) => h.feet === Number(selection.height),
  );
  const rate = pricing.rates[selection.type];
  if (
    !Number.isFinite(length) ||
    length < pricing.minLength ||
    length > pricing.maxLength
  )
    throw new Error(
      `Enter a length from ${pricing.minLength} to ${pricing.maxLength} feet.`,
    );
  if (!rate || !height)
    throw new Error("Choose an available fence type and height.");
  if (
    !Number.isInteger(gates) ||
    gates < 0 ||
    gates > (pricing.extras?.gate?.max ?? 0)
  )
    throw new Error("Choose a valid number of gates.");
  const range = {};
  for (const bound of ["low", "high"]) {
    const fence = length * rate[bound] * height.multiplier;
    const gate = gates * (pricing.extras?.gate?.[bound] ?? 0);
    const removal = selection.removal
      ? length * (pricing.extras?.removal?.[bound] ?? 0)
      : 0;
    const total = Math.max(
      pricing.minimum?.[bound] ?? 0,
      fence + gate + removal,
    );
    if (!Number.isFinite(total) || total < 0)
      throw new Error("Pricing is incomplete. Please request a quote.");
    range[bound] = Math.round(total);
  }
  if (range.low > range.high)
    throw new Error("Pricing is incomplete. Please request a quote.");
  return { available: true, ...range };
}
