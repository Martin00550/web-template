const defaults = {
  minArea: 5,
  maxArea: 1000,
  minDimension: 0.5,
  maxDimension: 100,
};

export function getProjectArea(pricing, selection) {
  const limits = { ...defaults, ...pricing };
  let area;
  if (selection.measurement === "dimensions") {
    const width = Number(selection.length);
    const height = Number(selection.width);
    if (
      ![width, height].every(
        (n) =>
          Number.isFinite(n) &&
          n >= limits.minDimension &&
          n <= limits.maxDimension,
      )
    )
      throw new Error(
        `Enter a surface width and height from ${limits.minDimension} to ${limits.maxDimension} metres.`,
      );
    area = Math.round(width * height * 100) / 100;
  } else if (!selection.measurement || selection.measurement === "area") {
    area = Number(selection.area);
  } else throw new Error("Choose square metres or wall width × height.");
  if (!Number.isFinite(area) || area < limits.minArea || area > limits.maxArea)
    throw new Error(
      `Enter a painted surface area from ${limits.minArea} to ${limits.maxArea} square metres.`,
    );
  return area;
}

export function calculateEstimate(pricing, selection) {
  if (
    !pricing?.rates?.[selection.type] ||
    (!pricing.approved && !selection.demo)
  )
    return { available: false };
  const area = getProjectArea(pricing, selection);
  const rate = pricing.rates[selection.type];
  const preparation = pricing.preparation?.find(
    (item) => item.id === selection.preparation,
  );
  if (pricing.preparation?.length && !preparation)
    throw new Error("Choose an available preparation allowance.");
  const selectedExtras = selection.extras ?? [];
  if (
    !Array.isArray(selectedExtras) ||
    new Set(selectedExtras).size !== selectedExtras.length
  )
    throw new Error("Choose valid project extras.");
  const extras = selectedExtras.map((id) =>
    pricing.extras?.find((extra) => extra.id === id),
  );
  if (extras.some((extra) => !extra || !["flat", "m2"].includes(extra.unit)))
    throw new Error("An extra is not priced. Please request a quote.");
  const range = {};
  for (const bound of ["low", "high"]) {
    const prepRate = preparation?.included
      ? 0
      : (preparation?.perSqM?.[bound] ?? 0);
    const minimum = pricing.minimum?.[bound] ?? 0;
    const amounts = [
      rate[bound],
      prepRate,
      minimum,
      ...extras.map((extra) => extra[bound]),
    ];
    if (!amounts.every((n) => Number.isFinite(n) && n >= 0))
      throw new Error("Pricing is incomplete. Please request a quote.");
    const additions = extras.reduce(
      (total, extra) => total + extra[bound] * (extra.unit === "m2" ? area : 1),
      0,
    );
    range[bound] = Math.round(
      Math.max(minimum, area * (rate[bound] + prepRate) + additions),
    );
  }
  if (range.low > range.high)
    throw new Error("Pricing is incomplete. Please request a quote.");
  return { available: true, ...range };
}
