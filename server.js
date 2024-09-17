import express from 'express';
import mongoose from 'mongoose';
import shortid from 'shortid';
import dotenv from 'dotenv'
import cors from 'cors';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
// MongoDB setup
mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// URL schema and model
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortId: { type: String, unique: true }
});
const Url = mongoose.model('Url', urlSchema);

// Route to create a shortened URL
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  // Generate a unique short ID
  const shortId = shortid.generate();

  // Save to database
  const url = new Url({ originalUrl, shortId });
  await url.save();

  res.json({ shortUrl: `http://localhost:8000/${shortId}` });
});

// Route to handle redirection
app.get('/:shortId', async (req, res) => {
  const { shortId } = req.params;
  const url = await Url.findOne({ shortId });

  if (url) {
    res.redirect(url.originalUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(process.env.PORT, () => {
  console.log('Server running at http://localhost:8000');
});
