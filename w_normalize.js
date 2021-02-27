// => in =>
// {
//   title,
//   description',
//   link,
//   items: [
//     {
//       title,
//       link,
//       description,
//     },
//   ],
// };

// export default (data, feedId = null) => {
//   const id = feedId ?? _.uniqueId();
//   const posts = data.items.map((item) => {
//     const { title, link, description } = item;
//     return {
//       id: _.uniqueId(),
//       feedId: id,
//       title,
//       link,
//       description,
//     };
//   });

//   return {
//     feed,
//     id,
//     title: data.title,
//     link: data.link,
//     description: data.description,
//     posts,
//   };
// };

export default (data, feedId = null) => {
  const id = feedId ?? _.uniqueId();
  const feed = {
    id,
    title: data.title,
    link: data.link,
    description: data.description,
  };
  const posts = data.items.map((item) => {
    const { title, link, description } = item;
    return {
      id: _.uniqueId(),
      feedId: id,
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

// const channelData = normalize(channel);
// const channelData = {
//   feed: {
//     id,
//     title,
//     link,
//     description,
//   },
//   posts: [
//     {
//       id: 2,
//       feedId: 1,
//       title: 'hjkjh',
//       link,
//       description: 'jkljlj',
//     },
//   ],
// };

// => out =>
// {
//   feeds: [
//     {
//       id: 1,
//       title: 'hjkjh',
//       description: 'jkljlj',
//     },
//   ],
//   posts: [
//     {
//       id: 2,
//       feedId: 1,
//       title: 'hjkjh',
//       link,
//       description: 'jkljlj',
//     }
//   ],
// }
