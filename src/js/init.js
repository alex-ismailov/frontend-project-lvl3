import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';

// *** MVC: MODEL -> VIEW -> CONTROLLER ->> MODEL ......***
// ********************************************************

const schema = yup.string().required().url();// надо уточнить это пайплайн

const validate = (field) => {
  try {
    schema.validateSync(field, { abortEarly: false });
    return [];
  } catch (e) {
    console.log('$%^ Here is red boarder $%^');
    return e.errors;
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
      state: true,
      errors: [],
    },
    news: [],
  };

  const form = document.getElementById('rssForm');
  const input = form.elements.url;

  const watchedState = onChange(state, (path, value) => {
    console.log('#$% Model call view @#$');
    console.log(`*** path: ${path}; value: ${value} ***`);
    switch (path) {
      case 'form.value':
        input.value = watchedState.form.value;
        break;
      case 'form.valid': {
        if (!value) {
          input.classList.add('is-invalid');
          break;
        }
        input.classList.remove('is-invalid');
        break;
      }
      case 'form.errors':
        // renderErrors()
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
    console.log('+++ submit event +++');
    const errors = validate(watchedState.form.value);
    if (_.isEmpty(errors)) {
      /* TODO: записать новые данные */
      watchedState.form.valid = true;
      watchedState.form.value = '';
      return;
    }

    watchedState.form.valid = false;
    watchedState.form.errors = errors;
  });
  // ******
};
