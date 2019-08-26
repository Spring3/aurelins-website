import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Link } from 'gatsby';
import styled, { css, createGlobalStyle } from 'styled-components';
import InstagramIcon from 'mdi-react/InstagramIcon';
import EmailOutlineIcon from 'mdi-react/EmailOutlineIcon';
import MenuIcon from 'mdi-react/MenuIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import { useChain, useSpring, animated } from 'react-spring';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import useWindowResize from '../hooks/useWindowResize';

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

  @media (max-width: 900px) {
    margin: 0;
    h2 {
      font-size: 1.2rem;
      cursor: pointer;
      a, a:active, a:focus, a:visited {
        text-decoration: none !important;
        color: white !important;
      }
    }
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

    a:focus, a:hover, a.active {
      color: white;
    }
  }

  @media (max-width: 900px) {
    box-sizing: border-box;
    margin-top: 4rem;
    li {
      font-size: .9rem;
    }
  }
`);

const SocialList = animated(styled.ul`
  justify-self: flex-end;
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  transition: all .3s ease-in-out;

  li {
    margin-right: 1rem;
  }

  @media (min-width: 901px) {
    ${props => !props.isOpen && css`
      flex-direction: column;
      align-self: center;
      li {
        margin-right: 0;
        margin-top: 1rem;
      }
    `}
  }

  @media (max-width: 900px) {
    margin-top: 4rem;
    height: 100px;
  }
`);

const DesktopSidebar = animated(styled.aside`
  display: flex;
  top: 0px;
  padding: 1rem 2rem;
  background: rgba(20,20,20,.98);
  
  flex-direction: column;
  height: calc(100vh - 2rem);
  overflow: hidden;
  position: fixed;
  width: 16rem;
  left: 2rem;
`);

const MobileSidebar = styled.aside`
  height: auto;
  top: 0px;
  z-index: 1;
  padding: 1rem 2rem;
  background: rgba(20,20,20,.98);
  box-sizing: border-box;
  width: 100%;
  position: fixed;
  left: 0;
`;

const MobileNav = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MobileSidebarContent = animated(styled.div`
  overflow: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  h4 {
    color: #AAA;
  }
`);

const Main = animated(styled.main`
  padding-left: 22rem;
  height: 100vh;

  h1 {
    margin-top: 0px;
  }

  @media (max-width: 900px) {
    padding-left: 0 !important;
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

const useMobileSidebarAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    width: '100%',
    height: isSidebarOpen ? '91.6vh' : '0vh',
    ref: animationRef
  });
  return [animationRef, props];
}

const useSidebarContentAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    opacity: isSidebarOpen ? 1 : 0,
    transform: isSidebarOpen ? 'translateY(0%)' : 'translateY(100%)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useMobileSidebarContentAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    opacity: isSidebarOpen ? 1 : 0,
    transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(-200%)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useMobileSidebarSocialAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    opacity: isSidebarOpen ? 1 : 0,
    transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(-200%)',
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
      ? 16 * 22
      : 16 * 6,
    ref: animationRef
  });
  return [animationRef, props];
};

export default ({ children }) => {
  const screenWidth = useWindowResize();
  const targetElement = useRef(null);
  const isMobile = screenWidth <= 900;
  const [isOpen, toggleSidebar] = useState(!isMobile);
  const [sidebarAnimationRef, sidebarAnimationProps] = useSidebarAnimation(isOpen);
  const [sidebarContentAnimationRef, sidebarContentAnimationProps] = useSidebarContentAnimation(isOpen);
  const [centerAlignAnimationRef, centerAlignAnimationProps] = useCenterAlignAnimation(isOpen);
  const [resetMainPaddingAnimationRef, resetMainPaddingAnimationProps] = useResetMainPaddingAnimation(isOpen);

  const [mobileSidebarAnimationRef, mobileSidebarAnimationProps] = useMobileSidebarAnimation(isOpen);
  const [mobileSidebarContentAnimationRef, mobileSidebarContentAnimationProps] = useMobileSidebarContentAnimation(isOpen);
  const [mobileSidebarSocialAnimationRef, mobileSidebarSocialAnimationProps] = useMobileSidebarSocialAnimation(isOpen);
  
  const animationSequence = isMobile
    ? [mobileSidebarAnimationRef, mobileSidebarContentAnimationRef, mobileSidebarSocialAnimationRef]
    : [centerAlignAnimationRef, sidebarAnimationRef, resetMainPaddingAnimationRef, sidebarContentAnimationRef];

  const timestamps = isMobile
    ? isOpen ? [0] : [0, 0, .8]
    : isOpen ? [0, 0, 0, 0.38] : [0, 0.4, 0.4];

  useEffect(() => {
    if (isMobile) {
      targetElement.current = document.querySelector('#nav-mobile');
    } else {
      targetElement.current = null;
    }
  }, [screenWidth]);

  useEffect(() => {
    if (isOpen && isMobile && targetElement.current) {
      disableBodyScroll(targetElement.current);
    }
    return () => enableBodyScroll(targetElement.current);
  }, [isOpen]);
  
  useEffect(() => clearAllBodyScrollLocks, []);

  useChain(
    isOpen
      ? animationSequence
      : animationSequence.reverse(),
    timestamps
  );

  const iconColor = 'white';

  return (
    <Fragment>
      <GlobalStyle />
      {
        !isMobile && (
          <DesktopSidebar
            style={sidebarAnimationProps}
            isOpen={isOpen}
          >
            <BurgerWrapper
              style={centerAlignAnimationProps}
            >
              <button
                onClick={() => toggleSidebar(!isOpen)}
              >
                {
                  isOpen
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
              <li><Link to="/" activeClassName="active">Home</Link></li>
              <li><Link to="/portfolio" activeClassName="active">Portfolio</Link></li>
              <li><Link to="/contact" activeClassName="active">Contact</Link></li>
            </MenuList>
            <SocialList isOpen={isOpen}>
              <li><InstagramIcon color={iconColor} /></li>
              <li><EmailOutlineIcon color={iconColor} /></li>
            </SocialList>
          </DesktopSidebar>
        )
      }
      {
        isMobile && (
          <Fragment>
            <MobileSidebar
              isOpen={isOpen}
            >
              <MobileNav>
                <Header>
                  <h2><Link to="/">Oleksandra Vasylenko</Link></h2>
                </Header>
                <BurgerWrapper>
                  <button
                    onClick={() => toggleSidebar(!isOpen)}
                  >
                    {
                      isOpen
                        ? (<CloseIcon color={iconColor} size={26} />)
                        : (<MenuIcon color={iconColor} size={26} />)
                    }
                  </button>
                </BurgerWrapper>
              </MobileNav>
              <MobileSidebarContent
                style={mobileSidebarAnimationProps}
                id="nav-mobile"
              >
                <h4>Student, 3D Artist</h4>
                <MenuList style={mobileSidebarContentAnimationProps}>
                  <li><Link to="/" activeClassName="active">Home</Link></li>
                  <li><Link to="/portfolio" activeClassName="active">Portfolio</Link></li>
                  <li><Link to="/contact" activeClassName="active">Contact</Link></li>
                </MenuList>
                <SocialList style={mobileSidebarSocialAnimationProps}>
                  <li><InstagramIcon color={iconColor} /></li>
                  <li><EmailOutlineIcon color={iconColor} /></li>
                </SocialList>
              </MobileSidebarContent>
            </MobileSidebar>
          </Fragment>
        )
      }
      <Main        
        style={isMobile ? null : resetMainPaddingAnimationProps}
      >
        {children}
      </Main>
    </Fragment>
  );
}
