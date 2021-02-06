/* eslint no-param-reassign: 0 */

import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import { renderInput, renderError } from './view.js';
import parse from './parser.js';

// *** MVC: MODEL -> VIEW -> CONTROLLER ->> MODEL ......***
// ********************************************************

// *** utils ***
const schema = yup.string().required().url('Must be valid url');

const validate = (watchedState) => {
  const { form: { value }, feeds } = watchedState;
  try {
    schema.validateSync(value, { abortEarly: false });
    return feeds.some((feed) => value.includes(feed.link))
      ? 'Rss already exists'
      : '';
  } catch (e) {
    return e.message;
  }
};

const addNewRssFeed = (url, watchedState) => {
  axios.get(url, { timeout: 1000 })
    .then((response) => {
      if (response.data.status.http_code === 404) {
        watchedState.form.error = 'This source doesn\'t contain valid rss';
        watchedState.form.processState = 'failed';
        return;
      }
      const feedData = parse(response);
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
  };

  const form = document.getElementById('rssForm');
  const input = form.elements.url;
  const feedback = document.querySelector('.feedback');
  const submitButton = form.querySelector('button');

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'filling':
        submitButton.disabled = false;
        break;
      case 'failed':
        submitButton.disabled = false;
        break;
      case 'sending':
        submitButton.disabled = true;
        break;
      case 'finished':
        input.value = '';
        submitButton.disabled = false;
        break;

      default:
        throw new Error(`Unknown process state: ${processState}`);
    }
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.value':
        console.log(value);
        break;
      case 'form.processState':
        processStateHandler(value);
        break;
      case 'form.valid':
        renderInput(value, input);
        break;
      case 'form.error':
        renderError(value, feedback);
        break;
      case 'feeds': {
        console.log(value);
        break;
      }
      case 'posts': {
        console.log(value);
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
      watchedState.form.valid = false;
      watchedState.form.error = error;
      return;
    }
    const urlWithAllOriginsProxy = `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(watchedState.form.value)}`;
    addNewRssFeed(urlWithAllOriginsProxy, watchedState);
    watchedState.form.processState = 'sending';
  });
};
