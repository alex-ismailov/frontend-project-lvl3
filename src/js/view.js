/* eslint no-param-reassign: 0 */

const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const renderInput = (isValid, input) => {
  if (!isValid) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
  input.value = '';
};

export const renderError = (error, feedback) => {
  if (!error) {
    feedback.textContent = '';
    feedback.classList.remove('text-danger');
    return;
  }
  feedback.textContent = capitalizeFirstLetter(error);
  feedback.classList.add('text-danger');
};
