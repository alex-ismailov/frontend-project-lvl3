import _ from 'lodash';

const buildFeed = (feedXmlDocument) => {
  console.log(feedXmlDocument);
  const feedId = _.uniqueId();
  const feedTitle = feedXmlDocument.querySelector('title').textContent;
  const feedDescription = feedXmlDocument.querySelector('description').textContent;
  const feedLink = feedXmlDocument.querySelector('link').textContent;
  const items = feedXmlDocument.querySelectorAll('item');
  const feedPosts = Array.from(items).map((item) => {
    const postId = _.uniqueId();
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    const postLink = item.querySelector('link').textContent;
    return {
      id: postId,
      feedId,
      title: postTitle,
      description: postDescription,
      link: postLink,
    };
  });

  return {
    feed: {
      id: feedId,
      title: feedTitle,
      description: feedDescription,
      link: feedLink,
    },
    posts: feedPosts,
  };
};

export default (data) => {
  const parser = new DOMParser();
  const feedXmlDocument = parser.parseFromString(data.data.contents, 'text/xml');
  const feed = buildFeed(feedXmlDocument);

  return feed;
};
