import { createClient } from "tinacms/dist/client";
import { queries } from "./types.js";
export const client = createClient({ cacheDir: '/home/Tulle/projects/tgeistert.de/tina/__generated__/.cache/1787817066429', url: 'http://localhost:4001/graphql', token: 'undefined', queries,  });
export default client;
  