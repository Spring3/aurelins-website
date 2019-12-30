let contentfulConfig;

try {
  contentfulConfig = require('./.contentful.json');
} catch (_) {}

contentfulConfig = {
  spaceId: process.env.CONTENTFUL_SPACE_ID || contentfulConfig.spaceId,
  accessToken: process.env.CONTENTFUL_DELIVERY_TOKEN || contentfulConfig.accessToken
};

const { spaceId, accessToken } = contentfulConfig;

if (!spaceId || !accessToken) {
  throw new Error(
    'Contentful spaceId and the delivery token need to be provided.'
  );
}

module.exports = {
  siteMetadata: {
    title: 'Aurelins portfolio',
    description: 'Oleksandra Vasylenko personal portfolio website'
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'test',
        short_name: 'test',
        start_url: '/',
        background_color: '#fff',
        theme_color: '#fff',
        display: 'standalone',
        // icon: 'statis/icon.png'
      }
    },
    {
      resolve: 'gatsby-plugin-nprogress',
      options: {
        showSpinner: false,
        color: '#A9E5BB'
      }
    },
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: ''
      }
    },
    'gatsby-plugin-netlify-cache',
    'gatsby-plugin-offline',
    'gatsby-plugin-styled-components',
    {
      resolve: 'gatsby-source-contentful',
      options: contentfulConfig
    },
    'gatsby-plugin-netlify'
  ]
}
