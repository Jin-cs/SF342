const router = require('express').Router()
const { ApifyClient } = require("apify-client");

const client = new ApifyClient({
  token: 'apify_api_8RkcYd9uhduQWS8WmhNqnZtzcZCqaF3iIhGm',
});

// To get trending topics...
router.get('/trends', async (req, res, next) => {
  try {
    const id = req.query.woeid
    const trends = await client.get('trends/place.json', {
      id,
    })
    res.send(trends)
  } catch (error) {
    console.log(error.message)
    next(error)
  }
})

// This route gets the WOEID for a particular location (lat/long)
router.get('/near-me', async (req, res, next) => {
  try {
    const { lat, long } = req.query
    const response = await client.get('/trends/closest.json', {
      lat,
      long,
    })
    res.send(response)
  } catch (error) {
    console.log(error.message)
    next(error)
  }
})

router.get('/test', async (req, res, next) => {
  try {
    const input = {
      "searchTerms": [
          "ไก่ทอด"
      ],
      "searchMode": "top",
      "profilesDesired": 1,
      "tweetsDesired": 1,
      "mode": "replies",
      "proxyConfig": {
          "useApifyProxy": true
      },
      "extendOutputFunction": async ({ data, item, page, request, customData, Apify }) => {
        return item;
      },
      "extendScraperFunction": async ({ page, request, addSearch, addProfile, _, addThread, addEvent, customData, Apify, signal, label }) => {
      },
      "handle": [
        "@NBA"
      ],
      "customData": {},
      "handlePageTimeoutSecs": 500,
      "maxRequestRetries": 6,
      "maxIdleTimeoutSecs": 60
    };
    const run = await client.actor("quacker/twitter-scraper").call(input);

    // Fetch and print actor results from the run's dataset (if any)
    console.log('Results from dataset');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    items.forEach((item) => {
        console.dir(item['view_count']); //value
        console.dir(item['retweet_count']); 
        console.dir(item['favorite_count']);
        console.dir(item['reply_count'])
    });
    res.send(items)
  } catch (error) {
    console.log(error.message)
    next(error)
  }
})

async function scrapeTwitter(searchTerm) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  const encodedSearch = encodeURIComponent(searchTerm);
  const url = `https://twitter.com/search?q=${encodedSearch}&src=typed_query`;

  await page.goto(url);
  await page.screenshot({path: 'example.png'});

  const tweets = await page.evaluate(() => {
    const tweetNodes = document.querySelectorAll('article[role="article"]');
    const tweetData = [];

    tweetNodes.forEach((tweetNode) => {
      try {
        console.log('ok');
        const username = tweetNode.querySelector('div[data-testid="tweet"] a[href*="/"] > div > div:nth-child(2) > div > span').innerText;
        const tweetText = tweetNode.querySelector('div[data-testid="tweet"] > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div > span').innerText;
        tweetData.push({ username, tweetText });
      } catch (error) {
        console.error('Error parsing tweet:', error);
      }
    });

    return tweetData;
  });

  await browser.close();
  return tweets;
}
module.exports = router

 
