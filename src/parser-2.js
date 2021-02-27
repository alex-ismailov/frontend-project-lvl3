export default (data, feedUrl) => {
  // const dataCopy = { ...data }
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
// const channel = {
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
