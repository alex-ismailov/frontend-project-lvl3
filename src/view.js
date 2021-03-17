/* eslint no-param-reassign: 0 */

import onChange from 'on-change';

export default (elements, translate, state) => {
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

  const renderFeeds = (feeds) => {
    feedsBlock.innerHTML = '';

    const feedTitle = document.createElement('h2');
    feedTitle.textContent = translate('feeds');

    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');

    feeds.forEach((feed) => {
      const postTitle = document.createElement('h3');
      postTitle.textContent = feed.title;

      const description = document.createElement('p');
      description.textContent = feed.description;

      const item = document.createElement('li');
      item.classList.add('list-group-item', 'border');

      item.append(postTitle, description);
      ul.append(item);
    });
    const fragment = new DocumentFragment();
    fragment.append(feedTitle, ul);
    feedsBlock.append(fragment);
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
    postsBlock.innerHTML = '';

    const postsTitle = document.createElement('h2');
    postsTitle.textContent = translate('posts');

    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');

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
      ul.append(item);
    });
    const fragment = new DocumentFragment();
    fragment.append(postsTitle, ul);
    postsBlock.append(fragment);
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

  const handleLoading = (loadingState) => {
    const { processState, error } = loadingState;
    switch (processState) {
      case 'loading':
        submitButton.disabled = true;
        input.readOnly = true;
        break;
      case 'success':
        submitButton.disabled = false;
        input.readOnly = false;
        input.value = '';
        renderFeedback(translate('success'));
        break;
      case 'failure':
        submitButton.disabled = false;
        input.readOnly = false;
        renderFeedback(translate(error));
        break;
      default:
        throw new Error(`Unknown loading process state: ${processState}`);
    }
  };

  const handleForm = (formState) => {
    const { valid, error } = formState;
    if (error) {
      renderFeedback(error);
    }
    renderInput(valid);
  };

  // *** watchers ***
  const watchedState = onChange(state, (path, value, previousValue) => {
    switch (path) {
      case 'form':
        handleForm(value);
        break;
      case 'loading':
        handleLoading(value);
        break;
      case 'data':
        renderData(value, previousValue, watchedState.uiState.viewedPostsIds);
        break;
      case 'uiState.viewedPostsIds':
        renderPosts(watchedState.data.posts, value);
        break;
      case 'uiState.modal.currentPostId': {
        const post = watchedState.data.posts.find(({ id }) => id === value);
        addDataToModal(post);
        break;
      }
      default:
        throw new Error(`Unknown state path: ${path}`);
    }
  });

  return watchedState;
};
