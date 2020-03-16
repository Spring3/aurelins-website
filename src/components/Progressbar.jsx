import React from 'react';
import styled from 'styled-components';

const Progressbar = styled.div`
  background: black;
  width: 80%;
  margin-top: 2rem;
  height: 2px;
  border-radius: 5px;
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const Progress = styled.span`
  color: ${props => props.theme.textEmphasizeColor};
  margin-top: 6px;
`;

const Bar = styled.div.attrs(props => ({
  style: {
    width: (props.progress || 0) + '%'
  }
}))`
  height: 2px;
  background: ${props => props.theme.textEmphasizeColor};
  position: absolute;
  top: 0px;
  left: 0px;
`;

export default ({ progress }) => {
  if (progress === 100 || progress === 0) {
    return null;
  }

  return (
    <Progressbar>
      <Progress>{Number(progress).toFixed(2)}</Progress>
      <Bar progress={progress} />
    </Progressbar>
  );
}
