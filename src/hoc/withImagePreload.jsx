import React from 'react';

import useImagePreload from '../hooks/useImagePreload';

function withImagePreload(WrappedComponent) {
  const WithImagePreload = (props) => {
    const { src, image, preview } = props;
    const [img, isLoading] = useImagePreload(src || image, preview);

    return (
      <WrappedComponent
        { ...props }
        src={img}
        image={img}
        isLoading={isLoading}
      />
    );
  };
  WithImagePreload.displayName = `WithImagePreload(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`
  return WithImagePreload;
};

export {
  withImagePreload
};
