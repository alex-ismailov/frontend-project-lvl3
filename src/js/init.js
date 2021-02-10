/* eslint no-param-reassign: 0 */

import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import {
  renderInputError, renderFeeds, renderFeedback, renderPosts, addDataToModal,
} from './view.js';
import parse from './parser.js';

// *** MVC: MODEL -> VIEW -> CONTROLLER ->> MODEL ......***
// ********************************************************

// *** utils ***
const schema = yup.string().required().url('Must be valid url');

const validate = (watchedState) => {
  const { form: { value }, feeds } = watchedState;
  try {
    schema.validateSync(value, { abortEarly: false });
    return feeds.some((feed) => feed.link === value)
      ? 'Rss already exists'
      : '';
  } catch (e) {
    return e.message;
  }
};

const addNewRssFeed = (watchedState) => {
  const { form: { value: feedUrl } } = watchedState;

  const urlWithAllOriginsProxy = `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(feedUrl)}`;
  axios.get(urlWithAllOriginsProxy, { timeout: 5000 })
    .then((response) => {
      if (response.data.status.http_code === 404) {
        watchedState.form.error = 'This source doesn\'t contain valid rss';
        watchedState.form.processState = 'failed';
        return;
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
        renderFeedback('', feedback); // <= передавать '' не оч. хорошо, переделать
        submitButton.disabled = false;
        input.disabled = false;
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
        // я прокидываю watchedState.modal через view, потому что
        // во время рендеринга постов renderPosts динмачески создает
        // новые контроллеры для кнопок preview, которые в свою очередь тоже
        // должны как-то иметь доступ к модели, чтобы устанавливать id
        // текущего активнога поста для модального окна.
        // Не уверен можно ли прокидывать модель через view для динам.
        // создаваемого контроллера.
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
    // const urlWithAllOriginsProxy = `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(watchedState.form.value)}`;
    // addNewRssFeed(urlWithAllOriginsProxy, watchedState);
    addNewRssFeed(watchedState);
    watchedState.form.processState = 'sending';
  });
};
