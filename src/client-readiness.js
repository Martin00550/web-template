export const isConfiguredText = (value) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  !/\[[^\]]+\]/.test(value);

export function launchIssues(client) {
  const b = client.business;
  const issues = [];
  if (b.mockContacts) issues.push("real contact details instead of fictional demo contacts");
  if (
    !b.approved ||
    !["name", "primaryCity", "region"].every((key) => isConfiguredText(b[key]))
  )
    issues.push("approved business name and location");
  if (
    !isConfiguredText(b.phone) ||
    !/^\+?[\d\s().-]+$/.test(b.phone) ||
    b.phone.replace(/\D/g, "").length < 7
  )
    issues.push("real phone number");
  if (!isConfiguredText(b.email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))
    issues.push("real email address");
  if (!isConfiguredText(b.logo)) issues.push("client logo");
  if (
    !b.serviceAreas.length ||
    b.serviceAreas.some((area) => !isConfiguredText(area))
  )
    issues.push("actual service areas");
  if (!client.services.some((s) => !s.sample)) issues.push("approved services");
  if (
    client.contact.mode !== "endpoint" ||
    !isConfiguredText(client.contact.endpoint) ||
    !/^(https:\/\/|\/(?!\/))/.test(client.contact.endpoint)
  )
    issues.push("secure quote delivery");
  if (!isConfiguredText(client.contact.privacyUrl))
    issues.push("privacy policy");
  if (client.hero.kind !== "client")
    issues.push("genuine client hero photography");
  return issues;
}
