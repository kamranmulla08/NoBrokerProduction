import { API_BASE_URL } from "../services/api";

export function getPropertyImageUrl(imagePath) {
  if (!imagePath) {
    return null;
  }

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  return `${API_BASE_URL.replace(/\/api$/, "")}${imagePath}`;
}
