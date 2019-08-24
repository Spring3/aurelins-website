import React, { Fragment, useState, useRef } from 'react';
import { Link } from 'gatsby';
import styled, { css, createGlobalStyle } from 'styled-components';
import InstagramIcon from 'mdi-react/InstagramIcon';
import EmailOutlineIcon from 'mdi-react/EmailOutlineIcon';
import MenuIcon from 'mdi-react/MenuIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import { useChain, useSpring, animated } from 'react-spring';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, Arial, sans-serif;
    background: black;
  }
`;

const BurgerWrapper = animated(styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;  

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
  margin-top: 2rem;
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
  padding: 0;
  display: flex;
  transition: all .3s ease-in-out;

  li {
    margin-right: 1rem;
  }
`;

const Aside = animated(styled.aside`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 4rem);
  background: rgba(20,20,20,.8);
  overflow: hidden;
  position: fixed;
  width: 16rem;
  left: 2rem;
  top: 0px;
  padding: 2rem 2rem;

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

  @media (max-width: 777px) {
    flex-direction: row;
    height: 1rem;
    width: 100%;
    z-index: 2;
    justify-content: flex-end;
  }
`);

const Main = animated(styled.main`
  padding-left: 22rem;
  height: 100vh;

  h1 {
    margin-top: 0px;
  }
`);

const useSidebarAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    width: isSidebarOpen
      ? 16 * 16
      : 0,
    background: isSidebarOpen ? 'rgba(20,20,20,.8)' : 'rgba(20,20,20,.0)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useSidebarContentAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    initial: {
      opacity: 0,
      transform: 'translateY(100%)'
    },
    opacity: isSidebarOpen ? 1 : 0,
    transform: isSidebarOpen ? 'translateY(0%)' : 'translateY(100%)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useCenterAlignAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    initial: {
      alignSelf: 'normal'
    },
    alignSelf: isSidebarOpen ? 'normal' : 'center',
    ref: animationRef
  });
  return [animationRef, props];
}

const useResetMainPaddingAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    initial: {
      paddingLeft: 16 * 4
    },
    paddingLeft: isSidebarOpen
      ? 16 * 22
      : 16 * 6,
    ref: animationRef
  });
  return [animationRef, props];
};

export default ({ children }) => {
  const [isSidebarOpen, toggleSidebar] = useState(true);
  const [sidebarAnimationRef, sidebarAnimationProps] = useSidebarAnimation(isSidebarOpen);
  const [sidebarContentAnimationRef, sidebarContentAnimationProps] = useSidebarContentAnimation(isSidebarOpen);
  const [centerAlignAnimationRef, centerAlignAnimationProps] = useCenterAlignAnimation(isSidebarOpen);
  const [resetMainPaddingAnimationRef, resetMainPaddingAnimationProps] = useResetMainPaddingAnimation(isSidebarOpen);

  const animationSequence = [centerAlignAnimationRef, sidebarAnimationRef, resetMainPaddingAnimationRef, sidebarContentAnimationRef];

  useChain(
    isSidebarOpen
      ? animationSequence
      : animationSequence.reverse(),
    isSidebarOpen
      ? [0, 0, 0, 0.38]
      : [0, 0.4, 0.4]
  );

  const iconColor = 'white';

  return (
    <Fragment>
      <GlobalStyle />
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
          <li><Link to="/">Home</Link></li>
          <li><Link to="/portfolio">Portfolio</Link></li>
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
