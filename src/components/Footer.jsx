import React from 'react';
import styled from 'styled-components';
import GatsbyIcon from 'mdi-react/GatsbyIcon';
import ReactIcon from 'mdi-react/ReactIcon';
import HeartCircleOutlineIcon from 'mdi-react/HeartCircleOutlineIcon';

const Footer = styled.footer`
  color: #AAA;
  font-size: .9rem;
  display: flex;
  padding: 1rem 2rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;  

  p {
    padding: 2px;
    margin-bottom: 0;
    a, a:focus, a:visited, a:active {
      color: white;
    }
    svg {
      vertical-align: middle;
    }
  }
`;

export default () => {
  return (
    <Footer>
      <p>
        © 2019 Aurelins (Oleksandra Vasylenko).&nbsp;
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
        <GatsbyIcon color="#653399" />
        &nbsp; + &nbsp;
        <ReactIcon color="#00d8ff" />
        &nbsp; & &nbsp;
        <HeartCircleOutlineIcon color="#f6404f" />
      </p>
    </Footer>
  )
};
