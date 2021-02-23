/* eslint no-underscore-dangle: ["error", { "allow": ["__filename", "__dirname"] }] */

import '@testing-library/jest-dom';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import testingLibraryDom from '@testing-library/dom';
import testingLibraryUserEvent from '@testing-library/user-event';
import nock from 'nock';

import init from '../src/js/init.js';

const { screen, waitFor } = testingLibraryDom;
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
const rssUrl = 'https://ru.hexlet.io/lessons.rss';
const corsProxy = 'https://hexlet-allorigins.herokuapp.com';
const corsProxyApi = '/get';

const htmlPath = getFixturePath('document.html');
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

test('Network error', async () => {
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

describe('Handle disabling ui elements during loading', () => {
  test('handle successful loading loading', async () => {
    nock(corsProxy)
      .defaultReplyHeaders({
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true',
      })
      .get(corsProxyApi)
      .query({ url: rssUrl, disableCache: 'true' })
      .reply(200, { contents: rss1 });

    expect(elements.input).not.toHaveAttribute('readonly');
    expect(elements.submit).toBeEnabled();
    userEvent.type(elements.input, rssUrl);
    userEvent.click(elements.submit);
    await waitFor(() => {
      expect(elements.input).not.toHaveAttribute('readonly');
    });
    expect(elements.submit).toBeEnabled();
  });

  test('handle fialed loading', async () => {
    nock(corsProxy)
      .defaultReplyHeaders({
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true',
      })
      .get(corsProxyApi)
      .query({ url: htmlUrl, disableCache: 'true' })
      .reply(200, { contents: html });

    expect(elements.input).not.toHaveAttribute('readonly');
    expect(elements.submit).toBeEnabled();

    userEvent.type(elements.input, htmlUrl);
    userEvent.click(elements.submit);
    expect(elements.input).toHaveAttribute('readonly');
    expect(elements.submit).toBeDisabled();

    await waitFor(() => {
      expect(elements.input).not.toHaveAttribute('readonly');
    });
    expect(elements.submit).toBeEnabled();
  });
});

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
  expect(await screen.findByRole('link', { name: /Агрегация 2 \/ Python: Деревья/i })).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: /Агрегация \/ Python: Деревья/i })).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: /Traversal \/ Python: Деревья/i })).toBeInTheDocument();
});

test('modal', async () => {
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

  const previewBtns = await screen.findAllByRole('button', { name: /Просмотр/i });
  expect(screen.getByRole('link', { name: /Агрегация \/ Python: Деревья/i })).toHaveClass('font-weight-bold');
  userEvent.click(previewBtns[0]);
  expect(await screen.findByText(/Цель: Научиться извлекать из дерева необходимые данные/i)).toBeVisible();
  expect(screen.getByRole('link', { name: /Агрегация \/ Python: Деревья/i })).not.toHaveClass('font-weight-bold');
});
