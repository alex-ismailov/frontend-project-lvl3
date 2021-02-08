/* eslint no-param-reassign: 0 */

export const renderInputError = (isValid, input) => {
  if (!isValid) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
};

export const renderFeedback = (error, element) => {
  if (error) {
    element.textContent = error;
    element.classList.add('text-danger');
    return;
  }
  element.classList.remove('text-danger');
  element.textContent = 'Rss has been loaded';
  element.classList.add('text-success');
};

export const renderFeeds = (feeds, feedsBlock) => {
  if (!feedsBlock.hasChildNodes()) {
    const title = document.createElement('h2');
    title.textContent = 'Feeds';
    feedsBlock.append(title);
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');
    feedsBlock.append(ul);
  }

  const listGroup = feedsBlock.querySelector('.list-group');
  listGroup.innerHTML = '';
  feeds.forEach((feed) => {
    const title = document.createElement('h3');
    title.textContent = feed.title;
    const description = document.createElement('p');
    description.textContent = feed.description;

    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border');
    item.append(title, description);
    listGroup.append(item);
  });
};

export const renderPosts = () => {};
