const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

const API_KEY = process.env.API_KEY;
const LIST_ID = process.env.LIST_ID;
const API_AUTH = Buffer.from(`${API_KEY}:`).toString('base64');

router.get('/', async (req, res) => {
  try {
    const response = await axios.get(`https://api.createsend.com/api/v3.2/lists/${LIST_ID}/active.json`, {
      headers: {
        'Authorization': `Basic ${API_AUTH}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching subscribers:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching subscribers');
  }
});

router.post('/', async (req, res) => {
  const { name, email } = req.body;
  
  try {
    const response = await axios.post(`https://api.createsend.com/api/v3.2/subscribers/${LIST_ID}.json`, 
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
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error adding subscriber:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to add subscriber' });
  }
});

router.delete('/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const response = await axios.post(
      `https://api.createsend.com/api/v3.2/subscribers/${LIST_ID}/unsubscribe.json`,
      {
        EmailAddress: email
      },
      {
        headers: {
          'Authorization': `Basic ${API_AUTH}`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.status(200).json({ message: 'Subscriber moved to deleted category.' });
  } catch (error) {
    console.error('Error deleting subscriber:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

module.exports = router;
