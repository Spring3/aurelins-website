import React, { useState, useCallback, useEffect } from 'react';
import { navigate } from 'gatsby';
import styled, { css, keyframes } from 'styled-components';
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
    transition: fill .1s ease-in-out;
  }

  &:hover {
    svg {
      fill: ${props => props.theme.textEmphasizeColor};
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

const slideInNormalAnimation = keyframes`
  from {
    opacity: 1;
    transform: translate3d(100%,0,0);
  }

  to {
    opacity: 1;
    transform: translate3d(0%,0,0);
  }
`;

const slideInReversedAnimation = keyframes`
  from {
    opacity: 1;
    transform: translate3d(-100%,0,0);
  }

  to {
    opacity: 1;
    transform: translate3d(0%,0,0);
  }
`;

const slideOutNormalAnimation = keyframes`
  from {
    opacity: 1;
    transform: translate3d(0%,0,0);
  }

  to {
    opacity: 0;
    transform: translate3d(-100%,0,0);
  }
`;

const slideOutReversedAnimation = keyframes`
  from {
    opacity: 1;
    transform: translate3d(0%,0,0);
  }

  to {
    opacity: 0;
    transform: translate3d(100%,0,0);
  }
`;

const Slide = styled(CardImage)`
  animation-fill-mode: forwards;
  animation-duration: .3s;
  animation-timing-function: ease;
  ${({ direction, active }) => active
    ? css `
      animation-name: ${direction === 'normal' ? slideInNormalAnimation : slideInReversedAnimation};
    `
    : css `
      animation-name: ${direction === 'normal' ? slideOutNormalAnimation : slideOutReversedAnimation};
    `
  }
`;

const Slider = styled.div`
`;

export default function ImageSlider ({ slug, images, preview }) {
  const [position, setPosition] = useState({
    index: 0,
    order: 'normal'
  });
  const [slides, setSlides] = useState([]);

  useEffect(
    () => setSlides([preview, ...images.filter(image => image.title !== preview.title)]),
    []
  );

  const nextSlide = useCallback(
    () => {
      setPosition(position => ({
        index: (position.index + 1) % slides.length,
        order: 'normal'
      }));
    },
    [slides]
  );

  const previousSlide = useCallback(
    () => {
      setPosition(position => ({
        index: (position.index - 1 + slides.length) % slides.length,
        order: 'reversed'
      }));
    },
    [slides]
  );

  return (
    <Slides>
      <Slider>
        {
          slides.map((image, i) => (
            <Slide
              key={i}
              active={position.index === i}
              direction={position.order}
              preview={image.file.url}
              src={image.fluid.src}
              srcSet={image.fluid.srcSet}
              alt={image.title}
              onClick={() => navigate(`/portfolio/${slug}`)}
            />
          ))
        }
      </Slider>
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
