import React, { useState } from 'react';
import { graphql } from 'gatsby';
import styled from 'styled-components';

import MainLayout from '../layouts/MainLayout';

const Wrapper = styled.article`
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(11, minmax(20px, 1fr));

  @media (max-width: 900px) {
    margin-top: 100px;
  }
`;

const PreviewImage = styled.figure`
  grid-column: span 6;
  grid-gap: 1rem;
  margin: 0;

  div {
    position: sticky;
    top: 2rem;

    img {
      margin: auto;
      height: auto;
      max-height: 600px;
      max-width: 100%;
      object-fit: cover;
      border-radius: 6px;
      box-shadow: 0px 10px 15px 0px rgba(50, 50, 50, .3);
    }
  }

  @media (max-width: 1200px) {
    grid-column: span 11;
    
    div {
      position: static;

      img {
        margin: none;
        margin: auto;
      }
    }
  }
`;

const Description = styled.div`
  color: #AAA;
  grid-column: span 5;
  padding: 0rem 2rem;

  h1 {
    margin-top: 1rem;
  }
  p {
    line-height: 1.5;
  }

  @media (max-width: 1200px) {
    grid-column: span 11;
    padding: 0;
  }
`;

const Images = styled.div`
  margin-top: 1rem;
  grid-area: i;
  display: grid;
  grid-template-columns: repeat(auto-fit, 200px);
  grid-template-rows: repeat(auto-fit, 200px);
  grid-gap: 1.5rem;

  img {
    height: 100%;
    object-fit: contain !important;
    border-radius: 6px;
    cursor: pointer;
    transition: all .3s ease-in-out;
    vertical-align: middle;
  }

  @media (max-width: 777px) {
    grid-template-columns: repeat(auto-fit, 100px);
    grid-template-rows: repeat(auto-fit,100px);
    margin-bottom: 3rem;
  }
`;

export default ({ data: { contentfulPortfolioItem = {} } }) => {
  const { previewImage, images } = contentfulPortfolioItem;
  const [selectedImage, selectImage] = useState(previewImage);
  return (
    <MainLayout>
      <Wrapper>
        <PreviewImage>
          <div>
            <img
              src={selectedImage.fluid.src}
              srcSet={selectedImage.fluid.srcSet}
              sizes={selectedImage.fluid.sizes}
              alt={selectedImage.description || selectedImage.title}
            />
            <Images>
              { [previewImage, ...images.filter(image => image.title !== previewImage.title)].map(image => (
                  <img
                    onClick={() => selectImage(image)}
                    className={image.title === selectedImage.title ? 'selected' : null}
                    key={image.title}
                    src={image.fluid.src}
                    alt={image.description || image.title}
                    width={200}
                  />
                ))
              }
            </Images>
          </div>
        </PreviewImage>
        <Description>
          <h1>{contentfulPortfolioItem.title}</h1>
          <p>{contentfulPortfolioItem.description.internal.content}</p>
          {/* <p>
            A robot is a machine—especially one programmable by a computer— capable of carrying out a complex series of actions automatically. Robots can be guided by an external control device or the control may be embedded within. Robots may be constructed on the lines of human form, but most robots are machines designed to perform a task with no regard to their aesthetics.<br /><br />
            Robots can be autonomous or semi-autonomous and range from humanoids such as Honda's Advanced Step in Innovative Mobility (ASIMO) and TOSY's TOSY Ping Pong Playing Robot (TOPIO) to industrial robots, medical operating robots, patient assist robots, dog therapy robots, collectively programmed swarm robots, UAV drones such as General Atomics MQ-1 Predator, and even microscopic nano robots. By mimicking a lifelike appearance or automating movements, a robot may convey a sense of intelligence or thought of its own. Autonomous things are expected to proliferate in the coming decade, with home robotics and the autonomous car as some of the main drivers.<br /><br />
            The branch of technology that deals with the design, construction, operation, and application of robots, as well as computer systems for their control, sensory feedback, and information processing is robotics. These technologies deal with automated machines that can take the place of humans in dangerous environments or manufacturing processes, or resemble humans in appearance, behavior, or cognition. Many of today's robots are inspired by nature contributing to the field of bio-inspired robotics. These robots have also created a newer branch of robotics: soft robotics.<br /><br />
            From the time of ancient civilization there have been many accounts of user-configurable automated devices and even automata resembling animals and humans, designed primarily as entertainment. As mechanical techniques developed through the Industrial age, there appeared more practical applications such as automated machines, remote-control and wireless remote-control.<br /><br />
            The term comes from a Czech word, robota, meaning "forced labor"; the word 'robot' was first used to denote a fictional humanoid in a 1920 play R.U.R. (Rossumovi Univerzální Roboti - Rossum's Universal Robots) by the Czech writer, Karel Čapek but it was Karel's brother Josef Čapek who was the word's true inventor. Electronics evolved into the driving force of development with the advent of the first electronic autonomous robots created by William Grey Walter in Bristol, England in 1948, as well as Computer Numerical Control (CNC) machine tools in the late 1940s by John T. Parsons and Frank L. Stulen. The first commercial, digital and programmable robot was built by George Devol in 1954 and was named the Unimate. It was sold to General Motors in 1961 where it was used to lift pieces of hot metal from die casting machines at the Inland Fisher Guide Plant in the West Trenton section of Ewing Township, New Jersey.<br /><br />
            Robots have replaced humans in performing repetitive and dangerous tasks which humans prefer not to do, or are unable to do because of size limitations, or which take place in extreme environments such as outer space or the bottom of the sea. There are concerns about the increasing use of robots and their role in society. Robots are blamed for rising technological unemployment as they replace workers in increasing numbers of functions. The use of robots in military combat raises ethical concerns. The possibilities of robot autonomy and potential repercussions have been addressed in fiction and may be a realistic concern in the future.<br /><br />
          </p> */}
        </Description>
      </Wrapper>
    </MainLayout>
  );
}

export const query = graphql`
  query getPortfolioItem($slug: String!) {
    contentfulPortfolioItem (slug: { eq: $slug }) {
      id
      images {
        title
        description
        fluid (maxWidth: 800) {
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
      slug
      title
      createdAt
      updatedAt
      tags
      previewImage {
        title
        description
        fluid (maxWidth: 800) {
          src
          srcSet
          sizes
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
