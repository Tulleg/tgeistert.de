import { defineConfig } from "tinacms";

const SITE_AUTHOR = "Tobias Geistert";
const SITE_TIMEZONE = "Europe/Berlin";

// Your hosting provider may pass this in
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true" || !process.env.PUBLIC_TINA_CLIENT_ID;

export default defineConfig({
  branch,

  // Get this from tina.io for production
  clientId: isLocal ? undefined : (process.env.PUBLIC_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID),
  token: isLocal ? undefined : process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "assets/images",
    },
  },
  // See schemas at https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "posts",
        label: "Blog Posts",
        path: "src/data/blog",
        format: "md",
        defaultItem: () => ({
          author: SITE_AUTHOR,
          timezone: SITE_TIMEZONE,
        }),
        ui: {
          filename: {
            readonly: false,
            slugify: values => {
              return (values.title || "")
                .toLowerCase()
                .replace(/ /g, "-")
                .replace(/[^\w-]/g, "");
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titel",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "Slug",
            description: "URL-Slug (überschreibt den Dateinamen)",
            required: false,
          },
          {
            type: "string",
            name: "author",
            label: "Autor",
            required: true,
          },
          {
            type: "datetime",
            name: "pubDatetime",
            label: "Veröffentlichungsdatum",
            required: true,
          },
          {
            type: "datetime",
            name: "modDatetime",
            label: "Letzte Aktualisierung",
            required: false,
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured",
          },
          {
            type: "boolean",
            name: "draft",
            label: "Entwurf",
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          {
            type: "string",
            name: "description",
            label: "Beschreibung",
            ui: {
              component: "textarea",
            },
            required: true,
          },
          {
            type: "image",
            name: "ogImage",
            label: "OG-Bild",
            required: false,
          },
          {
            type: "string",
            name: "canonicalURL",
            label: "Canonical URL",
            required: false,
          },
          {
            type: "boolean",
            name: "hideEditPost",
            label: "Edit-Link verstecken",
          },
          {
            type: "string",
            name: "timezone",
            label: "Zeitzone",
            required: false,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Inhalt",
            isBody: true,
          },
        ],
      },
    ],
  },
});
