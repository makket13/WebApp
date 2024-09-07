const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');  // Για να φορτώσουμε τα περιεχόμενα του .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// API Key and List ID from .env
const API_KEY = process.env.API_KEY;
const LIST_ID = process.env.LIST_ID;
const API_AUTH = Buffer.from(`${API_KEY}:`).toString('base64');  // Basic Authentication

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Endpoint to fetch subscribers from Campaign Monitor API
app.get('/api/subscribers', async (req, res) => {
  try {
    const auth = Buffer.from(`${API_KEY}:`).toString('base64');
    const response = await axios.get(`https://api.createsend.com/api/v3.2/lists/${LIST_ID}/active.json`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    console.log(response.data);  // Εκτυπώνει τα δεδομένα στο terminal
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching subscribers:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching subscribers');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
