const buildAllOriginsUrl = (url) => 
`https://hexlet-allorigins.herokuapp.com/get?
disableCache=true & 
url=${encodeURIComponent(url)}`;




const fn = (rssUrl) => {
  const corsProxy = 'https://hexlet-allorigins.herokuapp.com/get';

  const url = new URLSearchParams(corsProxy);
  url.append('disableCache', true);
  url.append('url', rssUrl);

  const string = url.toString();
  console.log(string);

  return string;
};
fn('https://ru.hexlet.io/lessons.rss');

const fn2 = (rssUrl) => {
  const corsProxy = 'https://hexlet-allorigins.herokuapp.com';
  const corsProxyApi = '/get';

  const params = new URLSearchParams();
  params.append('disableCache', true);
  params.append('url', rssUrl);


  return `${corsProxy}${corsProxyA}?${params.toString()}`;
};
console.log(fn2('https://ru.hexlet.io/lessons.rss'));