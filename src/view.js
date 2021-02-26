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

const renderFeeds = (feeds, feedsBlock) => {
  if (!feedsBlock.hasChildNodes()) {
    addTitle(i18next.t('feeds'), feedsBlock);
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

const renderPosts = (posts, postsBlock, viewedPostsIds) => {
  if (!postsBlock.hasChildNodes()) {
    addTitle(i18next.t('posts'), postsBlock);
    addItemsContainer(postsBlock);
  }
  const postItemsContainer = postsBlock.querySelector('.list-group');
  postItemsContainer.innerHTML = '';
  posts.forEach((post) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const postLink = buildPostLink(post);
    const fontWeight = viewedPostsIds.has(post.id)
      ? 'font-weight-normal'
      : 'font-weight-bold';
    postLink.classList.add(fontWeight);

    const button = buildPostButton(post);

    item.append(postLink, button);
    postItemsContainer.append(item);
  });
};

const renderViewedPost = (id) => {
  const post = document.querySelector(`[data-id="${id}"]`);
  post.classList.remove('font-weight-bold');
  post.classList.add('font-weight-normal');
};

const addDataToModal = (postData) => {
  const modalWindow = document.querySelector('#modal');
  const modalWindowTitle = modalWindow.querySelector('.modal-title');
  const modalWindowBody = modalWindow.querySelector('.modal-body');
  const modalWindowLink = modalWindow.querySelector('.full-article');

  const { title, description, link } = postData;
  modalWindowTitle.textContent = title;
  modalWindowBody.textContent = description;
  modalWindowLink.href = link;
};

export const handleProcessState = (processState, elements, error) => {
  switch (processState) {
    case 'filling':
      break;
    case 'failed':
      renderFeedback(error, elements.feedback);
      elements.submitButton.disabled = false;
      elements.input.readOnly = false;
      elements.input.focus();
      break;
    case 'sending':
      elements.submitButton.disabled = true;
      elements.input.readOnly = true;
      break;
    case 'finished':
      renderFeedback('success', elements.feedback);
      elements.submitButton.disabled = false;
      elements.input.readOnly = false;
      elements.input.value = '';
      elements.input.focus();
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

// export const handleFormState = (path, value, elements) => {
//   switch (path) {
//     case 'form.valid':
//       renderInputError(value, elements.input);
//       break;
//     case 'form.error':
//       renderFeedback(value, elements.feedback);
//       break;
//     default:
//       throw new Error(`Unknown form state: ${path}`);
//   }
// };

export const handleData = (path, value, elements, viewedPostsIds) => {
  switch (path) {
    case 'feeds':
      renderFeeds(value, elements.feedsBlock);
      break;
    case 'posts':
      renderPosts(value, elements.postsBlock, viewedPostsIds);
      break;
    default:
      throw new Error(`Unknown state data path: ${path}`);
  }
};

export const handleUIState = (path, value, posts) => {
  switch (path) {
    case 'uiState.modal.currentPostId': {
      const post = posts.find(({ id }) => id === value);
      addDataToModal(post);
      break;
    }
    case 'uiState.currentViewedPostId':
      renderViewedPost(value);
      break;

    default:
      throw new Error(`Unknown uiState path: ${path}`);
  }
};
