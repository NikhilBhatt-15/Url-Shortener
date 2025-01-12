import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import to_base_62 from "./utility.js";
import client from './database.js';
import { check_valid_url } from "./utility.js";

const PORT = process.env.PORT || 2000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to reconnect to PostgreSQL
// const reconnectClient = () => {
//     client.connect(err => {
//         if (err) {
//             console.error('Failed to reconnect to PostgreSQL', err);
//             setTimeout(reconnectClient, 5000); // Retry after 5 seconds
//         } else {
//             console.log('Reconnected to PostgreSQL');
//         }
//     });
// };
//
// // Error handling for PostgreSQL client
// client.on('error', (err) => {
//     console.error('Unexpected error on idle client', err);
//     if (err.code === '57P01') { // Check for specific error code if needed
//         reconnectClient();
//     }
// });
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to URL Shortener" });
}   );
app.post('/shorten', async (req, res) => {
    const longUrl = req.body.longurl;
    if (!longUrl) {
        return res.status(400).json({ error: "Please provide a long url" });
    }
    client.query('SELECT * FROM url WHERE longurl = $1', [longUrl], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (result.rows.length === 0) {
            if (!check_valid_url(longUrl)) {
                return res.status(400).json({ error: "Invalid URL" });
            }
            const shortcode = to_base_62(Math.random() * 10000000000000000);
            const shortUrl = `${process.env.BASE_URL}/${shortcode}`;
            client.query('INSERT INTO url(longurl, shorturl) VALUES($1, $2) RETURNING *', [longUrl, shortUrl], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Internal Server Error" });
                }
                res.status(201).json(result.rows[0]);
            });
        } else {
            res.status(200).json(result.rows[0]);
        }
    });
});

app.get('/:shortcode', async (req, res) => {
    const shortcode = req.params.shortcode;
    client.query('SELECT * FROM url WHERE shorturl = $1', [`${process.env.BASE_URL}/${shortcode}`], (err, result) => {
        if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Shortcode not found" });
        } else {
            res.redirect(result.rows[0].longurl);
        }
    });
});

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
    console.log("Route not found");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});