import React from 'react';
import { graphql } from 'gatsby';
import 'normalize.css';
import styled from 'styled-components';

import Layout from '../layouts/MainLayout';
import Carousel from '../components/Carousel';
import OGP from '../components/OGP';

const Filler = styled.div`
  flex-grow: 1;
`;

export default ({ data }) => {
  const { site = {}, allContentfulBackgroundImages = {} } = data;
  const items = allContentfulBackgroundImages.edges || [];
  const images = items[0].node.images || [];

  return (
    <Layout>
      <OGP
        title={site.siteMetadata.title}
        description={site.siteMetadata.description}
        image={items[0].node.images[0].file.url}
      />
      <Carousel images={images} />
      { /* to have footer be automatically pushed to the bottom of the page */ }
      <Filler />
    </Layout>
  );
}

export const query = graphql`
  query getAllWallpapers {
    site {
      siteMetadata {
        title
        description
      }
    }
    allContentfulBackgroundImages {
      edges {
        node {
          images {
            file {
              url
            }
          }
        }
      }
    }
  }
`;
