import React from 'react';
import { graphql } from 'gatsby';

export default ({ data }) => {
  console.log(data);
  return (
    <div>
      <h3>This is a model page</h3>
    </div>
  );
}

export const query = graphql`
  query getPortfolioItem($slug: String!) {
    contentfulPortfolioItem (slug: { eq: $slug }) {
      id
      images {
        title
        description
        fluid {
          src
        }
      }
      description {
        description
        internal {
          type
          mediaType
        }
      }
      slug
      title
      createdAt
      updatedAt
      tags
      previewImage {
        title
        description
        fluid {
          src
        }
      }
      modelFile {
        title
        description
        file {
          url
          fileName
          contentType
        }
      }
    }
  }
`;
