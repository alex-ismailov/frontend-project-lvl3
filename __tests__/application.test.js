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
const makeMock = () => {
  return nock('https://hexlet-allorigins.herokuapp.com')
    .defaultReplyHeaders({
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    })
    .get('/get')
    .query({ disableCache: true, url: url1 })
    .reply(200, { contents: response });
};

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
    submit: screen.getByRole('button', /add/i),
    input: screen.getByRole('textbox'),
  };
});

// test('Main flow with one post in feed', async () => {
//   const scope = makeMock();
//   userEvent.type(elements.input, url1);
//   userEvent.click(elements.submit);
//   await waitFor(async () => {
//     const expected = await screen.findByText(/Lorem ipsum 2021-02-17T21:28:00Z/i);
//     expect(expected).toBeInTheDocument();
//   });

//   scope.isDone();
// });

// https://testing-library.com/docs/guide-disappearance
test('Main flow with one post in feed', async () => {
  const scope = makeMock();
  userEvent.type(elements.input, url1);
  userEvent.click(elements.submit);
  const expected = await screen.findByText(/Lorem ipsum 2021-02-17T21:28:00Z/i);
  expect(expected).toBeInTheDocument();
  scope.isDone();
});
// или так, если используем waitFor, то не обязательно испипольз. асинхр. findByText
// и наоборот
// test('Main flow with one post in feed 2', async () => {
//   const scope = makeMock();
//   userEvent.type(elements.input, url1);
//   userEvent.click(elements.submit);
//   await waitFor(async () => {
//     const expected = screen.getByText(/Lorem ipsum 2021-02-17T21:28:00Z/i);
//     expect(expected).toBeInTheDocument();
//   });
//   scope.isDone();
// });

test('Сleaning input after sending', () => {
  const scope = makeMock();
  userEvent.type(elements.input, url1);
  userEvent.click(elements.submit);

});

// => test getByText проверка фидбека на не корректн url



// test('Disabling Add button on sending', () => {
//   const scope = makeMock();
//   userEvent.type(elements.input, url1);
//   userEvent.click(elements.submit);
//   expect(elements.submit).toBeDisabled();
// });

// test('Disabling workflow of Add button on sending', async () => {
//   const scope = makeMock();
//   userEvent.type(elements.input, url1);
//   userEvent.click(elements.submit);
//   // expect(elements.submit).toBeDisabled();
//   await waitFor(async () => {
//     const expected = await screen.findByText(/Lorem ipsum 2021-02-17T21:28:00Z/i);
//     expect(expected).toBeInTheDocument();
//   });

//   scope.isDone();
// });
