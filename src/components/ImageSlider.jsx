import React, { useState, useCallback, useEffect } from 'react';
import { useTransition, animated } from 'react-spring';
import styled from 'styled-components';
import ArrowRightIcon from 'mdi-react/ArrowRightIcon';
import ArrowLeftIcon from 'mdi-react/ArrowLeftIcon';

import CardImage from './CardImage';

const Slides = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
`;

const Button = styled.button`
  position: absolute;
  outline: none;
  width: 20%;
  border: none;
  cursor: pointer;
  background: transparent;

  svg {
    fill: transparent;
  }

  &:hover {
    svg {
      fill: white;
    }
  }
`;

const ButtonPrev = styled(Button)`
  left: 0;
  top: 0;
  bottom: 0;
`;

const ButtonNext = styled(Button)`
  right: 0;
  top: 0;
  bottom: 0;
`;

const SlideImage = animated(CardImage);

export default function ImageSlider ({ images, preview }) {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [order, setOrder] = useState('normal');

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

  const nextSlide = useCallback(
    (event) => {
      setIndex(index => (index + 1) % slides.length);
      setOrder('normal');
    },
    [slides]
  );

  const previousSlide = useCallback(
    () => {
      setIndex(index => (index - 1 + slides.length) % slides.length);
      setOrder('reversed');
    },
    [slides]
  );

  const transitionsPrevious = useTransition(index, p => p, {
    initial: {
      opacity: 1,
      transform: 'translate3d(0%,0,0)'
    },
    from: {
      opacity: 1,
      transform: 'translate3d(-100%,0,0)'
    },
    enter: {
      opacity: 1,
      transform: 'translate3d(0%,0,0)'
    },
    leave: {
      opacity: 0,
      transform: 'translate3d(100%,0,0)'
    }
  });

  const transitionsNext = useTransition(index, p => p, {
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

  const transitions = order === 'normal'
    ? transitionsNext
    : transitionsPrevious;

  return (
    <Slides>
      {
        transitions.map(({ item, props, key}) => {
          const Slide = slides[item];
          return Slide
            ? <Slide key={key} style={props} />
            : null
        })
      }
      <ButtonPrev
        name="previous"
        onClick={previousSlide}
      >
        <ArrowLeftIcon />
      </ButtonPrev>
      <ButtonNext
        name="next"
        onClick={nextSlide}
      >
        <ArrowRightIcon />
      </ButtonNext>
    </Slides>
  );
}
