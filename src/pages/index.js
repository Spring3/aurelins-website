import React from 'react';
import { graphql } from 'gatsby';
import 'normalize.css';

import Layout from '../layouts/MainLayout';
import Carousel from '../components/Carousel';

export default ({ data }) => {
  const { allContentfulWallpaper = {} } = data;
  const items = allContentfulWallpaper.edges || [];
  const images = items.reduce((acc, { node }) => acc.concat(node.images), []);
  return (
    <Layout>
      <Carousel images={images} />
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
