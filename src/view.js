/* eslint no-param-reassign: 0 */

import onChange from 'on-change';

export default (elements, translate) => {
  const {
    input, submitButton, feedback, feedsBlock, postsBlock, modal,
  } = elements;

  const renderInput = (isValid) => {
    if (!isValid) {
      input.classList.add('is-invalid');
      return;
    }
    input.classList.remove('is-invalid');
  };

  const renderFeedback = (message) => {
    if (message !== 'success') {
      feedback.textContent = message;
      feedback.classList.add('text-danger');
      return;
    }
    feedback.classList.remove('text-danger');
    feedback.textContent = translate(message);
    feedback.classList.add('text-success');
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

  const initContainer = (container, titleText) => {
    if (container.hasChildNodes()) {
      return;
    }
    const fragment = new DocumentFragment();
    const title = buildTitle(titleText);
    const itemsContainer = buildItemsContainer();
    fragment.append(title, itemsContainer);
    container.append(fragment);
  };

  const renderFeeds = (feeds) => {
    initContainer(feedsBlock, translate('feeds'));
    const feedsItemContainer = feedsBlock.querySelector('.list-group');
    feedsItemContainer.innerHTML = '';

    const itemsFragment = new DocumentFragment();
    feeds.forEach((feed) => {
      const title = document.createElement('h3');
      title.textContent = feed.title;

      const description = document.createElement('p');
      description.textContent = feed.description;

      const item = document.createElement('li');
      item.classList.add('list-group-item', 'border');

      item.append(title, description);
      itemsFragment.append(item);
    });
    feedsItemContainer.append(itemsFragment);
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
    button.setAttribute('data-is-button', true);
    button.textContent = translate('preview');
    return button;
  };

  const renderPosts = (posts, viewedPostsIds) => {
    initContainer(postsBlock, translate('posts'));
    const postItemsContainer = postsBlock.querySelector('.list-group');
    postItemsContainer.innerHTML = '';

    const itemsFragment = new DocumentFragment();
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
      itemsFragment.append(item);
    });
    postItemsContainer.append(itemsFragment);
  };

  const renderViewedPost = (id) => {
    const post = document.querySelector(`[data-id="${id}"]`);
    post.classList.remove('fw-bold', 'font-weight-bold');
    post.classList.add('fw-normal', 'font-weight-normal');
  };

  const addDataToModal = (postData) => {
    const modalWindowTitle = modal.querySelector('.modal-title');
    const modalWindowBody = modal.querySelector('.modal-body');
    const modalWindowLink = modal.querySelector('.full-article');

    const { title, description, link } = postData;
    modalWindowTitle.textContent = title;
    modalWindowBody.textContent = description;
    modalWindowLink.href = link;
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

  const renderData = (value, previousValue, viewedPostsIds) => {
    const { feeds, posts } = value;
    const { feeds: previousFeeds } = previousValue;
    if (feeds.length === previousFeeds.length) {
      renderPosts(posts, viewedPostsIds);
      return;
    }
    renderFeeds(feeds);
    renderPosts(posts, viewedPostsIds);
  };

  const handleForm = (value) => {
    const { valid, processState } = value;
    renderInput(valid);
    switch (processState) {
      case 'filling':
        submitButton.disabled = false;
        input.readOnly = false;
        break;
      case 'processing':
        submitButton.disabled = true;
        input.readOnly = true;
        break;
      default:
        throw new Error(`Unknown form process state: ${processState}`);
    }
  };

  const handleLoading = (processState, error) => {
    switch (processState) {
      case 'loading':
        break;
      case 'success':
        renderFeedback('success');
        input.value = '';
        break;
      case 'failure':
        renderFeedback(error);
        break;
      default:
        throw new Error(`Unknown loading process state: ${processState}`);
    }
  };

  // *** watchers ***
  return (state) => {
    const watchedState = onChange(state, (path, value, previousValue) => {
      switch (path) {
        case 'loadingState':
          handleLoading(value, watchedState.error);
          break;
        case 'form':
          handleForm(value);
          break;
        case 'data':
          renderData(value, previousValue, watchedState.uiState.viewedPostsIds);
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
};
