import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import '@testing-library/jest-dom';
import testingLibraryDom from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';
import init from '../src/js/init.js';

const {
  screen,
  waitFor,
} = testingLibraryDom;
const userEvent = testingLibraryUserEvent.default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8').trim();

const rss1 = readFixture('rss1.xml');
const rssUrl = 'http://lorem-rss.herokuapp.com/feed?length=1';
const corsProxy = 'https://hexlet-allorigins.herokuapp.com';
const corsProxyApi = '/get';

const htmlPath = getFixturePath('index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');
const htmlUrl = 'https://ru.hexlet.io';

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

beforeEach(() => {
  document.body.innerHTML = initHtml;
  init();

  elements.submit = screen.getByRole('button', /add/i);
  elements.input = screen.getByRole('textbox', /url/i);
});

test('Main flow with one post in feed', async () => {
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
  const expected = await screen.findByText(/Фид № 1 - тест/i);
  expect(expected).toBeInTheDocument();
});
// ********************************

test('Add button is disabled on sending', () => {
  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  expect(elements.submit).toBeDisabled();
});

test('Invalid url', () => {
  userEvent.type(elements.input, 'wrong url');
  userEvent.click(elements.submit);
  expect(elements.input).toHaveClass('is-invalid');
});

// ************* Failed tests **************

test('handling non-rss url', async () => {
  nock(corsProxy)
    .defaultReplyHeaders({
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    })
    .get(corsProxyApi)
    .query({ url: htmlUrl, disableCache: 'true' })
    .reply(200, { contents: html });

  userEvent.type(elements.input, htmlUrl);
  userEvent.click(elements.submit);

  expect(await screen.findByText(/Ресурс не содержит валидный RSS/i)).toBeInTheDocument();
});

test('handling network error', async () => {
  const error = { message: 'no internet', isAxiosError: true };
  nock(corsProxy)
    .defaultReplyHeaders({
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
    })
    .get(corsProxyApi)
    .query({ url: rssUrl, disableCache: 'true' })
    .replyWithError(error);

  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  expect(await screen.findByText(/Ошибка сети/i)).toBeInTheDocument();
});

describe('load feeds', () => {
  test('render feed and posts', async () => {
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

    expect(await screen.findByText(/Новые уроки на Хекслете/i)).toBeInTheDocument();
    expect(await screen.findByText(/Практические уроки по программированию/i)).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Агрегация \/ Python: Деревья/i })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Traversal \/ Python: Деревья/i })).toBeInTheDocument();
  });
});

/* ************ skipped tests ************ */
// Network error
test.skip('Check success feedback', async () => {
  const scope = makeMock();
  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);
  // await waitFor(() => {
  //   const expected = screen.getByText('RSS успешно загружен');
  //   expect(expected).toBeInTheDocument();
  // });
  const expected = await screen.findByText('RSS успешно загружен');
  expect(expected).toBeInTheDocument();
  scope.isDone();
});

/* A worker process has failed to exit gracefully and has been force exited.
This is likely caused by tests leaking due to improper teardown.
Try initning with --detectOpenHandles to find leaks. */
test('Сleaning input after sending', async () => {
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
  // const input = await screen.findByRole('textbox')
  // expect(input).not.toHaveDisplayValue();
  await waitFor(() => {
    expect(elements.input).not.toHaveDisplayValue();
  });
});

// Network error
test.skip('Add button is enabled after received rss1', async () => {
  const scope = makeMock();
  userEvent.type(elements.input, rssUrl);
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
  userEvent.type(elements.input, rssUrl);
  userEvent.click(elements.submit);

  await waitFor(async () => {
    expect(elements.input).not.toHaveClass('is-invalid');
  });
  scope.isDone();
});
