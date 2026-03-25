export const SITE = {
  website: "https://tgeistert.de/", // replace this with your deployed domain
  author: "Tobias Geistert",
  profile: "https://github.com/Tulleg",
  desc: "A personal Blog with tech",
  title: "tgeistert.de",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/Tulleg/tgeistert.de",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "de", // html lang code. Set this empty and default will be "en"
  timezone: "Europe/Berlin", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
