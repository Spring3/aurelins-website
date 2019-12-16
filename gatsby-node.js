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
                id
                title
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
        for (const post of posts) {
          const slug = encodeURIComponent(post.node.title.toLowerCase().split(' ').join('-'));
          createPage({
            path: `/portfolio/${slug}`,
            component: portfolioItemTemplate,
            context: {
              slug: post.node.id
            }
          })
        }
      })
    )
  });
}
