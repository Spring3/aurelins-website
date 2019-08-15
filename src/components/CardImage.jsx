import styled from 'styled-components';
import { animated } from 'react-spring';

const CardImage = animated(styled.img`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: opacity .3s ease-in-out;
`);

export default CardImage;
