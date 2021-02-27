import _ from 'lodash';

export default (data, id = null) => {
  const feedId = id ?? _.uniqueId();
  const feed = {
    id: feedId,
    title: data.title,
    link: data.link,
    description: data.description,
  };
  const posts = data.items.map((item) => {
    const { title, link, description } = item;
    return {
      id: _.uniqueId(),
      feedId,
      title,
      link,
      description,
    };
  });

  return {
    feed,
    posts,
  };
};
