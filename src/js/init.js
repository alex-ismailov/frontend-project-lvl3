/* eslint no-param-reassign: 0 */

import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import {
  renderInputError, renderFeeds, renderFeedback, renderPosts, addDataToModal,
} from './view.js';
import parse from './parser.js';
import resources from './locales/index.js';

// *** MVC: MODEL -> VIEW -> CONTROLLER ->> MODEL ......***
// ********************************************************

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

// *** utils ***
yup.setLocale({
  string: {
    url: i18next.t('errors.notValidUrl'),
  },
});

const schema = yup.string().required().url();

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
  // urlWithAllOriginsProxy строку надо собирать в отдельной функции ! Переделать
  const urlWithAllOriginsProxy = `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(feedUrl)}`;
  axios.get(urlWithAllOriginsProxy, { timeout: 5000 })
    .then((response) => {
      if (response.data.status.http_code === 404) {
        throw new Error(i18next.t('errors.notValidRss'));
      }
      if (!response.data.contents) {
        throw new Error(i18next.t('errors.noData'));
      }
      if (response.data.status.content_type.includes('text/html')) {
        throw new Error(i18next.t('errors.notValidRssFormat'));
      }
      const feedData = parse(response, feedUrl);
      watchedState.feeds = [feedData.feed, ...watchedState.feeds];
      watchedState.posts = [...feedData.posts, ...watchedState.posts];

      watchedState.form.processState = 'finished';
      watchedState.form.valid = true;
      watchedState.form.error = '';
      watchedState.form.value = '';
      watchedState.form.processState = 'filling';
    })
    .catch((e) => {
      watchedState.form.error = e.message;
      watchedState.form.processState = 'failed';
    });
};

// *** VIEW ***
// look at src/js/view.js
// ************

// контроллер демон, запускается один раз на этапе инициализации приложения
// const watchPosts = (watchedState) => {
//   const { feeds, posts } = watchedState;
//   const feedLinks = feeds.map((feed) => feed.link);
//   feedLinks.forEach((feedLink) => {
//     console.log(feedLink);
//   });
// };

// собрать linkи из фидов
// скачать посты
// вывести посты
// повторить тоже самое через 5 сек
const buildAllOriginsUrl = (url) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(url)}`;

const watchPosts = (watchedState, timerId) => {
  console.log('*** watchPosts start ***');
  clearTimeout(timerId);
  const { feeds } = watchedState;

  const promises = feeds.map(({ link }) => axios.get(buildAllOriginsUrl(link)));
  const promise = Promise.all(promises);
  return promise.then((responses) => {
    responses.forEach((response) => {
      const rawData = response.data.contents;
      const parser = new DOMParser();
      const feedXmlDocument = parser.parseFromString(rawData, 'text/xml');
      const items = feedXmlDocument.querySelectorAll('item');
      items.forEach((item) => {
        const titleText = item.querySelector('title').textContent;
        console.log(titleText);
      });
    });
    const newTimerId = setTimeout(() => watchPosts(watchedState, newTimerId), 2000);
  });
};

// **********************************************************************
export default () => {
  console.log('Start !!!!');
  // имена состояний это причастия: ....
  // *** MODEL ***
  const state = {
    form: {
      processState: 'filling', // sending, finished || failed
      valid: true,
      value: '',
      error: '',
    },
    feeds: [],
    posts: [],
    modal: {
      currentPostId: null,
    },
  };

  const form = document.getElementById('rssForm');
  const input = form.elements.url;
  input.focus();
  const feedback = document.querySelector('.feedback');
  const submitButton = form.querySelector('button');
  const feedsBlock = document.querySelector('.feeds');
  const postsBlock = document.querySelector('.posts');

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'filling':
        submitButton.disabled = false;
        break;
      case 'failed':
        submitButton.disabled = false;
        input.disabled = false;
        input.focus();
        break;
      case 'sending':
        submitButton.disabled = true;
        input.disabled = true;
        break;
      case 'finished':
        renderFeedback('success', feedback);
        submitButton.disabled = false;
        input.disabled = false;
        input.value = '';
        input.focus();
        break;
      default:
        throw new Error(i18next.t('unknownProcessState', { processState }));
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.processState':
        processStateHandler(value);
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
        /*  я прокидываю watchedState.modal через view, потому что
        во время рендеринга постов renderPosts динмачески создает
        новые контроллеры для кнопок preview, которые в свою очередь тоже
        должны как-то иметь доступ к модели, чтобы устанавливать id
        текущего активнога поста для модального окна.
        Не уверен можно ли прокидывать модель через view для динам.
        создаваемого контроллера. */
        renderPosts(value, watchedState.modal, postsBlock);
        break;
      case 'modal.currentPostId': {
        const post = watchedState.posts.find(({ id }) => id === value);
        addDataToModal(post);
        break;
      }
      default:
        break;
    }
  });

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

  const timerId = setTimeout(() => watchPosts(watchedState, timerId), 2000);
};
