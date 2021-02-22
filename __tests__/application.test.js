import '@testing-library/jest-dom';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { screen, waitFor } from '@testing-library/dom';
// import userEvent from '@testing-library/user-event';
import testingLibraryDom from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';

import init from '../src/js/init.js';

const { screen } = testingLibraryDom;
const userEvent = testingLibraryUserEvent.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => {
  const fixturePath = getFixturePath(filename);

  const rss = fs.readFileSync(fixturePath, 'utf-8');
  return rss;
};
const rss1 = readFixture('rss1.xml');
// const rss2 = readFixture('rss2.xml');
// const rss3 = readFixture('rss3.xml');
const rssUrl = 'https://ru.hexlet.io/lessons.rss';
const corsProxy = 'https://hexlet-allorigins.herokuapp.com';
const corsProxyApi = '/get';

// const htmlPath = getFixturePath('document.html');
// const html = fs.readFileSync(htmlPath, 'utf-8');
// const htmlUrl = 'https://ru.hexlet.io';

const index = path.join(__dirname, '..', 'index.html');
const initHtml = fs.readFileSync(index, 'utf-8');

const elements = {};

beforeAll(() => {
  nock.disableNetConnect();
});

afterAll(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

beforeEach(async () => {
  document.body.innerHTML = initHtml;

  await init();

  elements.input = screen.getByRole('textbox', { name: 'url' });
  elements.submit = screen.getByRole('button', { name: 'add' });
});

test('adding', async () => {
  nock(corsProxy)
    .defaultReplyHeaders({
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    })
    .get(corsProxyApi)
    .query({ url: rssUrl, disableCache: 'true' })
    .reply(200, { contents: rss1 });

  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  expect(await screen.findByText(/RSS успешно загружен/i)).toBeInTheDocument();
});


test('validation url', async () => {
  userEvent.type(elements.input, 'bad url');
  userEvent.click(elements.submit);
  expect(screen.getByText(/Ссылка должна быть валидным URL/i)).toBeInTheDocument();
});

test('validation unique url', async () => {
  nock(corsProxy)
    .defaultReplyHeaders({
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    })
    .get(corsProxyApi)
    .query({ url: rssUrl, disableCache: 'true' })
    .reply(200, { contents: rss1 });

  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  expect(await screen.findByText(/RSS успешно загружен/i)).toBeInTheDocument();
  
  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  expect(await screen.findByText(/RSS уже существует/i)).toBeInTheDocument();
});
