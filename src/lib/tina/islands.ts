import type { IslandRegistry } from "@tinacms/astro/experimental";
import PostDetails from "../../layouts/PostDetails.astro";
import { getPost } from "./data";

export const islands: IslandRegistry = {
  "post-details": {
    fetch: (_request, params) => getPost(params.get("id") ?? ""),
    component: PostDetails,
    wrapper: { tag: "div", className: "tina-island-wrapper" },
    propsFromData: (data) => {
      const tinaPost = (data as any).data?.posts;
      return {
        post: tinaPost,
        posts: [], // Pass an empty list during preview rendering
      };
    },
  },
};
