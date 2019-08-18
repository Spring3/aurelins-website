const path = require('path');

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;
  return new Promise((resolve, reject) => {
    const portfolioItemTemplate = path.resolve('./src/templates/portfolio-item.jsx');
    resolve(
      graphql(`
        {
          allContentfulPortfolioItem {
            edges {
              node {
                title
                slug
              }
            }
          }
        }
      `).then((result) => {
        if (result.errors) {
          console.log(result.errors);
          return reject(result.errors);
        }
        
        const posts = result.data.allContentfulPortfolioItem.edges;
        posts.forEach((post, index) => {
          createPage({
            path: `/portfolio/${post.node.slug}`,
            component: portfolioItemTemplate,
            context: {
              slug: post.node.slug
            }
          })
        });
      })
    )
  });
}
