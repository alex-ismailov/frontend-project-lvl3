export const renderInputText = (watchedState, form) => {
  const input = form.elements.url;
  input.value = watchedState.form.value;
};

export const renderInputClassName = (watchedState, input) => {
  if (!watchedState.form.valid) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
};
