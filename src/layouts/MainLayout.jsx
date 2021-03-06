import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import styled, { ThemeProvider, css, createGlobalStyle } from 'styled-components';
import InstagramIcon from 'mdi-react/InstagramIcon';
import EmailOutlineIcon from 'mdi-react/EmailOutlineIcon';
import MenuIcon from 'mdi-react/MenuIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import { useChain, useSpring, animated } from 'react-spring';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';

import useWindowResize from '../hooks/useWindowResize';
import Footer from '../components/Footer';
import activeTheme from '../theme';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", Helvetica, Arial, sans-serif;
    background: black;
  }
`;

const BurgerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BurgerButton = animated(styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  svg {
    vertical-align: middle;
  }
`);

const Header = animated(styled.header`
  color: ${props => props.theme.textEmphasizeColor};
  margin-top: 2rem;
  margin-bottom: 4rem;

  h4, h3 {
    color: ${props => props.theme.textColor};
  }

  @media (max-width: 900px) {
    margin: 0;
    h2 {
      font-size: 1.2rem;
      cursor: pointer;
      a, a:active, a:focus, a:visited {
        text-decoration: none !important;
        color: ${props => props.theme.textEmphasizeColor} !important;
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
      color: ${props => props.theme.textColor};
      text-decoration: none;
    }

    a:focus, a:hover, a.active {
      color: ${props => props.theme.textEmphasizeColor};
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
  justify-self: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;

  li {
    margin-right: 1rem;
  }

  @media (min-width: 901px) {
    ${props => !props.isOpen && css`
      flex-direction: column;
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
  padding: 2rem 2rem;
  background: ${props => props.theme.transparentGrey};
  
  flex-direction: column;
  height: calc(100vh - 4rem);
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
  background: ${props => props.theme.transparentGrey};
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
  height: 0vh;
  overflow: hidden;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  h4 {
    color: ${props => props.theme.textColor};
  }
`);

const Main = animated(styled.main`
  padding-left: 22rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

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
    from: {
      width: isSidebarOpen
        ? 16 * 16
        : 0,
      background: isSidebarOpen ? activeTheme.transparentGrey : 'rgba(20,20,20,.0)'
    },
    width: isSidebarOpen
      ? 16 * 16
      : 0,
    background: isSidebarOpen ? activeTheme.transparentGrey : 'rgba(20,20,20,.0)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useMobileSidebarAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    from: {
      width: '100%',
      height: isSidebarOpen ? '91.6vh' : '0vh'
    },
    width: '100%',
    height: isSidebarOpen ? '91.6vh' : '0vh',
    ref: animationRef
  });
  return [animationRef, props];
}

const useSidebarContentAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    from: {
      opacity: isSidebarOpen ? 1 : 0,
      transform: isSidebarOpen ? 'translateY(0%)' : 'translateY(100%)'
    },
    opacity: isSidebarOpen ? 1 : 0,
    transform: isSidebarOpen ? 'translateY(0%)' : 'translateY(100%)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useMobileSidebarContentAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    from: {
      opacity: isSidebarOpen ? 1 : 0,
      transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(-200%)'
    },
    opacity: isSidebarOpen ? 1 : 0,
    transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(-200%)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useMobileSidebarSocialAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    from: {
      opacity: isSidebarOpen ? 1 : 0,
      transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(-200%)'
    },
    opacity: isSidebarOpen ? 1 : 0,
    transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(-200%)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useCenterAlignAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const px = 256 / 2 - 2 * 16;
  const props = useSpring({
    from: {
      transform: isSidebarOpen ? `translateX(${px}px)` : 'translateX(0px)'
    },
    transform: isSidebarOpen ? `translateX(${px}px)` : 'translateX(0px)',
    ref: animationRef
  });
  return [animationRef, props];
}

const useCenterAlignAnimationSocial = (isSidebarOpen) => {
  const animationRef = useRef();
  const px = -.75 * 16;
  const props = useSpring({
    from: {
      transform: isSidebarOpen ? 'translateX(0px)' : `translateX(${px}px)`
    },
    transform: isSidebarOpen ? 'translateX(0px)' : `translateX(${px}px)`,
    ref: animationRef
  });
  return [animationRef, props];
}

const useResetMainPaddingAnimation = (isSidebarOpen) => {
  const animationRef = useRef();
  const props = useSpring({
    from: {
      paddingLeft: isSidebarOpen
        ? 16 * 22
        : 16 * 6
    },
    paddingLeft: isSidebarOpen
      ? 16 * 22
      : 16 * 6,
    ref: animationRef
  });
  return [animationRef, props];
};

export default ({ children }) => {
  const [screenWidth, isMobile] = useWindowResize();
  const targetElement = useRef(null);
  const [isOpen, toggleSidebar] = useState(false);
  const [sidebarAnimationRef, sidebarAnimationProps] = useSidebarAnimation(isOpen);
  const [sidebarContentAnimationRef, sidebarContentAnimationProps] = useSidebarContentAnimation(isOpen);
  const [centerAlignAnimationRef, centerAlignAnimationProps] = useCenterAlignAnimation(isOpen);
  const [centerAlignAnimationSocialRef, centerAlignAnimationSocialProps] = useCenterAlignAnimationSocial(isOpen);
  const [resetMainPaddingAnimationRef, resetMainPaddingAnimationProps] = useResetMainPaddingAnimation(isOpen);

  const [mobileSidebarAnimationRef, mobileSidebarAnimationProps] = useMobileSidebarAnimation(isOpen);
  const [mobileSidebarContentAnimationRef, mobileSidebarContentAnimationProps] = useMobileSidebarContentAnimation(isOpen);
  const [mobileSidebarSocialAnimationRef, mobileSidebarSocialAnimationProps] = useMobileSidebarSocialAnimation(isOpen);
  
  const animationSequence = isMobile
    ? [mobileSidebarAnimationRef, mobileSidebarContentAnimationRef, centerAlignAnimationSocialRef, mobileSidebarSocialAnimationRef]
    : [centerAlignAnimationRef, centerAlignAnimationSocialRef, sidebarAnimationRef, resetMainPaddingAnimationRef, sidebarContentAnimationRef];

  const timestamps = isMobile
    ? isOpen ? [0] : [0, 0, 0, .8]
    : isOpen ? [0, 0, 0, 0, 0.38] : [0, 0.4, 0.4, 0.4];

  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
      }
    `
  );

  // restoring the saved state of the sidebar
  useEffect(() => {
    const savedSidebarState = typeof window !== 'undefined' && window.sessionStorage.getItem('sidebar');
    console.log('state', typeof savedSidebarState === 'string' ? savedSidebarState === 'true' : !isMobile);
    toggleSidebar(typeof savedSidebarState === 'string' ? savedSidebarState === 'true' : !isMobile);
  }, []);

  useEffect(() => {
    document.title = data.site.siteMetadata.title;
  }, []);

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

  const onSidebarClick = () => {
    toggleSidebar(!isOpen);
    typeof window !== 'undefined' && window.sessionStorage.setItem('sidebar', !isOpen);
  }

  const iconColor = activeTheme.textEmphasizeColor;

  return (
    <ThemeProvider theme={activeTheme}>
      <GlobalStyle />
      {
        !isMobile && (
          <DesktopSidebar
            style={sidebarAnimationProps}
            isOpen={isOpen}
          >
            <BurgerWrapper>
              <BurgerButton
                onClick={onSidebarClick}
                style={centerAlignAnimationProps}
              >
                {
                  isOpen
                    ? (<CloseIcon color={iconColor} size={26} />)
                    : (<MenuIcon color={iconColor} size={26} />)
                }
              </BurgerButton>
            </BurgerWrapper>
            <Header
              style={sidebarContentAnimationProps}
            >
              <h2>Oleksandra Vasylenko</h2>
              <h4>@Aurelins</h4>
              <h4>Student, 3D Artist</h4>
            </Header>
            <MenuList
              style={sidebarContentAnimationProps}
            >
              <li><Link to="/" activeClassName="active">Home</Link></li>
              <li><Link to="/portfolio" activeClassName="active">Portfolio</Link></li>
            </MenuList>
            <SocialList
              isOpen={isOpen}
              style={centerAlignAnimationSocialProps}
            >
              <li>
                <a
                  href="https://www.instagram.com/aurelins_3d.artist"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <InstagramIcon color={iconColor} />
                </a>
              </li>
              <li>
                <a
                  href="mailto:aurelins@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <EmailOutlineIcon color={iconColor} />
                </a>
              </li>
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
                  <BurgerButton
                    onClick={onSidebarClick}
                  >
                    {
                      isOpen
                        ? (<CloseIcon color={iconColor} size={26} />)
                        : (<MenuIcon color={iconColor} size={26} />)
                    }
                  </BurgerButton>
                </BurgerWrapper>
              </MobileNav>
              <MobileSidebarContent
                style={mobileSidebarAnimationProps}
                id="nav-mobile"
              >
                <h4>@Aurelins</h4>
                <h4>Student, 3D Artist</h4>
                <MenuList style={mobileSidebarContentAnimationProps}>
                  <li onClick={onSidebarClick}>
                    <Link
                      to="/"
                      activeClassName="active"
                    >
                      Home
                    </Link>
                  </li>
                  <li onClick={onSidebarClick}>
                    <Link
                      to="/portfolio"
                      activeClassName="active"
                    >
                      Portfolio
                    </Link>
                  </li>
                </MenuList>
                <SocialList style={mobileSidebarSocialAnimationProps}>
                  <li>
                    <a
                      href="https://www.instagram.com/aurelins_3d.artist"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramIcon color={iconColor} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="mailto:aurelins@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <EmailOutlineIcon color={iconColor} />
                    </a>
                  </li>
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
        <Footer />
      </Main>
    </ThemeProvider>
  );
}
