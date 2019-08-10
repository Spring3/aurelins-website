import React from 'react';
import 'normalize.css';
import { graphql } from 'gatsby';

import Layout from '../layouts/MainLayout';

export default ({ data }) => {
  const { site = {}, allContentfulPortfolioItem = {} } = data || {};
  const items = allContentfulPortfolioItem.edges || [];
  return (
    <Layout>
      {
        items.map(({ node }) => (
          <div>
            <h2>{node.title}</h2>
            <img
              
              src={node.previewImage.fluid.src}
              srcSet={node.previewImage.fluid.srcSet}
              sizes={node.previewImage.fluid.sizes}
              alt={node.previewImage.title}
            />
            <ul>
              {node.tags.map((tag, i) => (<li key={i}>{tag}</li>))}
            </ul>
            <span>Created at: ${node.createdAt}</span>
          </div>
        ))
      }
    </Layout>
  );
}

export const query = graphql`
  query AllPortfolioItems {
    site {
      siteMetadata {
        title
      }
    }
    allContentfulPortfolioItem {
      edges {
        node {
          title
          contentful_id
          createdAt
          tags
          images {
            title
            description
            fluid {
              src
              srcSet
              sizes
            }
          }
          previewImage {
            title
            fluid(maxWidth: 300, maxHeight: 210) {
              src
              srcSet
              sizes
            }
          }
        }
      }
    }
  }
`
