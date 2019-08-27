import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { animated } from 'react-spring';

const CardImage = animated(styled.img`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: opacity .3s ease-in-out;
  ${({ isLoading }) => isLoading && css`
      filter: blur(20px);
    `
  }
`);

export default ({ src, preview, ...rest}) => {
  const [image, setImage] = useState(preview ? `${preview}?w=100&q=10` : src);
  const [isLoading, setLoading] = useState(!!preview);

  useEffect(() => {
    if (preview) {
      const img = new Image();
      img.onload = () => {
        setLoading(false);
        setImage(img.src);
      };
      img.src = src;
    }
  }, []);

  return (
    <CardImage
      src={image}
      isLoading={isLoading}
      {...rest}
    />
  );
};
