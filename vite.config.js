import { defineConfig } from "vite";
import { client } from "./src/client-config.js";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export default defineConfig({
  plugins: [
    {
      name: "client-metadata",
      // Metadata is written into the built HTML, so it does not depend on a
      // crawler running JavaScript before reading the title or indexing policy.
      transformIndexHtml(html) {
        if (client.demo) return html;
        if (
          !client.business.approved ||
          !client.business.name ||
          !client.business.primaryCity ||
          !client.services.some((s) => !s.sample) ||
          client.contact.mode !== "endpoint" ||
          !client.contact.endpoint
        ) {
          throw new Error(
            "Complete approved business details, actual services and quote delivery before disabling demo mode.",
          );
        }
        const title = `${client.business.name} — Fence installation in ${client.business.primaryCity}`;
        const description =
          client.business.description ||
          `Explore fence options and request a project quote from ${client.business.name} in ${client.business.primaryCity}.`;
        html = html
          .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
          .replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
            `<meta name="description" content="${escapeHtml(description)}" />`,
          )
          .replace(/\s*<meta\s+name="robots"[^>]*>/, "");
        if (
          client.business.website &&
          /^https:\/\//.test(client.business.website)
        )
          html = html.replace(
            "</head>",
            `<link rel="canonical" href="${escapeHtml(client.business.website)}" />\n  </head>`,
          );
        return html;
      },
    },
  ],
});
