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

const buildPostLink = (post) => {
  const link = document.createElement('a');
  link.href = post.link;
  link.classList.add('text-decoration-none');
  link.setAttribute('data-id', post.id);
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
  link.textContent = post.title;
  console.log('%^&%^&%&^%&');
  return link;
};

const buildPostButton = (post) => {
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn', 'btn-primary', 'btn-sm');
  button.setAttribute('data-id', post.id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.textContent = i18next.t('preview');
  return button;
};

const handlePostButton = (postId, watchedState) => () => {
  watchedState.modal.currentPostId = postId;
  watchedState.uiState.currentViewedPostId = postId;
  watchedState.uiState.viewedPostsIds.add(postId);
};

const handlePostLink = (postId, watchedState) => () => {
  watchedState.uiState.currentViewedPostId = postId;
  watchedState.uiState.viewedPostsIds.add(postId);
};

export const renderPosts = (posts, watchedState, postsBlock) => {
  if (!postsBlock.hasChildNodes()) {
    addTitle('Posts', postsBlock);
    addItemsContainer(postsBlock);
  }
  const postItemsContainer = postsBlock.querySelector('.list-group');
  postItemsContainer.innerHTML = '';
  posts.forEach((post) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const postLink = buildPostLink(post);
    const fontWeight = watchedState.uiState.viewedPostsIds.has(post.id)
      ? 'fw-normal'
      : 'fw-bold';
    postLink.classList.add(fontWeight);
    postLink.addEventListener('click', handlePostLink(post.id, watchedState));

    const button = buildPostButton(post);
    button.addEventListener('click', handlePostButton(post.id, watchedState));

    item.append(postLink, button);
    postItemsContainer.append(item);
  });
};

export const renderViewedPost = (id) => {
  const post = document.querySelector(`[data-id="${id}"]`);
  post.classList.remove('fw-bold');
  post.classList.add('fw-normal');
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
