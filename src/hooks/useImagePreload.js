import { useState, useEffect } from 'react';

const useImagePreload = (imageUrl, previewUrl) => {
  const [image, setImage] = useState(previewUrl ? `${previewUrl}?w=100&q=10` : image);
  const [isLoading, setLoading] = useState(!!previewUrl);

  useEffect(() => {
    if (previewUrl) {
      const img = new Image();
      img.onload = () => {
        setLoading(false);
        setImage(img.src);
      };
      img.src = imageUrl;
    }
  }, [imageUrl, previewUrl]);

  return [image, isLoading];
}

export default useImagePreload;
