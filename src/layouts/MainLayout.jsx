import React, { Fragment, useState, useRef, useEffect } from 'react';
import throttle from 'lodash.throttle';
import styled from 'styled-components';
import InstagramIcon from 'mdi-react/InstagramIcon';
import EmailOutlineIcon from 'mdi-react/EmailOutlineIcon';
import MenuIcon from 'mdi-react/MenuIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import { useSpring, animated } from 'react-spring';

const BurgerWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 1rem 0rem;

  button {
    background: transparent;
    border: none;
    cursor: pointer;
    svg {
      vertical-align: middle;
    }
  }
`;

const Header = styled.header`
  color: white;
  margin-bottom: 4rem;

  h4 {
    color: #AAA;
  }
`;

const MenuList = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  flex-grow: 1;

  li {
    font-size: .9rem;
    color: #AAA;
    cursor: pointer;
    margin-bottom: 2rem;

    &:hover {
      color: white;
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


const Aside = animated(styled.aside`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: black;
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
`);

const Main = styled.main`
  padding-left: 25%;
  height: 100vh;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, Arial, sans-serif;

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

const useSidebarAnimation = (isSidebarOpen) => {
  const mainRef = useRef();
  const sidebarRef = useRef();
  const [width, setWidth] = useState(0);
  
  const throttledResize = useRef(throttle(() => setWidth(window.innerWidth), 300));
  
  useEffect(() => {
    window.addEventListener('resize', throttledResize.current);
    return () => {
      console.log('before cleanup');
      window.removeEventListener('resize', throttledResize.current);
    };
  }, [])

  const props = useSpring({
    width: isSidebarOpen
      ? parseFloat(getComputedStyle(mainRef.current).paddingLeft) - parseFloat(getComputedStyle(sidebarRef.current).paddingLeft) * 2
      : 0
  });
  return [{ mainRef, sidebarRef }, props];
}

export default ({ children }) => {
  const [isSidebarOpen, toggleSidebar] = useState(false);
  const [{ mainRef, sidebarRef }, props] = useSidebarAnimation(isSidebarOpen);
  
  return (
    <Fragment>
      <Aside ref={sidebarRef} style={props} isOpen={isSidebarOpen}>
        <BurgerWrapper>
          <button onClick={() => toggleSidebar(!isSidebarOpen)}>
            {
              isSidebarOpen
              ? (<CloseIcon color="white" size={26} />)
              : (<MenuIcon color="white" size={26} />)
            }
          </button>
        </BurgerWrapper>
        <Header>
          <h2>Oleksandra Vasylenko</h2>
          <h4>Student, 3D Artist</h4>
        </Header>
        <MenuList>
          <li>Portfolio</li>
          <li>Contact</li>
        </MenuList>
        <SocialList>
          <li><InstagramIcon color="white" /></li>
          <li><EmailOutlineIcon color="white" /></li>
        </SocialList>
      </Aside>
      <Main ref={mainRef} isSidebarOpen={isSidebarOpen}>
        {children}
      </Main>
    </Fragment>
  );
}
