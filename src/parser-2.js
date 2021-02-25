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
  const dataCopy = { ...data };
  const parser = new DOMParser();
  const feedXmlDocument = parser.parseFromString(data, 'application/xml');

  const xmlItems = feedXmlDocument.querySelectorAll('item');
  const items = Array.from(xmlItems).map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    return {
      title,
      link,
      description,
    };
  });

  const channel = {
    title: feedXmlDocument.querySelector('title').textContent,
    description: feedXmlDocument.querySelector('description').textContent,
    link: feedUrl,
    items, 
  };

  return channel;
};

// Эту структуру дожен отдать парсер
const channel = {
  title: 'Новые уроки',
  description: 'hjkhkh',
  link: 'А вот здесь надо подставить feedUrl',
  items: [
    {
      title: 'hjkhkh',
      link: 'hjkhkj',
      description: 'hjkhkh',
    }
  ],
}
