const express = require('express');
const { Pool } = require('pg');
const nanoid = require('nanoid');
const basicAuth = require('express-basic-auth');
const cors = require('cors');
const { Sender } = require("@questdb/nodejs-client");

const app = express();
const port = 3030;

// PostgreSQL database configuration
const pool = new Pool({
  user: 'shorty',
  host: 'localhost',
  database: 'shorty',
  password: 'Shorty78.Mime!',
  port: 5432,
});
app.use(express.json());
app.use(cors());
// Middleware for basic authentication
// app.use(
//   basicAuth({
//     users: { 'your-username': 'your-password' },
//     challenge: true,
//     unauthorizedResponse: 'Unauthorized Access',
//   })
// );


// Function to check if the link already exists
async function isLinkExists(original_url) {
  const result = await pool.query('SELECT 1 FROM short_links WHERE original_url = $1 LIMIT 1', [original_url]);
  return result.rows.length > 0;
}
// Endpoint to shorten a URL
app.post('/shorten', async (req, res) => {
  const originalUrl = req.body;
  const dom = originalUrl.domain;
  console.log(`Domain: ${dom}`);
  const linkExists = await isLinkExists(originalUrl);
  // Generate a short ID
  if (linkExists) {
    const result = await pool.query(
      "SELECT * FROM short_links WHERE original_url = $1 LIMIT 1",
      [originalUrl]
    );
    const r = result.rows[0];
    const sh = r['original_url'];
    const ll = r['short_link'];
    const dd = r['short_domain'];
    if (dd) {
      const shortenedUrl = `https://${dd}/${ll}`;
      res.json({ shortenedUrl })
    }
    else {
      const shortenedUrl = `https://${dom}/${ll}`;
      res.json({ shortenedUrl });
    }
    return
  }
  const shortLink = nanoid.nanoid(5);
  console.log(`short link: ${shortLink}`);
  try {
    // Store the short link in the database


    // Return the shortened URL
    if (originalUrl.domain) {
      await pool.query(
        "INSERT INTO short_links (short_link, original_url, short_domain) VALUES ($1, $2, $3)",
        [shortLink, originalUrl, originalUrl.domain]
      );
      const shortenedUrl = `https://${originalUrl.domain}/${shortLink}`
      console.log(`shortened Domain: ${shortenedUrl}`);
      res.json({ shortenedUrl })
    } else {
      await pool.query(
        "INSERT INTO short_links (short_link, original_url) VALUES ($1, $2)",
        [shortLink, originalUrl]
      );
      const shortenedUrl = `http://localhost:${port}/${shortLink}`;
      console.log(`short link: ${shortenedUrl}`)
      res.json({ shortenedUrl });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/stats', async (req, res) => {
  const query = `
  SELECT
    sl.short_link,
    COALESCE(COUNT(sls.short_link), 0) as access_count,
    ARRAY_AGG(DISTINCT COALESCE(sls.host_address, '')) as unique_hosts,
    sl.original_url
  FROM short_links sl
  LEFT JOIN short_links_stats sls ON sl.short_link = sls.short_link
  GROUP BY sl.short_link, sl.original_url`;
  try {
    const result = await pool.query(query);

    // Result rows contain short_link, access_count, and unique_hosts
    const statistics = result.rows;
    statistics.forEach((stat) => {
      console.log(`Short Link: ${stat.short_link}`);
      console.log(`Original URL: ${stat.original_url}`);
      console.log(`Access Count: ${stat.access_count}`);
      console.log(`Unique Hosts: ${stat.unique_hosts.join(", ")}`);
      console.log("---");
    });
    res.set("Content-Type", "text/html");
    res.status(200).send(statistics);
    res.end();
  }
  catch (err) {
    console.error(err);
  }
})
app.get('/', (req, res) => {
  res.set("Content-Type", "text/html");
  res.status(200).send("<h1>Hello GFG Learner!</h1>");
  res.end();
  console.log("Welcome to root URL of Server");
  console.log(req.hostname);
});
// Endpoint to redirect to the original URL
app.get('/:shortLink', async (req, res) => {
  const { shortLink } = req.params;

  try {
    // Retrieve the original URL from the database
    const result = await pool.query('SELECT original_url, short_link FROM short_links WHERE short_link = $1', [shortLink]);

    if (result.rows.length > 0) {
      const originalUrl = result.rows[0].original_url;
      const shortUrl = result.rows[0].short_link;
      console.log(originalUrl);
      const redLink = JSON.parse(originalUrl);
      console.log(`Redirect Link ${redLink.originalUrl}`);
      const insShort = encodeURIComponent(redLink.originalUrl);
      // Store statistics for each access
      const hostAddress = req.ip || req.connection.remoteAddress;
      const sender = new Sender();
      const timestamp = new Date().toISOString();
      // connect to QuestDB
      // host and port are required in connect options
      const ts = Date().now;
      const lp = `shorty,short_link="${shortUrl}",long_link="${insShort}",hostname="${hostAddress}" hit=1`;
      console.log(`Line Protocol: ${lp}`)
      const foo = await sender.connect({ port: 9009, host: "127.0.0.1" });
      sender
        .table("shorty")
        .symbol("short_link", `"${shortUrl}"`)
        .symbol("long_link", `"${insShort}`)
        .symbol("hostname", `"${hostAddress}"`);
      await sender.flush();
      await sender.flush();
      await sender.flush();
      sender.close();
      await pool.query(
        "INSERT INTO short_links_stats (short_link, access_timestamp, host_address) VALUES ($1, $2, $3)",
        [shortLink, timestamp, hostAddress]
      );

      // Redirect to the original URL
      res.redirect(redLink.url);
    } else {
      res.status(404).json({ error: 'Short link not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.listen(port, (error) =>{
    if(!error)
        console.log(`Server is Successfully Running, and App is listening on port ${port}`)
    else
        console.log("Error occurred, server can't start", error);
    }
);
