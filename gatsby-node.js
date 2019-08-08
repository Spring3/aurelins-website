const path = require('path');
const { createFilePath } = require('gatsby-source-filesystem');

exports.onCreateNode = ({ node, getNode, actions}) => {
  if (node.internal.type === 'MarkdownRemark') {
    const { createNodeField } = actions;
    const slug = createFilePath({ node, getNode, basePath: 'content' });
    console.log('slug', slug);
    createNodeField({
      node,
      name: 'slug',
      value: slug
    });
  }
}

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `).then(({ data }) => {
    if (data) {
      for (const { node } of data.allMarkdownRemark.edges) {
        createPage({
          path: node.fields.slug,
          component: path.resolve('./src/templates/models.jsx'),
          context: {
            slug: node.fields.slug
          }
        });
      }
    }
  });
}
