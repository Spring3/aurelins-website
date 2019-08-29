import React from 'react';
import 'normalize.css';
import { graphql } from 'gatsby';
import styled from 'styled-components';

import Layout from '../layouts/MainLayout';
import Card from '../components/Card';

const Grid = styled.div`
  padding: 4rem 2rem 4rem 2rem;
  display: grid;
  grid-gap: 1rem;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  grid-template-rows: repeat(auto-fill, minmax(15rem, 1fr));

  @media (max-width: 900px) {
    margin-top: 100px;
  }
`;

export default ({ data }) => {
  const { site = {}, allContentfulPortfolioItem = {} } = data || {};
  const items = allContentfulPortfolioItem.edges || [];
  return (
    <Layout>
      <Grid>
        {
          items.map(({ node }) => (
            <Card
              data={node}
              key={node.contentful_id}
            />
          ))
        }
      </Grid>
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
    allContentfulPortfolioItem(
      sort: {
        fields: [createdAt],
        order: ASC
      },
      limit: 20
    ) {
      edges {
        node {
          title
          contentful_id
          createdAt
          tags
          slides
          slug
          important
          images {
            title
            description
            file {
              url
            }
            fluid {
              src
              srcSet
              sizes
            }
          }
          previewImage {
            title
            file {
              url
            }
            fluid {
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
