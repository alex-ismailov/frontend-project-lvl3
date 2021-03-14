export default (data) => {
  if (!data.startsWith('<?xml')) {
    throw new Error('notValidRssFormat');
  }
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
    items,
  };

  return channel;
};
