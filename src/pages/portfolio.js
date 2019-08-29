import React, { useState } from 'react';
import 'normalize.css';
import { graphql } from 'gatsby';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';

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

  @media (max-width: 591px) {
    padding: 2rem;
    grid-gap: 2rem;
  }
`;

export default ({ data }) => {
  const { allContentfulPortfolioItem = {} } = data || {};
  const items = allContentfulPortfolioItem.edges || [];
  const [batch, setBatch] = useState(1);
  const batchSize = 3;

  return (
    <Layout>
      <InfiniteScroll
        element={Grid}
        pageStart={0}
        loadMore={(page) => setBatch(page + 1)}
        hasMore={batch * batchSize < items.length}
      >
        {
          items.slice(0, batch * batchSize).map(({ node }) => (
            <Card
              data={node}
              key={node.contentful_id}
            />
          ))
        }
      </InfiniteScroll>
    </Layout>
  );
}


export const query = graphql`
  query AllPortfolioItems {
    allContentfulPortfolioItem(
      sort: {
        fields: [createdAt],
        order: ASC
      }
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
