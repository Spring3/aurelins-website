import React, { Fragment, useState, useRef, useEffect } from 'react';
import throttle from 'lodash.throttle';
import { Link } from 'gatsby';
import styled, { css } from 'styled-components';
import InstagramIcon from 'mdi-react/InstagramIcon';
import EmailOutlineIcon from 'mdi-react/EmailOutlineIcon';
import MenuIcon from 'mdi-react/MenuIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import { useChain, useSpring, animated } from 'react-spring';

const BurgerWrapper = animated(styled.div`
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
`);

const Header = animated(styled.header`
  color: white;
  margin-bottom: 4rem;

  h4 {
    color: #AAA;
  }
`);

const MenuList = animated(styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
  flex-grow: 1;

  li {
    font-size: .9rem;
    margin-bottom: 2rem;
    
    a, a:visited, a:active {
      transition: color .3s ease-in-out;
      color: #AAA;
      text-decoration: none;
    }

    a:focus, a:hover {
      color: white;
    }
  }
`);

const SocialList = styled.ul`
  justify-self: flex-end;
  list-style-type: none;
  margin: 0;
  margin-bottom: 2rem;
  padding: 0;
  display: flex;
  transition: .3s ease-in-out;

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
  width: 16rem;
  top: 0px;
  padding: 0px 2rem;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, Arial, sans-serif;

  ${({ isOpen }) => !isOpen && css`
    ${SocialList} {
      flex-direction: column;
      align-self: center;
      li {
        margin-right: 0;
        margin-top: 1rem;
      }
    }
  `}

`);

const Main = animated(styled.main`
  padding-left: 20rem;
  height: 100vh;
  font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, Arial, sans-serif;

  h1 {
    margin-top: 0px;
  }
`);

const useSidebarAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    width: isSidebarOpen
      ? parseFloat(getComputedStyle(document.documentElement).fontSize) * 16
      : 0,
    background: isSidebarOpen ? 'black' : 'white',
    ref: animationRef
  });
  return [animationRef, props];
}

const useSidebarContentAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    opacity: isSidebarOpen ? 0 : 1,
    transform: isSidebarOpen ? 'translate3d(0,100%,0)' : 'translate3d(0,0%,0)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useCenterAlignAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    alignSelf: isSidebarOpen ? 'normal' : 'center',
    ref: animationRef
  });
  return [animationRef, props];
}

const useResetMainPaddingAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    paddingLeft: isSidebarOpen
      ? parseFloat(getComputedStyle(document.documentElement).fontSize) * 20
      : parseFloat(getComputedStyle(document.documentElement).fontSize) * 4,
    ref: animationRef
  });
  return [animationRef, props];
};

export default ({ children }) => {
  const [isSidebarOpen, toggleSidebar] = useState(false);
  const [sidebarAnimationRef, sidebarAnimationProps] = useSidebarAnimation(isSidebarOpen);
  const [sidebarContentAnimationRef, sidebarContentAnimationProps] = useSidebarContentAnimation(!isSidebarOpen);
  const [centerAlignAnimationRef, centerAlignAnimationProps] = useCenterAlignAnimation(isSidebarOpen);
  const [resetMainPaddingAnimationRef, resetMainPaddingAnimationProps] = useResetMainPaddingAnimation(isSidebarOpen);

  useChain(
    isSidebarOpen
      ? [centerAlignAnimationRef, sidebarAnimationRef, resetMainPaddingAnimationRef, sidebarContentAnimationRef]
      : [sidebarContentAnimationRef, sidebarAnimationRef, resetMainPaddingAnimationRef, centerAlignAnimationRef],
    isSidebarOpen
      ? [0, 0, 0, 0.38]
      : [0, 0.4, 0.4]
  );

  const iconColor = isSidebarOpen ? 'white' : 'black';

  return (
    <Fragment>
      <Aside
        style={sidebarAnimationProps}
        isOpen={isSidebarOpen}
      >
        <BurgerWrapper
          style={centerAlignAnimationProps}
        >
          <button
            onClick={() => toggleSidebar(!isSidebarOpen)}
          >
            {
              isSidebarOpen
              ? (<CloseIcon color={iconColor} size={26} />)
              : (<MenuIcon color={iconColor} size={26} />)
            }
          </button>
        </BurgerWrapper>
        <Header
          style={sidebarContentAnimationProps}
        >
          <h2>Oleksandra Vasylenko</h2>
          <h4>Student, 3D Artist</h4>
        </Header>
        <MenuList
          style={sidebarContentAnimationProps}
        >
          <li><Link to="/">Portfolio</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </MenuList>
        <SocialList>
          <li><InstagramIcon color={iconColor} /></li>
          <li><EmailOutlineIcon color={iconColor} /></li>
        </SocialList>
      </Aside>
      <Main
        style={resetMainPaddingAnimationProps}
      >
        {children}
      </Main>
    </Fragment>
  );
}
