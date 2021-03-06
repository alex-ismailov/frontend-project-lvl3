/* eslint no-param-reassign: 0 */

import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import buildWatchedState from './view.js';
import parse from './parser.js';
import normalize from './normalizer.js';

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
  const url = new URL(`${corsProxy}${corsProxyApi}`);
  const params = url.searchParams;
  params.set('disableCache', true);
  params.set('url', rssUrl);

  return url.toString();
};

const addNewRssFeed = (watchedState, translate) => {
  const { form: { value: feedUrl } } = watchedState;
  axios.get(buildAllOriginsUrl(feedUrl), { timeout: TIMEOUT })
    .then((response) => {
      const rawData = response.data.contents;
      if (!rawData.startsWith('<?xml')) {
        throw new Error('notValidRssFormat');
      }
      const parsedFeed = parse(rawData, feedUrl);
      const feedData = normalize(parsedFeed);

      watchedState.data = {
        ...watchedState.data, // <= ask Ira
        feeds: [feedData.feed, ...watchedState.data.feeds],
        posts: [...feedData.posts, ...watchedState.data.posts],
      };
      watchedState.form = {
        ...watchedState.form, // <= ask Ira
        valid: true,
        value: '',
      };
      watchedState.error = '';
      watchedState.processState = processStateMap.finished;
      watchedState.processState = processStateMap.filling;
    })
    .catch((e) => {
      // console.log(e); // for debugging
      // Почему срабатывает этот catch, несмотря на то, что прога работает?
      // console.log('TADAD #$%#%'); //
      const message = e.message === 'notValidRssFormat'
        ? translate('errors.notValidRssFormat')
        : translate('errors.networkError');
      watchedState.error = message;
      watchedState.processState = processStateMap.failed;
      watchedState.processState = processStateMap.filling;
    });
};

const watchForNewPosts = (watchedState, timerId) => {
  clearTimeout(timerId);
  const { feeds } = watchedState.data;
  const promises = feeds.map((feed) => (
    axios.get(buildAllOriginsUrl(feed.link), { timeout: TIMEOUT })
      .then((v) => ({ result: 'success', value: v, feed }))
      .catch((e) => ({ result: 'error', error: e, feed }))));
  const promise = Promise.all(promises);

  return promise.then((responses) => {
    const freshPosts = responses.flatMap((response) => {
      if (response.result === 'error') {
        // TODO: надо как-то обработать этот кейс
        // console.log(`Impossible to get data from: ${response.feedUrl}`);
        return [];
      }
      const { value, feed: { link, id } } = response;
      const parsedFeed = parse(value.data.contents, link);
      const feedData = normalize(parsedFeed, id);
      return feedData.posts;
    });

    const newPosts = _.differenceBy(freshPosts, watchedState.data.posts, 'title');
    if (!_.isEmpty(newPosts)) {
      watchedState.data = {
        ...watchedState.data,
        posts: [...newPosts, ...watchedState.data.posts],
      };
    }

    const newTimerId = setTimeout(() => watchForNewPosts(watchedState, newTimerId), DELAY);
  });
};

// *** MODEL ***
export default () => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    fallbackLng: 'ru',
    resources,
  }).then((translate) => {
    const state = {
      processState: processStateMap.filling,
      error: '',
      form: {
        valid: true,
        value: '',
      },
      data: {
        feeds: [],
        posts: [],
      },
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
      modal: document.querySelector('#modal'),
    };

    const watchedState = buildWatchedState(elements, translate)(state);

    // *** VIEW ***
    // look at src/js/view.js
    // ************

    const schema = yup
      .string()
      .url(translate('errors.notValidUrl'))
      .test('unique', translate('errors.feedExists'),
        (value) => !watchedState.data.feeds.some((feed) => feed.link === value));

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
        watchedState.form = {
          ...watchedState.form,
          valid: false,
        };
        return;
      }
      addNewRssFeed(watchedState, translate);
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
  });
};
