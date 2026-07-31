import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HabitSense",
    short_name: "HabitSense",
    description: "Track habits and sleep in one simple, private app.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F7F5",
    theme_color: "#F7F7F5",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
