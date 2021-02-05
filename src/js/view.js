/* eslint no-param-reassign: 0 */

export const renderInput = (isValid, input) => {
  if (!isValid) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
};

export const renderError = (error, feedback) => {
  if (!error) {
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
    return;
  }
  feedback.textContent = error;
  feedback.classList.add('text-danger');
};
