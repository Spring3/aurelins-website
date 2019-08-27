import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { animated } from 'react-spring';

import useImagePreload from '../hooks/useImagePreload';

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

export default ({ src, preview, ...rest }) => {
  const [image, isLoading] = useImagePreload(src, preview);

  return (
    <CardImage
      src={image}
      isLoading={isLoading}
      {...rest}
    />
  );
};
