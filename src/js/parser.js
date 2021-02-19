import _ from 'lodash';

const buildFeed = (feedXmlDocument, feedUrl) => {
  const feedId = _.uniqueId();
  const feedTitle = feedXmlDocument.querySelector('title').textContent;
  const feedDescription = feedXmlDocument.querySelector('description').textContent;
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
    feedInfo: {
      id: feedId,
      title: feedTitle,
      description: feedDescription,
      link: feedUrl,
    },
    posts: feedPosts,
  };
};

export default (data, feedUrl) => {
  const parser = new DOMParser();
  const feedXmlDocument = parser.parseFromString(data, 'application/xml');

  return buildFeed(feedXmlDocument, feedUrl);
};
