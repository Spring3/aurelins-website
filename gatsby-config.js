module.exports = {
  siteMetadata: {
    title: 'Aurelins website',
    description: 'Oleksandra Vasylenko personal website'
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
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: `${__dirname}/src/pages`
      }
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'content',
        path: `${__dirname}/src/content`
      }
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 1000,
              linkImagesToOriginal: false
            }
          },
          'gatsby-remark-copy-linked-files'
        ],
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
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    'gatsby-plugin-catch-links',
    'gatsby-plugin-offline',
    'gatsby-plugin-styled-components',
    'gatsby-plugin-netlify'
  ]
}
