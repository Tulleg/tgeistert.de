import { requestWithMetadata } from "@tinacms/astro/data";
import { client } from "../../../tina/__generated__/client";

/**
 * Fetch a blog post from Tina CMS with metadata enabled for visual editing.
 * @param slug - The post ID/slug (e.g. 'devcontainer-2' or 'subdir/post')
 */
export const getPost = async (slug: string) => {
  return await requestWithMetadata(
    client.queries.posts({ relativePath: `${slug}.md` })
  );
};
