import { useEffect, useState } from 'react';
import throttle from 'lodash.throttle';

const useWindowResize = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = throttle(() => {
      setWidth(window.innerWidth);
    }, 300);

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width <= 900;

  return [width, isMobile];
};

export default useWindowResize;
