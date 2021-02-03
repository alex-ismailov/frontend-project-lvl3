import onChange from 'on-change';
import * as yup from 'yup';
import { renderInput, renderError } from './view.js';

// *** MVC: MODEL -> VIEW -> CONTROLLER ->> MODEL ......***
// ********************************************************

const schema = yup.string().required().url();// надо уточнить это пайплайн

const validate = (field) => {
  try {
    schema.validateSync(field, { abortEarly: false });
    return '';
  } catch (e) {
    const message = e.message.split(' ').slice(1).join(' ');
    return message;
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
      value: '',
      valid: true,
      error: '',
    },
    news: [],
  };

  const form = document.getElementById('rssForm');
  const input = form.elements.url;
  const feedback = document.querySelector('.feedback');

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.valid':
        renderInput(value, input);
        break;
      case 'form.error':
        renderError(value, feedback);
        break;
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
    const error = validate(watchedState.form.value);
    if (error) {
      watchedState.form.valid = false;
      watchedState.form.error = error;
      return;
    }

    /* TODO: записать новые данные */
    // const data = watchedState.form.value;
    // ********
    watchedState.form.valid = true;
    watchedState.form.error = '';
    watchedState.form.value = '';
  });
  // ******
};
