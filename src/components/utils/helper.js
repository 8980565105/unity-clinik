export const getImageUrl = (path) => {
  if (Array.isArray(path)) path = path[0];
  if (!path || typeof path !== "string") return "/placeholder.png";
  if (path.startsWith("http") || path.startsWith("data:image")) return path;
  return `${process.env.REACT_APP_API_URL_IMAGE}${path}`;
};
