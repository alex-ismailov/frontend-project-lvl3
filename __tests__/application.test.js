import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import '@testing-library/jest-dom';
import testingLibraryDom from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';
import run from '../src/js/init.js';

const { screen, waitFor } = testingLibraryDom;
const userEvent = testingLibraryUserEvent.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8').trim();

const url1 = 'http://lorem-rss.herokuapp.com/feed?length=1';
const response = readFixture('rss1.xml');

let elements;

beforeAll(() => {
  nock.disableNetConnect();
});

beforeEach(() => {
  const initHtml = readFixture('index.html');
  document.body.innerHTML = initHtml;
  run();

  elements = {
    submit: screen.getByText(/Add/i),
    input: screen.getByPlaceholderText('RSS link'),
  };
});

test('#addNewFeedWithTwoPosts1', async () => {
  const scope = nock('https://hexlet-allorigins.herokuapp.com')
    .defaultReplyHeaders({
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    })
    .get('/get')
    .query({ disableCache: true, url: url1 })
    .reply(200, { contents: response });

  userEvent.type(elements.input, url1);

  userEvent.click(elements.submit);
  await waitFor(async () => {
    const expected = await screen.findByText(/Lorem ipsum 2021-02-17T21:28:00Z/i);
    expect(expected).toBeInTheDocument();
  });

  scope.isDone();
});
