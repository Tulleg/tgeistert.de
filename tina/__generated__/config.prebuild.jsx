// tina/config.ts
import { defineConfig } from "tinacms";

// src/config.ts
var SITE = {
  website: "https://tgeistert.de/",
  // replace this with your deployed domain
  author: "Tobias Geistert",
  profile: "https://github.com/Tulleg",
  desc: "A personal Blog with tech",
  title: "tgeistert.de",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1e3,
  // 15 minutes
  showArchives: true,
  showBackButton: true,
  // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/Tulleg/tgeistert.de"
  },
  dynamicOgImage: true,
  dir: "ltr",
  // "rtl" | "auto"
  lang: "de",
  // html lang code. Set this empty and default will be "en"
  timezone: "Europe/Berlin"
  // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
};

// tina/config.ts
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true" || !process.env.PUBLIC_TINA_CLIENT_ID;
var config_default = defineConfig({
  branch,
  // Get this from tina.io for production
  clientId: isLocal ? void 0 : process.env.PUBLIC_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID,
  token: isLocal ? void 0 : process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "assets/images"
    }
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
          author: SITE.author,
          timezone: SITE.timezone
        }),
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              return (values.title || "").toLowerCase().replace(/ /g, "-").replace(/[^\w-]/g, "");
            }
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Titel",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "slug",
            label: "Slug",
            description: "URL-Slug (\xFCberschreibt den Dateinamen)",
            required: false
          },
          {
            type: "string",
            name: "author",
            label: "Autor",
            required: true
          },
          {
            type: "datetime",
            name: "pubDatetime",
            label: "Ver\xF6ffentlichungsdatum",
            required: true
          },
          {
            type: "datetime",
            name: "modDatetime",
            label: "Letzte Aktualisierung",
            required: false
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured"
          },
          {
            type: "boolean",
            name: "draft",
            label: "Entwurf"
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true
          },
          {
            type: "string",
            name: "description",
            label: "Beschreibung",
            ui: {
              component: "textarea"
            },
            required: true
          },
          {
            type: "image",
            name: "ogImage",
            label: "OG-Bild",
            required: false
          },
          {
            type: "string",
            name: "canonicalURL",
            label: "Canonical URL",
            required: false
          },
          {
            type: "boolean",
            name: "hideEditPost",
            label: "Edit-Link verstecken"
          },
          {
            type: "string",
            name: "timezone",
            label: "Zeitzone",
            required: false
          },
          {
            type: "rich-text",
            name: "body",
            label: "Inhalt",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
