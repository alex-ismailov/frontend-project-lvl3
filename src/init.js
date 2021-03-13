/* eslint no-param-reassign: 0 */

import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/index.js';
import yupDictionary from './yup.js';
import buildWatchedState from './view.js';
import parse from './parser.js';
import normalize from './normalizer.js';

const TIMEOUT = 5000; // ms
const DELAY = 5000; // ms

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
  watchedState.loading = {
    ...watchedState.loading,
    processState: loadingStateMap.loading,
  };
  axios.get(buildAllOriginsUrl(url), { timeout: TIMEOUT })
    .then((response) => {
      const rawData = response.data.contents;
      const parsedFeed = parse(rawData, url);
      const feedData = normalize(parsedFeed);

      watchedState.data = {
        feeds: [feedData.feed, ...watchedState.data.feeds],
        posts: [...feedData.posts, ...watchedState.data.posts],
      };
      watchedState.loading = {
        processState: loadingStateMap.success,
        error: null,
      };
    })
    .catch((e) => {
      // console.log(e); // for debugging
      const error = e.message === 'notValidRssFormat'
        ? translate('errors.notValidRssFormat')
        : translate('errors.networkError');
      watchedState.loading = {
        processState: loadingStateMap.failure,
        error,
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
    yup.setLocale(yupDictionary);
    const schema = yup.string().url();

    const state = {
      loading: {
        processState: loadingStateMap.idle,
        error: null,
      },
      form: {
        valid: true,
        error: null,
      },
      data: {
        feeds: [],
        posts: [],
      },
      uiState: {
        modal: {
          currentPostId: null,
        },
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

    const validate = (value, currentFeeds) => {
      const expandedScheme = schema
        .notOneOf(currentFeeds);
      try {
        expandedScheme.validateSync(value);
        return null;
      } catch (e) {
        const { key } = e.message;
        return translate(key);
      }
    };

    // *** CONTROLLERS ***
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { value } = e.target.elements.url;
      const currentFeedsLinks = watchedState.data.feeds.map(({ link }) => link);
      const error = validate(value, currentFeedsLinks);
      if (error) {
        watchedState.form = {
          valid: false,
          error,
        };
        return;
      }
      watchedState.form = {
        valid: true,
        error: null,
      };
      fetchNewFeed(value, watchedState, translate);
    });

    elements.postsBlock.addEventListener('click', (e) => {
      const { target, target: { dataset: { id } } } = e;
      if (!target.hasAttribute('data-is-button')) {
        watchedState.uiState.viewedPostsIds.add(id);
        return;
      }
      watchedState.uiState.modal.currentPostId = id;
      watchedState.uiState.viewedPostsIds.add(id);
    });

    // контроллер демон watchFreshPosts, запускается один раз на этапе инициализации приложения
    const timerId = setTimeout(() => watchFreshPosts(watchedState, timerId), DELAY);
  });
};
