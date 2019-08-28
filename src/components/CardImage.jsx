import styled, { css } from 'styled-components';

import { withImagePreload } from '../hoc/withImagePreload';

const CardImage = styled.img`
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
`;

export default withImagePreload(CardImage);
