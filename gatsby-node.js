const path = require('path');
const { createFileNodeFromBuffer } = require('gatsby-source-filesystem');
const JSZip = require('jszip');
const request = require('request-promise-native');

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
        for (const post of posts) {
          createPage({
            path: `/portfolio/${post.node.slug}`,
            component: portfolioItemTemplate,
            context: {
              slug: post.node.slug
            }
          })
        }
      })
    )
  });
}

exports.sourceNodes = ({ actions, store, cache, createNodeId, getNodes, linkChildren }) => {
  const { createNode } = actions;

  const archives = getNodes().filter(node => node.internal.type === 'ContentfulAsset' && node.file.contentType === 'application/zip');
  const promises = archives.map((node) => {
    return request.get(`https:${node.file.url}`, { encoding: null })
      .then(JSZip.loadAsync)
      .then((zip) => {
        for (const file of Object.keys(zip.files)) {
          const context = zip.file(file);
          if (/^__MACOSX|.DS_Store$/.test(file) || !context || context.dir) {
            continue;
          }
          console.log('fileName', context.name);
          console.log('file', file);
          context.async('nodebuffer')
            .then(async (buffer) => {
              const fileNode = await createFileNodeFromBuffer({
                buffer,
                store,
                parentNodeId: node.id,
                cache,
                name: context.name,
                hash: file,
                createNode,
                createNodeId
              });
              node.localField___NODE = (node.localField___NODE || []).concat([fileNode]);
            });
        }
      }).then(() => {
        console.log('node', node);
      })
  });
    // console.log('node', node);
    // promises.push(createRemoteFileNode({
    //   url: `https:${node.file.url}`,
    //   parentNodeId: node.id,
    //   store,
    //   cache,
    //   createNode,
    //   createNodeId
    // }).then((fileNode) => {
    //   console.log('fileNode', fileNode);
    //   node.localFile___NODE = fileNode.id;
    // }))
  return Promise.all(promises);
  // return new Promise((resolve, reject) => {
  //   resolve(
  //     gql(`
  //       {
  //         allContentfulPortfolioItem {
  //           edges {
  //             node {
  //               id
  //               model {
  //                 file {
  //                   url
  //                   contentType
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     `).then((result) => {
  //       if (result.errors) {
  //         console.log(result.errors);
  //         return reject(result.errors);
  //       }
  //       const posts = result.data.allContentfulPortfolioItem.edges;
  //       for (const post of posts) {
  //         const modelFile = post.node.model.file;
  //         console.log('modelFile', modelFile);

  //         if ('application/zip' === modelFile.contentType) {
  //           createRemoteFileNode({
  //             url: modelFile.url,
  //             parentNodeId: post.node.id,
  //             store,
  //             cache,
  //             createNode,
  //             createNodeId
  //           }).then((fileNode) => {
  //             console.log('fileNode', fileNode);
  //             modelFile.localFile = fileNode.id;
  //           }).catch((e) => {});
  //         }
  //       }
  //     })
  //   )
  // });           
}
