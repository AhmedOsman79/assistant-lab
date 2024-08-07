type ResizeOptions = {
  square?: boolean;
  size?: number;
  width?: number;
  height?: number;
};
export function resizeCloudinaryImage(
  url: string,
  options: ResizeOptions,
): string {
  if (!url) return null;

  // web client image , ex: /images/some-image.jpg
  if (!url.includes('http') && !url.includes('https')) return url;

  // normal image : not cloudinary one, don't re
  if (!url.includes('res.cloudinary.com')) return url;

  const parts = url.split('/');
  const uploadIndex = parts.findIndex((part) => part === 'upload');

  let width = 700;
  let height = 700;

  if (options.square) {
    width = options.size;
    height = options.size;
  } else {
    width = options.width;
    height = options.height;
  }

  parts.splice(uploadIndex + 1, 0, `w_${width},h_${height},c_fill`);

  return parts.join('/');
}

export function squarizeImage(image: string, size: number) {
  return resizeCloudinaryImage(image, {
    size,
    square: true,
  });
}
