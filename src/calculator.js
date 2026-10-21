const defaults = {
  minArea: 50,
  maxArea: 5000,
  minDimension: 1,
  maxDimension: 500,
};

export function getProjectArea(pricing, selection) {
  const limits = { ...defaults, ...pricing };
  let area;
  if (selection.measurement === "dimensions") {
    const length = Number(selection.length);
    const width = Number(selection.width);
    if (
      ![length, width].every(
        (n) =>
          Number.isFinite(n) &&
          n >= limits.minDimension &&
          n <= limits.maxDimension,
      )
    ) {
      throw new Error(
        `Enter a length and width from ${limits.minDimension} to ${limits.maxDimension} feet.`,
      );
    }
    area = Math.round(length * width * 100) / 100;
  } else if (!selection.measurement || selection.measurement === "area") {
    area = Number(selection.area);
  } else {
    throw new Error("Choose square feet or length × width.");
  }
  if (
    !Number.isFinite(area) ||
    area < limits.minArea ||
    area > limits.maxArea
  ) {
    throw new Error(
      `Enter a project area from ${limits.minArea} to ${limits.maxArea} square feet.`,
    );
  }
  return area;
}

export function calculateEstimate(pricing, selection) {
  const area = getProjectArea(pricing, selection);
  if (
    !pricing ||
    !pricing.rates ||
    !Object.keys(pricing.rates).length ||
    (!pricing.approved && !selection.demo)
  )
    return { available: false };
  const rate = pricing.rates[selection.type];
  // Partial or missing client rates use the honest quote-request flow.
  if (!rate) return { available: false };
  const finish = pricing.finishes?.find((f) => f.id === selection.finish);
  if (pricing.finishes?.length && !finish)
    throw new Error("Choose an available finish.");
  if (selection.removal && !pricing.extras?.removal)
    throw new Error("Concrete removal pricing is not configured.");
  const range = {};
  for (const bound of ["low", "high"]) {
    const finishRate = finish?.included ? 0 : (finish?.perSqFt?.[bound] ?? 0);
    const removalRate = selection.removal ? pricing.extras.removal[bound] : 0;
    const minimum = pricing.minimum?.[bound] ?? 0;
    if (
      ![rate[bound], finishRate, removalRate, minimum].every(
        (n) => Number.isFinite(n) && n >= 0,
      )
    )
      throw new Error("Pricing is incomplete. Please request a quote.");
    range[bound] = Math.round(
      Math.max(minimum, area * (rate[bound] + finishRate + removalRate)),
    );
  }
  if (range.low > range.high)
    throw new Error("Pricing is incomplete. Please request a quote.");
  return { available: true, ...range };
}
