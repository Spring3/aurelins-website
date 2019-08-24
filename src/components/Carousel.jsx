import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { animated, useTransition } from 'react-spring';

const Slide = animated(styled.div`
  background: url("${props => props.image}") no-repeat center center;
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: -1;
  background-size: cover;
`);

export default (({ images }) => {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  
  useEffect(
    () => {
      setSlides(images.map(image => ({ style }) => (
        <Slide
          image={image.file.url}
          style={style}
        />
      )))
    },
    [images]
  );

  useEffect(
    () => {
      const timeout = setTimeout(() => {
        const nextIndex = (index + 1) % slides.length;
        setIndex(nextIndex);
      }, 7000);
      return () => clearTimeout(timeout);
    },
    [index, slides]
  );

  const transitions = useTransition(index, p => p, {
    initial: {
      opacity: 1
    },
    from: {
      opacity: 0
    },
    enter: {
      opacity: 1
    },
    leave: {
      opacity: 0
    }
  });

  return transitions.map(({ item, props, key }) => {
    const Slide = slides[item];
    console.log(props);
    return Slide
      ? <Slide key={key} style={props} />
      : null
  });
});
