import React from 'react';
import styled from 'styled-components';

import ImageSlider from './ImageSlider';
import CardImage from './CardImage';

const Card = styled.div`
  position: relative;
  min-height: 300px;
  overflow: hidden;
  
  h2 {
    margin: 0;
  }

  .date {
    position: absolute;
    left: 1rem;
    top: 1rem;
    opacity: 0;
    color: white;
    font-size: .8rem;
    background: ${props => props.slides ? 'transparent' : '#8AA27D'};
  }

  .info {
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    opacity: 0;
    color: white;
    h2 {
      margin-bottom: 1rem;
    }
  }

  &:hover {
    cursor: pointer;

    img {
      opacity: .3;
    }

    .info {
      opacity: 1;
    }

    .date {
      opacity: 1;
    }
  }
`;

const TagList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: inline-flex;
  font-size: .7rem;

  li {
    margin-right: 1rem;
    color: white;
    padding: 5px;
    border: 1px solid white;
    border-radius: 3px;
  }
`;

const months = [
  undefined,
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
];

export default ({ data }) => {
  const createdAt = new Date(data.createdAt);
  return (
    <Card slides={!!data.slides}>
      {
        !!data.slides
        ? (
          <ImageSlider
            images={data.images}
            preview={data.previewImage}
          />
        ) 
        : (
          <CardImage
            src={data.previewImage.fluid.src}
            srcSet={data.previewImage.fluid.srcSet}
            alt={data.previewImage.title}
          />
        )
      }
      <div className="date">
        <span>{createdAt.getDay()} {months[createdAt.getMonth()]} {createdAt.getFullYear()}</span>
      </div>
      <div className="info">
        <h2>{data.title}</h2>
        <TagList>
          {data.tags.map((tag, i) => (<li key={i}>{tag}</li>))}
        </TagList>
      </div>
    </Card>
  );
}