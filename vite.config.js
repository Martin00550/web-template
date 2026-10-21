import { defineConfig } from "vite";
import { client } from "./src/client-config.js";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );

export default defineConfig({
  plugins: [
    {
      name: "client-metadata",
      // Write client metadata into actual HTML for crawlers as well as browsers.
      transformIndexHtml(html) {
        if (
          !client.demo &&
          (!client.business.approved ||
            !client.business.name ||
            !client.business.primaryCity ||
            !client.services.some((s) => !s.sample) ||
            client.contact.mode !== "endpoint" ||
            !client.contact.endpoint ||
            !/^(https:\/\/|\/(?!\/))/.test(client.contact.endpoint))
        ) {
          throw new Error(
            "Complete approved business details, actual services and quote delivery before disabling demo mode.",
          );
        }
        const title = `${client.business.name} — Concrete contractor in ${client.business.primaryCity}${client.demo ? " (Demo)" : ""}`;
        const description =
          client.business.description ||
          (client.demo
            ? `Explore this ${client.business.primaryCity}, ${client.business.region} residential concrete demo. Compare project options, calculate an illustrative price and try the quote form.`
            : `Explore residential concrete services and request a project quote from ${client.business.name} in ${client.business.primaryCity}.`);
        html = html
          .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
          .replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
            `<meta name="description" content="${escapeHtml(description)}" />`,
          )
          .replace(
            /<meta\s+name="theme-color"\s+content="[^"]*"\s*\/?>/,
            `<meta name="theme-color" content="${escapeHtml(client.brand.accent)}" />`,
          );
        if (!client.demo)
          html = html.replace(/\s*<meta\s+name="robots"[^>]*>/, "");
        if (
          !client.demo &&
          client.business.website &&
          /^https:\/\//.test(client.business.website)
        ) {
          const schema = {
            "@context": "https://schema.org",
            "@type": "HomeAndConstructionBusiness",
            name: client.business.name,
            url: client.business.website,
            ...(client.business.phone
              ? { telephone: client.business.phone }
              : {}),
            ...(client.business.description
              ? { description: client.business.description }
              : {}),
            ...(client.business.serviceAreas.length
              ? { areaServed: client.business.serviceAreas }
              : {}),
          };
          html = html.replace(
            "</head>",
            `<link rel="canonical" href="${escapeHtml(client.business.website)}" />\n<script id="business-schema" type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>\n</head>`,
          );
        }
        return html;
      },
    },
  ],
});
