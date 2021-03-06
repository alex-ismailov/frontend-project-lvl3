/* eslint no-param-reassign: 0 */

import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';
import yupDictionary from './locales/yup.js';
import resources from './locales/index.js';
import buildWatchedState from './view.js';
import parse from './parser.js';

const TIMEOUT = 5000; // ms
const DELAY = 5000; // ms

const loadingStateMap = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  failure: 'failure',
};

const normalize = (data, url, id = null) => {
  const feedId = id ?? _.uniqueId();
  const feed = {
    id: feedId,
    title: data.title,
    link: url,
    description: data.description,
  };
  const posts = data.items.map((item) => {
    const { title, link, description } = item;
    return {
      id: _.uniqueId(),
      feedId,
      title,
      link,
      description,
    };
  });

  return {
    feed,
    posts,
  };
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

const fetchNewFeed = (feedUrl, watchedState) => {
  watchedState.loading = {
    ...watchedState.loading,
    processState: loadingStateMap.loading,
  };
  axios.get(buildAllOriginsUrl(feedUrl), { timeout: TIMEOUT })
    .then((response) => {
      const rawData = response.data.contents;
      const parsedFeed = parse(rawData);
      const feedData = normalize(parsedFeed, feedUrl);

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
      const error = e.message === 'notValidRssFormat'
        ? 'errors.notValidRssFormat'
        : 'errors.networkError';
      watchedState.loading = {
        processState: loadingStateMap.failure,
        error,
      };
    });
};

const watchFreshPosts = (watchedState) => {
  const { feeds } = watchedState.data;
  const promises = feeds
    .map((feed) => axios.get(buildAllOriginsUrl(feed.link), { timeout: TIMEOUT })
      .then((response) => {
        const { contents } = response.data;
        const parsedFeed = parse(contents);
        const freshData = normalize(parsedFeed, feed.link, feed.id);
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
    .finally(() => {
      setTimeout(() => watchFreshPosts(watchedState), DELAY);
    });
};

export default () => {
  const i18nextInstance = i18next.createInstance();
  return i18nextInstance.init({
    lng: 'ru-RU',
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

    const validate = (value, currentFeeds) => {
      const expandedScheme = schema
        .notOneOf(currentFeeds);
      try {
        expandedScheme.validateSync(value);
        return null;
      } catch (e) {
        const { key } = e.message;
        return key;
      }
    };

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
      fetchNewFeed(value, watchedState);
    });

    elements.postsBlock.addEventListener('click', (e) => {
      const { target, target: { dataset: { id } } } = e;
      if (!target.hasAttribute('data-id')) {
        return;
      }
      watchedState.uiState.viewedPostsIds.add(id);
      watchedState.uiState.modal.currentPostId = id;
    });

    setTimeout(() => watchFreshPosts(watchedState), DELAY);
  });
};
