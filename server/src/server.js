const express = require('express');
const { Pool } = require('pg');
const nanoid = require('nanoid');
const basicAuth = require('express-basic-auth');
const cors = require('cors');

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


// Endpoint to shorten a URL
app.post('/shorten', async (req, res) => {
  const originalUrl = req.body;

  // Generate a short ID
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
      console.log(`shotened Domain: ${shortenedUrl}`);
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
    const result = await pool.query('SELECT original_url FROM short_links WHERE short_link = $1', [shortLink]);

    if (result.rows.length > 0) {
      const originalUrl = result.rows[0].original_url;
      console.log(originalUrl)
      const redLink = JSON.parse(originalUrl);
      console.log(redLink.url);

      // Store statistics for each access
      const hostAddress = req.ip || req.connection.remoteAddress;
      const timestamp = new Date().toISOString();

      await pool.query(
        'INSERT INTO short_links_stats (short_link, access_timestamp, host_address) VALUES ($1, $2, $3)',
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
