import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Transition } from 'react-transition-group';

import { withImagePreload } from '../hoc/withImagePreload';

const Slide = withImagePreload(styled.div`
  background: url("${props => props.image}") no-repeat center center;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  background-size: cover;

  ${({ isLoading }) => isLoading && css `
    filter: blur(20px);
  `}
`);

export default (({ images }) => {
  const [index, setIndex] = useState(0);

  useEffect(
    () => {
      const timeout = setTimeout(() => {
        const nextIndex = (index + 1) % images.length;
        setIndex(nextIndex);
      }, 7000);
      return () => clearTimeout(timeout);
    },
    [index]
  );

  const defaultStyles = {
    opacity: 0,
    transition: 'opacity 1s ease-in-out'
  };

  const transitions = {
    entering: {
      opacity: 1
    },
    entered: {
      opacity: 1
    },
    exiting: {
      opacity: 0
    },
    exited: {
      opacity: 0
    }
  };

  return images.map((image, i) => (
    <Transition in={i === index}>
      {state => (
        <Slide
          key={i}
          style={{
            ...defaultStyles,
            ...transitions[state]
          }}
          preview={image.file.url}
          image={image.file.url}
        />
      )}
    </Transition>
  ));
});
