import axios from 'axios';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import { renderInput, renderError } from './view.js';

// *** MVC: MODEL -> VIEW -> CONTROLLER ->> MODEL ......***
// ********************************************************

const schema = yup.string().required().url('Must be valid url');// надо уточнить это пайплайн

// const validate = (field) => {
//   console.log(field);
//   try {
//     schema.validateSync(field, { abortEarly: false });
//     return '';
//   } catch (e) {
//     const message = e.message.split(' ').slice(1).join(' ');
//     return message;
//   }
// };

const validate = (watchedState) => {
  const { form: { value }, feeds } = watchedState;
  try {
    schema.validateSync(value, { abortEarly: false });
    if (feeds.some((feed) => feed.link === value)) {
      console.log('Double');
      return 'Rss already exists';
    }
    return '';
  } catch (e) {
    console.log(e);
    return e.message;
  }
};

// *** VIEW ***
// ************

// **********************************************************************
export default () => {
  // имена состояний это причастия: ....
  // *** MODEL ***
  const state = {
    form: {
      processState: 'filling', // sending, finished || failed
      value: '',
      valid: true,
      error: '',
    },
    feeds: [
      // {
      //   id: 1,
      //   title: 'Feed 1',
      //   description: 'Feed 1 description',
      //   link: 'https://ru.hexlet.io/lessons.rss',
      // },
    ],
  };

  const form = document.getElementById('rssForm');
  const input = form.elements.url;
  const feedback = document.querySelector('.feedback');

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.valid':
        console.log(value);
        renderInput(value, input);
        break;
      case 'form.error':
        renderError(value, feedback);
        break;
      case 'form.processState':
        break;
      default:
        break;
    }
  });

  // *** utils ***
  const buildFeed = (feedXmlDocument) => {
    const feedId = _.uniqueId();
    const feedTitle = feedXmlDocument.querySelector('title').textContent;
    const feedDescription = feedXmlDocument.querySelector('description').textContent;
    const feedLink = feedXmlDocument.querySelector('link').textContent;
    const items = feedXmlDocument.querySelectorAll('item');
    const feedPosts = Array.from(items).map((item) => {
      const postId = _.uniqueId();
      const postTitle = item.querySelector('title').textContent;
      const postDescription = item.querySelector('description').textContent;
      const postLink = item.querySelector('link').textContent;
      return {
        post: postId,
        feedId,
        title: postTitle,
        description: postDescription,
        link: postLink,
      };
    });

    return {
      id: feedId,
      title: feedTitle,
      description: feedDescription,
      link: feedLink,
      posts: feedPosts,
    };
  };

  const parse = (data) => {
    const parser = new DOMParser();
    const feedXmlDocument = parser.parseFromString(data.data.contents, 'text/xml');
    const feed = buildFeed(feedXmlDocument);

    return feed;
  };

  // *** CONTROLLERS ***
  form.addEventListener('input', (e) => {
    const { target: { value } } = e;
    watchedState.form.value = value;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const error = validate(watchedState);
    if (error) {
      console.log('ERROR not valid url');
      watchedState.form.valid = false;
      watchedState.form.error = error;
      return;
    }

    // sending stage
    /* TODO: получить Фид */
    const urlWithAllOriginsProxy = `https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(watchedState.form.value)}`;
    axios.get(urlWithAllOriginsProxy).then((response) => {
      const feed = parse(response);
      console.log(feed);
    });

    // ********

    // watchedState.processState = 'sending';

    // watchedState.form.valid = true;
    // watchedState.form.error = '';
    // watchedState.form.value = '';
  });

  // form.addEventListener('submit', (e) => {
  //   e.preventDefault();
  //   const error = validate(watchedState.form.value);
  //   console.log(error);
  //   if (error) {
  //     console.log('ERROR not valid url');
  //     watchedState.form.valid = false;
  //     watchedState.form.error = error;
  //     return;
  //   }

  //   /* TODO: записать новые данные */
  //   // const data = watchedState.form.value;
  //   // ********
  //   console.log('valid url :)');

  //   watchedState.form.valid = true;
  //   watchedState.form.error = '';
  //   watchedState.form.value = '';

  // });
  // ******
};
