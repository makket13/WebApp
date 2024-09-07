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

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Endpoint to fetch subscribers from Campaign Monitor API
app.get('/api/subscribers', async (req, res) => {
  try {
    const response = await axios.get(`https://api.createsend.com/api/v3.2/lists/${LIST_ID}/active.json`, {
      headers: {
        'Authorization': `Basic ${API_AUTH}`,
      }
    });

    // Φιλτράρουμε τους συνδρομητές που δεν είναι "deleted"
    const activeSubscribers = response.data.Results.filter(subscriber => !subscriber.State || subscriber.State !== 'Deleted');

    res.json({ Results: activeSubscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching subscribers');
  }
});

// Endpoint για να προσθέσουμε συνδρομητές
app.post('/api/subscribers', async (req, res) => {
  const { name, email } = req.body;

  try {
    const response = await axios.post(
      `https://api.createsend.com/api/v3.2/subscribers/${LIST_ID}.json`, 
      {
        EmailAddress: email,
        Name: name,
        ConsentToTrack: 'Yes',
        Resubscribe: true
      }, 
      {
        headers: {
          'Authorization': `Basic ${API_AUTH}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Μετά την προσθήκη του συνδρομητή, κάνουμε νέο request για να πάρουμε την ενημερωμένη λίστα
    const updatedList = await axios.get(`https://api.createsend.com/api/v3.2/lists/${LIST_ID}/active.json`, {
      headers: {
        'Authorization': `Basic ${API_AUTH}`,
      }
    });

    // Επιστρέφουμε την ενημερωμένη λίστα στο frontend
    res.status(201).json(updatedList.data.Results);
  } catch (error) {
    console.error('Error adding subscriber:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to add subscriber' });
  }
});

// Endpoint για να διαγράψουμε συνδρομητή
app.delete('/api/subscribers/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const response = await axios.delete(
      `https://api.createsend.com/api/v3.2/subscribers/${LIST_ID}.json?email=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Basic ${API_AUTH}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    // Μετά τη διαγραφή του συνδρομητή, κάνουμε νέο request για να πάρουμε την ενημερωμένη λίστα
    const updatedList = await axios.get(`https://api.createsend.com/api/v3.2/lists/${LIST_ID}/active.json`, {
      headers: {
        'Authorization': `Basic ${API_AUTH}`,
      }
    });

    // Επιστρέφουμε την ενημερωμένη λίστα στο frontend
    res.status(200).json(updatedList.data.Results);
  } catch (error) {
    console.error('Error deleting subscriber:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
