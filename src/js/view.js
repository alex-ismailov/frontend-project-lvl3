/* eslint no-param-reassign: 0 */

export const renderInputError = (isValid, input) => {
  if (!isValid) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
};

export const renderFeedback = (error, element) => {
  if (error) {
    element.textContent = error;
    element.classList.add('text-danger');
    return;
  }
  console.log('success');
  element.classList.remove('text-danger');
  element.textContent = 'Success но это надо уточнить!';
  element.classList.add('text-success');
};

export const renderFeeds = () => {};

export const renderPosts = () => {};
