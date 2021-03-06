/* eslint no-param-reassign: 0 */

import onChange from 'on-change';

const renderInputError = (isValid, input) => {
  if (!isValid) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
};

const renderFeedback = (message, element, translate) => {
  if (message !== 'success') {
    element.textContent = message;
    element.classList.add('text-danger');
    return;
  }
  element.classList.remove('text-danger');
  element.textContent = translate(message);
  element.classList.add('text-success');
};

const buildTitle = (titleContent) => {
  const title = document.createElement('h2');
  title.textContent = titleContent;
  return title;
};

const buildItemsContainer = () => {
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');
  return ul;
};

const renderFeeds = (feeds, feedsBlock, translate) => {
  if (!feedsBlock.hasChildNodes()) {
    const title = buildTitle(translate('feeds'));
    const itemsContainer = buildItemsContainer();
    feedsBlock.append(title, itemsContainer);
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

const buildPostButton = (post, translate) => {
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn', 'btn-primary', 'btn-sm');
  button.setAttribute('data-id', post.id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.textContent = translate('preview');
  return button;
};

const renderPosts = (posts, postsBlock, viewedPostsIds, translate) => {
  if (!postsBlock.hasChildNodes()) {
    const title = buildTitle(translate('posts'));
    const itemsContainer = buildItemsContainer();
    postsBlock.append(title, itemsContainer);
  }
  const postItemsContainer = postsBlock.querySelector('.list-group');
  postItemsContainer.innerHTML = '';
  posts.forEach((post) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const postLink = buildPostLink(post);
    const fontWeights = viewedPostsIds.has(post.id)
      ? ['fw-normal', 'font-weight-normal']
      : ['fw-bold', 'font-weight-bold'];
    postLink.classList.add(...fontWeights);

    const button = buildPostButton(post, translate);

    item.append(postLink, button);
    postItemsContainer.append(item);
  });
};

const renderViewedPost = (id) => {
  const post = document.querySelector(`[data-id="${id}"]`);
  post.classList.remove('fw-bold', 'font-weight-bold');
  post.classList.add('fw-normal', 'font-weight-normal');
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

const handleProcessState = (processState, elements, error, translate) => {
  switch (processState) {
    case 'filling':
      elements.submitButton.disabled = false;
      elements.input.readOnly = false;
      break;
    case 'failed':
      renderFeedback(error, elements.feedback, translate);
      break;
    case 'sending':
      elements.submitButton.disabled = true;
      elements.input.readOnly = true;
      break;
    case 'finished':
      renderFeedback('success', elements.feedback, translate);
      elements.input.value = '';
      break;
    default:
      throw new Error(`Unknown process state: ${processState}`);
  }
};

const renderData = (value, previousValue, elements, viewedPostsIds, translate) => {
  const { feeds, posts } = value;
  const { feeds: previousFeeds } = previousValue;
  if (feeds.length === previousFeeds.length) {
    renderPosts(posts, elements.postsBlock, viewedPostsIds, translate);
    return;
  }
  renderFeeds(feeds, elements.feedsBlock, translate);
  renderPosts(posts, elements.postsBlock, viewedPostsIds, translate);
};

const handleUIState = (path, value, posts) => {
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
/* Для того что получить watchedState нужно использовать одну функцию,
все остальное должно быть скрыто в отдельном модуле. */
export default (state, elements, translate) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    switch (path) {
      case 'processState':
        handleProcessState(value, elements, watchedState.error, translate);
        break;
      case 'form':
        renderInputError(value.valid, elements.input);
        break;
      case 'data':
        renderData(value, previousValue, elements, watchedState.uiState.viewedPostsIds, translate);
        break;
      case 'uiState.modal.currentPostId':
      case 'uiState.currentViewedPostId':
        handleUIState(path, value, watchedState.data.posts);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
