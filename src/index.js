import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import runRssAggregator from './init.js';

runRssAggregator().then(() => console.log('Rss Agg started'));
