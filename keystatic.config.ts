import { collection, config, fields } from "@keystatic/core";
import { SITE } from "./src/config";

const repo = "Tulleg/tgeistert.de";
const imageDirectory = "src/assets/images/posts";
const imagePublicPath = "@assets/images/posts/";

const hasGitHubCredentials =
  !!process.env.KEYSTATIC_GITHUB_CLIENT_ID &&
  !!process.env.KEYSTATIC_GITHUB_CLIENT_SECRET &&
  !!process.env.KEYSTATIC_SECRET;

export default config({
  storage: hasGitHubCredentials
    ? {
        kind: "github",
        repo,
      }
    : {
        kind: "local",
      },
  collections: {
    posts: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "src/data/blog/**",
      format: {
        contentField: "content",
      },
      columns: ["title", "pubDatetime", "draft", "featured"],
      schema: {
        title: fields.slug({
          name: {
            label: "Titel",
          },
          slug: {
            label: "Slug",
            description: "Steuert den Dateinamen und damit die URL des Posts.",
          },
        }),
        author: fields.text({
          label: "Autor",
          defaultValue: SITE.author,
        }),
        pubDatetime: fields.datetime({
          label: "Veröffentlichungsdatum",
        }),
        modDatetime: fields.datetime({
          label: "Letzte Aktualisierung",
          validation: {
            isRequired: false,
          },
        }),
        featured: fields.checkbox({
          label: "Featured",
          defaultValue: false,
        }),
        draft: fields.checkbox({
          label: "Entwurf",
          defaultValue: false,
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: props => props.value || "Neuer Tag",
        }),
        description: fields.text({
          label: "Beschreibung",
          multiline: true,
        }),
        ogImage: fields.image({
          label: "OG-Bild",
          directory: imageDirectory,
          publicPath: imagePublicPath,
          validation: {
            isRequired: false,
          },
        }),
        canonicalURL: fields.url({
          label: "Canonical URL",
          validation: {
            isRequired: false,
          },
        }),
        hideEditPost: fields.checkbox({
          label: "Edit-Link verstecken",
          defaultValue: false,
        }),
        timezone: fields.text({
          label: "Zeitzone",
          defaultValue: SITE.timezone,
          validation: {
            isRequired: false,
          },
        }),
        content: fields.markdoc({
          label: "Inhalt",
          extension: "md",
          options: {
            image: {
              directory: imageDirectory,
              publicPath: imagePublicPath,
            },
          },
        }),
      },
    }),
  },
});
