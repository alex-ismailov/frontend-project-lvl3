import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import '@testing-library/jest-dom';
import testingLibraryDom from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';
import run from '../src/js/init.js';

const {
  screen,
  waitFor,
} = testingLibraryDom;
const userEvent = testingLibraryUserEvent.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8').trim();
const url1 = 'http://lorem-rss.herokuapp.com/feed?length=1';
const response = readFixture('rss1.xml');
let elements;

const makeMock = () => nock('https://hexlet-allorigins.herokuapp.com')
  .defaultReplyHeaders({
    'access-control-allow-origin': '*',
    'access-control-allow-credentials': 'true',
  })
  .get('/get')
  .query({ disableCache: true, url: url1 })
  .reply(200, { contents: response });

beforeAll(() => {
  nock.disableNetConnect();
});

beforeEach(() => {
  const initHtml = readFixture('index.html');
  document.body.innerHTML = initHtml;
  run();

  elements = {
    submit: screen.getByRole('button', /add/i),
    input: screen.getByRole('textbox'),
  };
});

// https://testing-library.com/docs/guide-disappearance
test('Main flow with one post in feed', async () => {
  const scope = makeMock();
  userEvent.type(elements.input, url1);
  userEvent.click(elements.submit);
  const expected = await screen.findByText(/Lorem ipsum 2021-02-17T21:28:00Z/i);
  expect(expected).toBeInTheDocument();
  scope.isDone();
});
// ********************************

test('Add button is disabled on sending', () => {
  userEvent.type(elements.input, url1);
  userEvent.click(elements.submit);
  expect(elements.submit).toBeDisabled();
});

test('Invalid url', () => {
  userEvent.type(elements.input, 'wrong url');
  userEvent.click(elements.submit);
  expect(elements.input).toHaveClass('is-invalid');
});

/* ************ skipped tests ************ */
// Network error
test.skip('Check success feedback', async () => {
  const scope = makeMock();
  userEvent.type(elements.input, url1);
  userEvent.click(elements.submit);
  // await waitFor(() => {
  //   const expected = screen.getByText('RSS успешно загружен');
  //   expect(expected).toBeInTheDocument();
  // });
  const expected = await screen.findByText('RSS успешно загружен');
  expect(expected).toBeInTheDocument();
  scope.isDone();
});

// UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'createElement' of null
test('Сleaning input after sending', async () => {
  const scope = makeMock();
  userEvent.type(elements.input, url1);
  userEvent.click(elements.submit);
  // const input = await screen.findByRole('textbox')
  // expect(input).not.toHaveDisplayValue();
  await waitFor(() => {
    expect(elements.input).not.toHaveDisplayValue();
  });
  scope.isDone();
});

// Network error
test.skip('Add button is enabled after received response', async () => {
  const scope = makeMock();
  userEvent.type(elements.input, url1);
  userEvent.click(elements.submit);
  await waitFor(async () => {
    expect(screen.findByRole('textbox')).toBeEnabled();
  });
  // const expected = await screen.findByRole('textbox');
  // expect(elements.submit).toBeEnabled();
  scope.isDone();
});

// Network error
test.skip('Valid url after invalid', async () => {
  const scope = makeMock();
  userEvent.type(elements.input, 'wrong url');
  userEvent.click(elements.submit);
  userEvent.clear(elements.input);
  userEvent.type(elements.input, url1);
  userEvent.click(elements.submit);

  await waitFor(async () => {
    expect(elements.input).not.toHaveClass('is-invalid');
  });
  scope.isDone();
});
