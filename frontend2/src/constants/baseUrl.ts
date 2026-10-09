// Dev: Vite (5173) talks to the API on 3001 directly.
// Prod: the backend serves this app, so everything is same-origin (relative URLs).
const SERVER_URL = import.meta.env.DEV ? "http://localhost:3001" : "";

export const BASE_URL = `${SERVER_URL}/api`;

// Products added from the dashboard store a path relative to the server
// (/uploads/xyz.png), while the seeded ones hold a full remote URL.
export const resolveImageUrl = (image: string) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) return image;
  return `${SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};
