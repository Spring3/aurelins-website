import React, { useState, useEffect } from 'react';
import { graphql } from 'gatsby';
import styled, { css } from 'styled-components';

import MainLayout from '../layouts/MainLayout';
import { withImagePreload } from '../hoc/withImagePreload';
import OGP from '../components/OGP';
import ModelView from '../components/3DModelView';

const Wrapper = styled.article`
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(12, minmax(20px, 1fr));

  @media (max-width: 900px) {
    margin-top: 100px;
  }
`;

const ImageWrapper = styled.figure`
  grid-column: span 6;
  grid-gap: 1rem;
  margin: 0;

  .images {
    display: flex;
    flex-direction: column;
    align-items: center;
    top: 2rem;
  }

  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const PreviewImage = withImagePreload(styled.img`
  margin-bottom: 2rem;
  height: auto;
  max-height: 600px;
  max-width: 100%;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0px 10px 15px 0px rgba(50, 50, 50, .3);
  

  ${({ isLoading }) => isLoading && css`
    filter: blur(10px);
  `}

  &:last-child {
    margin-bottom: 0;
  }
`);

const Description = styled.div`
  color: #AAA;
  grid-column: span 6;
  padding: 0rem 2rem 0rem 4rem;

  div {
    position: sticky;
    top: 2rem;
    h1 {
      margin-top: 1rem;
    }
    p {
      line-height: 1.5;
      text-align: justify;
    }
  }

  @media (max-width: 1450px) {
    grid-column: span 6;
  }

  @media (max-width: 1200px) {
    grid-column: span 12;
    padding: 0;
  }
`;

export default ({ data: { contentfulPortfolioItem = {} } }) => {
  const { previewImage, images } = contentfulPortfolioItem;
  const [itemImages, setImages] = useState([]);

  useEffect(() => {
    setImages([previewImage, ...images.filter(image => image.title !== previewImage.title)]);
  }, []);

  return (
    <MainLayout>
      <OGP
        title={contentfulPortfolioItem.title}
        description={contentfulPortfolioItem.description}
        image={previewImage.fluid.src}
      />
      <Wrapper>
        <ImageWrapper>
          <div className="images">
            {
              itemImages.map((image, i) => (
                <PreviewImage
                  key={i}
                  preview={image.file.url}
                  src={image.fluid.src}
                  srcSet={image.fluid.srcSet}
                  sizes={image.fluid.sizes}
                  alt={image.description || image.title}
                />
              ))
            }
          </div>
          <ModelView src={contentfulPortfolioItem.model.file.url} />
        </ImageWrapper>
        <Description>
          <div>
            <h1>{contentfulPortfolioItem.title}</h1>
            <p>{contentfulPortfolioItem.description.internal.content}</p>
          </div>
        </Description>
      </Wrapper>
    </MainLayout>
  );
}

export const query = graphql`
  query getPortfolioItem($slug: String!) {
    contentfulPortfolioItem (id: { eq: $slug }) {
      id
      contentful_id
      images {
        title
        description
        file {
          url
        }
        fluid (maxWidth: 800, quality: 80) {
          src
          srcSet
          sizes
        }
      }
      description {
        internal {
          content
        }
      }
      title
      createdAt
      updatedAt
      previewImage {
        title
        description
        file {
          url
        }
        fluid (maxWidth: 800, quality: 80) {
          src
          srcSet
          sizes
        }
      }
      model {
        title
        description
        file {
          url
          fileName
        }
      }
    }
  }
`;
