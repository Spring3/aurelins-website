import React from 'react';
import styled from 'styled-components';
import GatsbyIcon from 'mdi-react/GatsbyIcon';
import ReactIcon from 'mdi-react/ReactIcon';
import HeartIcon from 'mdi-react/HeartIcon';

const Footer = styled.footer`
  color: ${props => props.theme.textColor};
  font-size: .9rem;
  display: flex;
  margin-top: 2rem;
  padding: 1rem 2rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;  

  p {
    padding: 2px;
    margin-bottom: 0;
    a, a:focus, a:visited, a:active {
      color: ${props => props.theme.textEmphasizeColor};
    }
    svg {
      vertical-align: bottom;
    }
  }
`;

export default () => {
  return (
    <Footer>
      <p>
        © 2020 Aurelins (Oleksandra Vasylenko).&nbsp;
      </p>
      <p>
        Created by&nbsp;
        <a
          href="https://www.dvasylenko.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Daniyil Vasylenko
        </a>
        &nbsp;with&nbsp;
        <HeartIcon size={18} color="#f6404f" />
      </p>
    </Footer>
  )
};
