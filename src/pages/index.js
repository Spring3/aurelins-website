import React from 'react';
import { graphql } from 'gatsby';
import 'normalize.css';
import styled from 'styled-components';

import Layout from '../layouts/MainLayout';
import Carousel from '../components/Carousel';

const Filler = styled.div`
  flex-grow: 1;
`;

export default ({ data }) => {
  const { allContentfulWallpaper = {} } = data;
  const items = allContentfulWallpaper.edges || [];
  const images = items.reduce((acc, { node }) => acc.concat(node.images), []);
  return (
    <Layout>
      <Carousel images={images} />
      { /* to have footer automatically pushed to the bottom of hte page */ }
      <Filler />
    </Layout>
  );
}

export const query = graphql`
  query getAllWallpapers {
    allContentfulWallpaper {
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
