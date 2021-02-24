/* eslint no-param-reassign: 0 */

import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import {
  renderInputError, renderFeeds, renderFeedback, renderPosts, addDataToModal, renderViewedPost,
} from './view.js';
import parse from './parser.js';

const schema = yup.string().required().url();
const TIMEOUT = 5000; // ms
const DELAY = 5000; // ms
// const buildAllOriginsUrl = (url) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;
const buildAllOriginsUrl = (rssUrl) => {
  const corsProxy = 'https://hexlet-allorigins.herokuapp.com/get';
  const url = new URLSearchParams(corsProxy);
  url.append('disableCache', true);
  url.append('url', rssUrl);

  return url.toString();
};

const validate = (watchedState) => {
  const { form: { value }, feeds } = watchedState;
  try {
    schema.validateSync(value, { abortEarly: false });
    return feeds.some((feed) => feed.link === value)
      ? i18next.t('errors.feedExists')
      : '';
  } catch (e) {
    return e.message;
  }
};

const addNewRssFeed = (watchedState) => {
  const { form: { value: feedUrl } } = watchedState;
  axios.get(buildAllOriginsUrl(feedUrl), { timeout: TIMEOUT })
    .then((response) => {
      const rawData = response.data.contents;
      if (!rawData.startsWith('<?xml')) {
        throw new Error('notValidRssFormat');
      }
      const feedData = parse(rawData, feedUrl);
      watchedState.feeds = [feedData.feedInfo, ...watchedState.feeds];
      watchedState.posts = [...feedData.posts, ...watchedState.posts];
      watchedState.form.valid = true;
      watchedState.form.error = '';
      watchedState.form.value = '';
      watchedState.form.processState = 'finished';
      watchedState.form.processState = 'filling';
    })
    .catch((e) => {
      const message = e.message === 'notValidRssFormat'
        ? i18next.t('errors.notValidRssFormat')
        : i18next.t('errors.networkError');
      watchedState.form.error = message;
      watchedState.form.processState = 'failed';
    });
};

const watchForNewPosts = (watchedState, timerId) => {
  clearTimeout(timerId);
  const { feeds } = watchedState;
  const promises = feeds.map(({ link }) => axios.get(buildAllOriginsUrl(link), { timeout: TIMEOUT })
    .then((v) => ({ result: 'success', value: v, feedUrl: link }))
    .catch((e) => ({ result: 'error', error: e, feedUrl: link })));
  const promise = Promise.all(promises);

  return promise.then((responses) => {
    const freshPosts = responses.flatMap((response) => {
      if (response.result === 'error') {
        // TODO: надо как-то обработать этот кейс
        // console.log(`Impossible to get data from: ${response.feedUrl}`);
        return [];
      }
      const { value, feedUrl } = response;
      const feedData = parse(value.data.contents, feedUrl);
      return feedData.posts;
    });

    const newPosts = _.differenceBy(freshPosts, watchedState.posts, 'title');
    if (!_.isEmpty(newPosts)) {
      watchedState.posts = [...newPosts, ...watchedState.posts];
    }

    const newTimerId = setTimeout(() => watchForNewPosts(watchedState, newTimerId), DELAY);
  });
};

// *** MODEL ***
export default () => {
  const state = {
    form: {
      processState: 'filling', // sending, finished || failed
      valid: true,
      value: '',
      error: '',
    },
    feeds: [],
    posts: [],
    uiState: {
      modal: {
        currentPostId: null,
      },
      currentViewedPostId: null,
      viewedPostsIds: new Set(),
    },
  };

  const form = document.getElementById('rssForm');
  const input = form.elements.url;
  input.focus();
  const feedback = document.querySelector('.feedback');
  const submitButton = form.querySelector('button');
  const feedsBlock = document.querySelector('.feeds');
  const postsBlock = document.querySelector('.posts');

  const handleProcessState = (processState) => {
    switch (processState) {
      case 'filling':
        submitButton.disabled = false;
        break;
      case 'failed':
        submitButton.disabled = false;
        input.readOnly = false;
        input.focus();
        break;
      case 'sending':
        submitButton.disabled = true;
        input.readOnly = true;
        break;
      case 'finished':
        renderFeedback('success', feedback);
        submitButton.disabled = false;
        input.readOnly = false;
        input.value = '';
        input.focus();
        break;
      default:
        throw new Error(`Unknown process state: ${processState}`);
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        handleProcessState(value);
        break;
      case 'form.valid':
        renderInputError(value, input);
        break;
      case 'form.error':
        renderFeedback(value, feedback);
        break;
      case 'feeds':
        renderFeeds(value, feedsBlock);
        break;
      case 'posts':
        /*  я прокидываю watchedState через view, потому что
        во время рендеринга постов renderPosts динмачески создает
        новые контроллеры для кнопок preview, которые в свою очередь тоже
        должны как-то иметь доступ к модели, чтобы устанавливать id
        текущего активнога поста для модального окна.
        Не уверен можно ли прокидывать модель через view для динам.
        создаваемого контроллера. */
        renderPosts(value, watchedState, postsBlock);
        break;
      case 'uiState.modal.currentPostId': {
        const post = watchedState.posts.find(({ id }) => id === value);
        addDataToModal(post);
        break;
      }
      case 'uiState.currentViewedPostId':
        renderViewedPost(value);
        break;
      default:
        break;
    }
  });

  // *** VIEW ***
  // look at src/js/view.js
  // ************

  // *** CONTROLLERS ***
  form.addEventListener('input', (e) => {
    const { target: { value } } = e;
    watchedState.form.value = value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const error = validate(watchedState);
    if (error) {
      watchedState.form.processState = 'failed';
      watchedState.form.valid = false;
      watchedState.form.error = error;
      return;
    }
    addNewRssFeed(watchedState);
    watchedState.form.processState = 'sending';
  });

  // контроллер демон watchForNewPosts, запускается один раз на этапе инициализации приложения
  const timerId = setTimeout(() => watchForNewPosts(watchedState, timerId), DELAY);
};