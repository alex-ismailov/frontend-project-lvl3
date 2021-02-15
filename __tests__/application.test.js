import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
// import { screen } from '@testing-library/dom';
// import userEvent from '@testing-library/user-event';
import run from '../src/js/init.js';

const options = {
  parser: 'html',
  htmlWhitespaceSensitivity: 'ignore',
  tabWidth: 2,
};

const getFormattedHTML = () => prettier.format(document.body.innerHTML, options);

beforeEach(() => {
  const initHtml = fs.readFileSync(path.join('__fixtures__', 'index.html')).toString();
  document.body.innerHTML = initHtml;
  run();
});

test('#freshApplication1', () => {
  expect(getFormattedHTML()).toMatchSnapshot();
});

test('#....', () => {

});
