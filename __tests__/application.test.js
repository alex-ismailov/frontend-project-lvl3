import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import prettier from 'prettier';
import '@testing-library/jest-dom';
import testingLibraryDom from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';
import run from '../src/js/init.js';

const { screen, waitFor } = testingLibraryDom;
const userEvent = testingLibraryUserEvent.default;

nock.disableNetConnect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8').trim();

const options = {
  parser: 'html',
  htmlWhitespaceSensitivity: 'ignore',
  tabWidth: 2,
};

const getFormattedHTML = () => prettier.format(document.body.innerHTML, options);

let elements;

beforeEach(() => {
  const initHtml = readFile('index.html');
  document.body.innerHTML = initHtml;
  run();

  elements = {
    submit: screen.getByText(/Add/i),
    input: screen.getByPlaceholderText('RSS link'),
  };
});

test('#freshApplication1', () => {
  expect(getFormattedHTML()).toMatchSnapshot();
});

test('#addNewFeedWithTwoPosts1', async () => {
  // console.log('$%$%^$^$%^');
  await userEvent.type(elements.input, 'http://lorem-rss.herokuapp.com/feed?length=2');

  const response = readFile('rssResponseWithTwoPosts.txt');
  const scope = nock('http://lorem-rss.herokuapp.com')
    .get('/feed?length=2')
    .reply(200, response);

  userEvent.click(elements.submit);
  await waitFor(() => { // Закомментил так как eslint ругается, расскомментируй
    expect(document.body).toMatchSnapshot();
  });

  scope.isDone();
});
