import React, { Fragment } from 'react';
import styled from 'styled-components';
import InstagramIcon from 'mdi-react/InstagramIcon';
import EmailOutlineIcon from 'mdi-react/EmailOutlineIcon';

const Aside = styled.aside`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: fixed;
  width: calc(25% - 4rem);
  top: 0px;
  padding: 0px 2rem;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, Arial, sans-serif;

  box-shadow: 2px 0px 10px 0px #EAEAEA;

  @media (max-width: 1250px) {
    width: calc(30% - 4rem);
  }

  @media (max-width: 1045px) {
    width: calc(35% - 4rem);
  }
`;

const Header = styled.header`
  margin-top: 2rem;
  color: #091E42;
  margin-bottom: 2rem;
`;

const MenuList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  flex-grow: 1;

  li {
    font-size: 1.1rem;
    color: #091E42;
    cursor: pointer;
    margin-bottom: 2rem;

    &:hover {
      color: #FDB964;
    }
  }
`;

const SocialList = styled.ul`
  justify-self: flex-end;
  list-style-type: none;
  margin: 0;
  margin-bottom: 2rem;
  padding: 0;
  display: flex;

  li {
    margin-right: 1rem;
  }
`;

const Main = styled.main`
  padding-left: 25%;
  height: 100vh;

  h1 {
    margin-top: 0px;
  }

  @media (max-width: 1250px) {
    padding-left: 30%;
  }

  @media (max-width: 1045px) {
    padding-left: 35%;
  }
`;

export default ({ children }) => {
  return (
    <Fragment>
      <Aside>
        <Header>
          <h2>Oleksandra Vasylenko</h2>
          <h3>Student, 3D Artist</h3>
        </Header>
        <MenuList>
          <li>HOME</li>
          <li>CONTACT</li>
        </MenuList>
        <SocialList>
          <li><InstagramIcon /></li>
          <li><EmailOutlineIcon /></li>
        </SocialList>
      </Aside>
      <Main>
        {children}
      </Main>
    </Fragment>
  );
}
