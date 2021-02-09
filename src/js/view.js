/* eslint no-param-reassign: 0 */

export const renderInputError = (isValid, input) => {
  if (!isValid) {
    input.classList.add('is-invalid');
    return;
  }
  input.classList.remove('is-invalid');
};

export const renderFeedback = (error, element) => {
  if (error) {
    element.textContent = error;
    element.classList.add('text-danger');
    return;
  }
  element.classList.remove('text-danger');
  element.textContent = 'Rss has been loaded';
  element.classList.add('text-success');
};

// export const renderFeeds = (feeds, feedsBlock) => {
//   if (!feedsBlock.hasChildNodes()) {
//     const title = document.createElement('h2');
//     title.textContent = 'Feeds';
//     feedsBlock.append(title);
//     const ul = document.createElement('ul');
//     ul.classList.add('list-group', 'mb-5');
//     feedsBlock.append(ul);
//   }

//   const listGroup = feedsBlock.querySelector('.list-group');
//   listGroup.innerHTML = '';
//   feeds.forEach((feed) => {
//     const title = document.createElement('h3');
//     title.textContent = feed.title;
//     const description = document.createElement('p');
//     description.textContent = feed.description;

//     const item = document.createElement('li');
//     item.classList.add('list-group-item', 'border');
//     item.append(title, description);
//     listGroup.append(item);
//   });
// };

// export const renderPosts = (posts, postsBlock) => {
//   if (!postsBlock.hasChildNodes()) {
//     const title = document.createElement('h2');
//     title.textContent = 'Posts';
//     postsBlock.append(title);
//     const ul = document.createElement('ul');
//     ul.classList.add('list-group', 'mb-5');
//     postsBlock.append(ul);
//   }
//   const listGroup = postsBlock.querySelector('.list-group');
//   listGroup.innerHTML = '';
//   posts.forEach((post) => {
//     const item = document.createElement('li');
/// /item.classList.add('list-group-item', 'd-flex','justify-content-between','align-items-start');
//     const link = document.createElement('a');
//     link.classList.add('font-weight-normal'); // <= TODO
//     // data-id = 2 // TODO
//     link.href = post.link; // <= TODO
//     // target = '_blanck' // TODO
//     // rel = ??? // TODO
//     link.textContent = post.description;

//     const button = document.createElement('button');
//     // button.type = '???'; // <= TODO
//     // button.classList.add('btn btn-primary btn-sm'); // <= TODO
//     // button.data.id =
//     // button.data.toggle =
//     // button.data.target =
//     button.textContent = 'Preview';

//     item.append(link);
//     listGroup.append(item);
//   });
// };

const addTitle = (titleContent, element) => {
  const title = document.createElement('h2');
  title.textContent = titleContent;
  element.append(title);
};

const addItemsContainer = (element) => {
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'mb-5');
  element.append(ul);
};

export const renderFeeds = (feeds, feedsBlock) => {
  if (!feedsBlock.hasChildNodes()) {
    addTitle('Feeds', feedsBlock);
    addItemsContainer(feedsBlock);
  }

  const feedsItemContainer = feedsBlock.querySelector('.list-group');
  feedsItemContainer.innerHTML = '';
  feeds.forEach((feed) => {
    const title = document.createElement('h3');
    title.textContent = feed.title;
    const description = document.createElement('p');
    description.textContent = feed.description;

    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border');
    item.append(title, description);
    feedsItemContainer.append(item);
  });
};

export const renderPosts = (posts, postsBlock) => {
  if (!postsBlock.hasChildNodes()) {
    addTitle('Posts', postsBlock);
    addItemsContainer(postsBlock);
  }
  const postItemsContainer = postsBlock.querySelector('.list-group');
  postItemsContainer.innerHTML = '';
  posts.forEach((post) => {
    console.log(post);
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const link = document.createElement('a');
    link.classList.add('font-weight-normal'); // <= TODO
    link.href = post.link; // <= TODO
    // data-id = 2 // TODO
    // target = '_blanck' // TODO
    // rel = ??? // TODO
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.description;

    const button = document.createElement('button');
    // button.type = '???'; // <= TODO
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-primary', 'btn-sm'); // <= TODO
    // button.data.id =
    button.setAttribute('data-id', post.id);
    // button.data.toggle =
    button.setAttribute('data-toggle', 'modal');
    // button.data.target =
    button.setAttribute('data-target', '#modal');
    button.textContent = 'Preview';

    item.append(link, button);
    postItemsContainer.append(item);
  });
};
