import React from 'react';
import Helmet from 'react-helmet';

const OGP = ({ title, description, image }) => (
  <Helmet>
    <meta property="og:site_name" content="www.aurelins.com" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
  </Helmet>
);

export default OGP;
