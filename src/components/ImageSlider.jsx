import React, { useState, useCallback, useEffect } from 'react';
import { useTransition, animated } from 'react-spring';
import styled from 'styled-components';

import CardImage from './CardImage';

const Slides = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
`;

const SlideImage = animated(CardImage);

export default function ImageSlider ({ images, preview }) {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  useEffect(
    () => {
      setSlides(
        [preview, ...images.filter(image => image.title !== preview.title)]
          .map(image => ({ style }) => (
            <SlideImage
              src={image.fluid.src}
              srcSet={image.fluid.srcSet}
              alt={image.title}
              style={style}
            />
          ))
      )
    },
    []
  );

  const onNext = useCallback(
    () => {
      setIndex(index => (index + 1) % slides.length);
    },
    [slides]
  );

  // const onPrevious = useCallback(
  //   () => {
  //     setIndex(index => (index - 1 + slides.length) % slides.length);
  //   },
  //   [slides]
  // );

  console.log('index', index);
  const transitions = useTransition(index, p => p, {
    initial: {
      opacity: 1,
      transform: 'translate3d(0%,0,0)'
    },
    from: {
      opacity: 1,
      transform: 'translate3d(100%,0,0)'
    },
    enter: {
      opacity: 1,
      transform: 'translate3d(0%,0,0)'
    },
    leave: {
      opacity: 0,
      transform: 'translate3d(-100%,0,0)'
    }
  });
  return (
    <Slides onClick={onNext}>
      {
        transitions.map(({ item, props, key}) => {
          const Slide = slides[item];
          return Slide
            ? <Slide key={key} style={props} />
            : null;
        })
      }
    </Slides>
  );
}
