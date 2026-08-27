import { experimental_createIslandRoute } from "@tinacms/astro/experimental";
import { islands } from "../../lib/tina/islands";

const isDev = process.env.NODE_ENV === "development" || process.argv.includes("dev");

// Enable static prerendering only in production build mode
export const prerender = !isDev;

export function getStaticPaths() {
  if (!isDev) {
    // Statically prerender all registered islands during the build to avoid errors
    return Object.keys(islands).map(name => ({ params: { name } }));
  }
  return [];
}

export const ALL = experimental_createIslandRoute(islands);
