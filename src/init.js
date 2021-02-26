/* eslint no-param-reassign: 0 */

import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import {
  handleProcessState, handleData, handleUIState, renderInputError,
} from './view.js';
import parse from './parser.js';
// import parser2 from './parser-2.js';

const TIMEOUT = 5000; // ms
const DELAY = 5000; // ms
const processStateMap = {
  filling: 'filling',
  sending: 'sending',
  finished: 'finished',
  failed: 'failed',
};

const buildAllOriginsUrl = (rssUrl) => {
  const corsProxy = 'https://hexlet-allorigins.herokuapp.com';
  const corsProxyApi = '/get';
  const params = new URLSearchParams();
  params.append('disableCache', true);
  params.append('url', rssUrl);

  return `${corsProxy}${corsProxyApi}?${params.toString()}`;
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

      // console.log(parser2(rawData, feedUrl)); <= DRAFT of new parser

      watchedState.feeds = [feedData.feedInfo, ...watchedState.feeds];
      watchedState.posts = [...feedData.posts, ...watchedState.posts];

      watchedState.form = {
        ...watchedState.form,
        valid: true,
        value: '',
      };

      watchedState.error = '';
      watchedState.processState = processStateMap.finished;
      watchedState.processState = processStateMap.filling;
    })
    .catch((e) => {
      const message = e.message === 'notValidRssFormat'
        ? i18next.t('errors.notValidRssFormat')
        : i18next.t('errors.networkError');
      watchedState.error = message;
      watchedState.processState = processStateMap.failed;
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
  i18next.init({
    fallbackLng: 'ru',
    resources,
  });

  const state = {
    processState: processStateMap.filling,
    error: '',
    form: {
      valid: true,
      value: '',
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

  const elements = {
    form: document.getElementById('rssForm'),
    input: document.getElementById('rssFormInput'),
    feedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('button[aria-label=add]'),
    feedsBlock: document.querySelector('.feeds'),
    postsBlock: document.querySelector('.posts'),
  };

  elements.input.focus();

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'processState':
        handleProcessState(value, elements, watchedState.error);
        break;
      case 'form':
        renderInputError(value.valid, elements.input);
        break;
      // case 'error':
      //   renderFeedback(value, elements.feedback);
      //   break;
      case 'feeds':
      case 'posts':
        handleData(path, value, elements, watchedState.uiState.viewedPostsIds);
        break;
      case 'uiState.modal.currentPostId':
      case 'uiState.currentViewedPostId':
        handleUIState(path, value, watchedState.posts);
        break;
      default:
        break;
    }
  });

  // *** VIEW ***
  // look at src/js/view.js
  // ************

  const schema = yup
    .string()
    .url(i18next.t('errors.notValidUrl'))
    .test('unique', i18next.t('errors.feedExists'),
      (value) => !watchedState.feeds.some((feed) => feed.link === value));

  const validate = (value) => {
    try {
      schema.validateSync(value, { abortEarly: false });
      return null;
    } catch (e) {
      return e.message;
    }
  };

  // *** CONTROLLERS ***
  elements.form.addEventListener('input', (e) => {
    const { target: { value } } = e;
    watchedState.form.value = value;
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const error = validate(watchedState.form.value);
    if (error) {
      watchedState.error = error;
      watchedState.processState = processStateMap.failed;
      watchedState.form.valid = false;
      return;
    }
    addNewRssFeed(watchedState);
    watchedState.processState = processStateMap.sending;
  });

  elements.postsBlock.addEventListener('click', (e) => {
    const { target } = e;
    const postId = target.dataset.id;
    if (target.classList.contains('btn')) {
      watchedState.uiState.modal.currentPostId = postId;
    }
    watchedState.uiState.currentViewedPostId = postId;
    watchedState.uiState.viewedPostsIds.add(postId);
  });

  // контроллер демон watchForNewPosts, запускается один раз на этапе инициализации приложения
  const timerId = setTimeout(() => watchForNewPosts(watchedState, timerId), DELAY);
};
