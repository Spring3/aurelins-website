import { useState, useEffect } from 'react';

const useImagePreload = (imageUrl, previewUrl) => {
  const [image, setImage] = useState(previewUrl ? `${previewUrl}?w=100&q=10` : image);
  const [isLoading, setLoading]  = useState(!!previewUrl);

  useEffect(() => {
    if (previewUrl && isLoading) {
      const img = new Image();
      img.onload = () => {
        if (isLoading) {
          setLoading(false);
          setImage(img.src);
        }
      };
      img.src = imageUrl;
      if (img.complete) {
        setLoading(false);
        setImage(img.src);
      }
    }
  }, [imageUrl, previewUrl]);

  return [image, isLoading];
}

export default useImagePreload;
