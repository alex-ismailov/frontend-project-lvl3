/* eslint no-param-reassign: 0 */

import i18next from 'i18next';

export const renderInputError = (isValid, input) => {
  if (!isValid) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
};

export const renderFeedback = (message, element) => {
  if (message !== 'success') {
    element.textContent = message;
    element.classList.add('text-danger');
    return;
  }
  element.classList.remove('text-danger');
  element.textContent = i18next.t(message);
  element.classList.add('text-success');
};

const addTitle = (titleContent, element) => {
  const title = document.createElement('h2');
  title.textContent = titleContent;
  element.append(title);
};

const addItemsContainer = (element) => {
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');
  element.append(ul);
};

export const renderFeeds = (feeds, feedsBlock) => {
  if (!feedsBlock.hasChildNodes()) {
    addTitle('Feeds', feedsBlock);
    addItemsContainer(feedsBlock);
  }
  const feedsItemContainer = feedsBlock.querySelector('.list-group');
  feedsItemContainer.innerHTML = '';
  feeds.forEach((feed) => {
    const title = document.createElement('h3');
    title.textContent = feed.title;

    const description = document.createElement('p');
    description.textContent = feed.description;

    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border');

    item.append(title, description);
    feedsItemContainer.append(item);
  });
};

export const renderPosts = (posts, modalState, postsBlock) => {
  if (!postsBlock.hasChildNodes()) {
    addTitle('Posts', postsBlock);
    addItemsContainer(postsBlock);
  }
  const postItemsContainer = postsBlock.querySelector('.list-group');
  postItemsContainer.innerHTML = '';
  posts.forEach((post) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const link = document.createElement('a');
    link.classList.add('fw-bold', 'text-decoration-none');
    link.href = post.link;
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.title;

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-primary', 'btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = 'Preview';

    // Динамически создаваемый контроллер
    button.addEventListener('click', (e) => {
      modalState.currentPostId = e.target.dataset.id;
    });

    item.append(link, button);
    postItemsContainer.append(item);
  });
};

export const addDataToModal = (postData) => {
  const modalWindow = document.querySelector('#modal');
  const modalWindowTitle = modalWindow.querySelector('.modal-title');
  const modalWindowBody = modalWindow.querySelector('.modal-body');
  const modalWindowLink = modalWindow.querySelector('.full-article');

  const { title, description, link } = postData;
  modalWindowTitle.textContent = title;
  modalWindowBody.textContent = description;
  modalWindowLink.href = link;
};
