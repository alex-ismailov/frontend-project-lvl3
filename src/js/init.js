/* eslint no-param-reassign: 0 */

import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import { renderInput, renderError } from './view.js';
import parse from './parser.js';

// *** MVC: MODEL -> VIEW -> CONTROLLER ->> MODEL ......***
// ********************************************************

const schema = yup.string().required().url('Must be valid url');// надо уточнить это пайплайн

const validate = (watchedState) => {
  const { form: { value }, feeds } = watchedState;
  try {
    schema.validateSync(value, { abortEarly: false });
    // console.log([...feeds]);
    const isDouble = feeds.some((feed) => {
      console.log(`feed.link: ${feed.link}; value: ${value}`);
      return feed.link === value;
    });
    console.log(`isDouble: ${isDouble}`);
    if (isDouble) {
      console.log('Double');
      return 'Rss already exists';
    }
    console.log('BOOM !!!');
    return '';
  } catch (e) {
    console.log(e);
    return e.message;
  }
};

const addNewRssFeed = (url, watchedState, submitButton) => {
  axios.get(url, { timeout: 1000 })
    .then((response) => {
      if (response.data.status.http_code === 404) {
        watchedState.form.error = 'This source doesn\'t contain valid rss';
        submitButton.disabled = false;
        watchedState.form.processState = 'failed';
        return;
      }
      const feedData = parse(response);
      watchedState.feeds = [feedData.feed, ...watchedState.feeds];
      watchedState.posts = [...feedData.posts, ...watchedState.posts];

      watchedState.form.valid = true;
      watchedState.form.error = '';
      watchedState.form.value = '';
      submitButton.disabled = false;
      watchedState.form.processState = 'finished';
      watchedState.form.processState = 'filling';
    })
    .catch((e) => {
      watchedState.form.error = e.message;
      watchedState.form.processState = 'failed';
      submitButton.disabled = false;
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
      value: '',
      valid: true,
      error: '',
    },
    feeds: [],
    posts: [],
  };

  const form = document.getElementById('rssForm');
  const input = form.elements.url;
  const feedback = document.querySelector('.feedback');
  const submitButton = form.querySelector('button');

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.value':
        console.log(value);
        break;
      case 'form.processState': {
        console.log(value);
        if (value === 'finished') {
          input.value = '';
          break;
        }
        break;
      }
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
    addNewRssFeed(urlWithAllOriginsProxy, watchedState, submitButton);
    submitButton.disabled = true;
  });
};
