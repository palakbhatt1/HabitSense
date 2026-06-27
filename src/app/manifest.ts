import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HabitSense",
    short_name: "HabitSense",
    description: "Cozy habit and sleep tracking companion.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFDF9",
    theme_color: "#9B7FD4",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
