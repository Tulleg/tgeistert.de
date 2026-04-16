import { BLOG_PATH } from "@/content.config";
import { slugifyStr } from "./slugify";

function normalizeSlug(slug: string) {
  return slug
    .split("/")
    .filter(Boolean)
    .map(segment => slugifyStr(segment))
    .join("/");
}

export function resolvePostSlug(id: string, slug?: string) {
  const hasValidLegacySlug =
    !!slug &&
    slug
      .split("/")
      .filter(Boolean)
      .every(segment => /^[A-Za-z0-9-]+$/.test(segment));

  if (hasValidLegacySlug && slug) {
    return normalizeSlug(slug);
  }

  const blogId = id.split("/");
  const entrySlug = blogId.length > 0 ? blogId.slice(-1).join("/") : id;
  return normalizeSlug(entrySlug);
}

/**
 * Get full path of a blog post
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` in return value
 * @param slug - optional frontmatter slug override
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true,
  slug?: string
) {
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => slugifyStr(segment)); // slugify each segment path

  const basePath = includeBase ? "/posts" : "";
  const resolvedSlug = resolvePostSlug(id, slug);
  const slugSegments = resolvedSlug.split("/").filter(Boolean);

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    return [basePath, ...slugSegments].join("/");
  }

  return [basePath, ...pathSegments, ...slugSegments].join("/");
}
