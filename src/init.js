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

const formStateMap = {
  filling: 'filling',
  processing: 'processing',
};

const loadingStateMap = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  failure: 'failure',
};

const buildAllOriginsUrl = (rssUrl) => {
  const baseURL = 'https://hexlet-allorigins.herokuapp.com';
  const relativeURL = '/get';
  const url = new URL(relativeURL, baseURL);
  const params = url.searchParams;
  params.set('disableCache', true);
  params.set('url', rssUrl);

  return url.toString();
};

const fetchNewFeed = (url, watchedState, translate) => {
  watchedState.loadingState = loadingStateMap.loading;
  axios.get(buildAllOriginsUrl(url), { timeout: TIMEOUT })
    .then((response) => {
      const rawData = response.data.contents;
      const parsedFeed = parse(rawData, url);
      const feedData = normalize(parsedFeed);

      watchedState.data = {
        ...watchedState.data, // <= ask Ira
        feeds: [feedData.feed, ...watchedState.data.feeds],
        posts: [...feedData.posts, ...watchedState.data.posts],
      };
      watchedState.error = null;
      watchedState.loadingState = loadingStateMap.success;
      watchedState.form = {
        ...watchedState.form, // <= ask Ira
        valid: true,
        processState: formStateMap.filling,
      };
    })
    .catch((e) => {
      // console.log(e); // for debugging
      const message = e.message === 'notValidRssFormat'
        ? translate('errors.notValidRssFormat')
        : translate('errors.networkError');
      watchedState.error = message;
      watchedState.loadingState = loadingStateMap.failure;
      watchedState.form = {
        ...watchedState.form, // <= ask Ira
        valid: false,
        processState: formStateMap.filling,
      };
    });
};

const watchFreshPosts = (watchedState, timerId) => {
  clearTimeout(timerId);
  const { feeds } = watchedState.data;
  const promises = feeds
    .map((feed) => axios.get(buildAllOriginsUrl(feed.link), { timeout: TIMEOUT })
      .then((response) => {
        const { contents } = response.data;
        const parsedFeed = parse(contents, feed.link);
        const freshData = normalize(parsedFeed, feed.id);
        const currentFeedPosts = watchedState.data.posts.filter(({ feedId }) => feedId === feed.id);

        const newPosts = _.differenceBy(freshData.posts, currentFeedPosts, 'title');
        if (!_.isEmpty(newPosts)) {
          watchedState.data = {
            ...watchedState.data,
            posts: [...newPosts, ...watchedState.data.posts],
          };
        }
      })
      .catch((e) => console.log(`${e}; Impossible to get data from: ${feed.link}`)));

  Promise.all(promises)
    .then(() => {
      const newTimerId = setTimeout(() => watchFreshPosts(watchedState, newTimerId), DELAY);
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
      loadingState: loadingStateMap.idle,
      form: {
        valid: true,
        processState: formStateMap.filling,
      },
      error: '',
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

    const watchedState = buildWatchedState(elements, translate, state);

    // *** VIEW ***
    // look at src/js/view.js
    // ************

    yup.setLocale({
      string: {
        url: translate('errors.notValidUrl'),
      },
      mixed: {
        notOneOf: translate('errors.feedExists'),
      },
    });

    const schema = yup
      .string()
      .url()
      .notOneOf([])
      .when('$currentFeedLinks', (currentFeedLinks, currentSchema) => (currentSchema.notOneOf(currentFeedLinks)));

    const validate = (value) => {
      try {
        schema.validateSync(
          value,
          {
            abortEarly: false,
            context: {
              currentFeedLinks: watchedState.data.feeds.map(({ link }) => link),
            },
          },
        );
        return null;
      } catch (e) {
        return e.message;
      }
    };

    // *** CONTROLLERS ***
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { value } = e.target.elements.url;
      const error = validate(value);
      if (error) {
        watchedState.error = error;
        watchedState.form = {
          ...watchedState.form,
          valid: false,
        };
        watchedState.loadingState = loadingStateMap.failure;
        return;
      }
      watchedState.form = {
        ...watchedState.form,
        valid: true,
        processState: formStateMap.processing,
      };
      fetchNewFeed(value, watchedState, translate);
    });

    elements.postsBlock.addEventListener('click', (e) => {
      const { id, isButton } = e.target.dataset;
      if (isButton) {
        watchedState.uiState.modal.currentPostId = id;
      }
      watchedState.uiState.currentViewedPostId = id;
      watchedState.uiState.viewedPostsIds.add(id);
    });

    // контроллер демон watchFreshPosts, запускается один раз на этапе инициализации приложения
    const timerId = setTimeout(() => watchFreshPosts(watchedState, timerId), DELAY);
  });
};
