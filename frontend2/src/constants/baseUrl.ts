export const BASE_URL = "http://localhost:3001";

// Products added from the dashboard store a path relative to the API
// (/uploads/xyz.png), while the seeded ones hold a full remote URL.
export const resolveImageUrl = (image: string) => {
  if (!image) return "";
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) return image;
  return `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};
