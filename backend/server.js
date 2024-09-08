const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv'); 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


const API_KEY = process.env.API_KEY;
const LIST_ID = process.env.LIST_ID;
const API_AUTH = Buffer.from(`${API_KEY}:`).toString('base64');  

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});


app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.get('/api/subscribers', async (req, res) => {
  try {
    const response = await axios.get(`https://api.createsend.com/api/v3.2/lists/${LIST_ID}/active.json`, {
      headers: {
        'Authorization': `Basic ${API_AUTH}`,
      }
    });

    const activeSubscribers = response.data.Results.filter(subscriber => !subscriber.State || subscriber.State !== 'Deleted');

    res.json({ Results: activeSubscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error.response ? error.response.data : error.message);
    res.status(500).send('Error fetching subscribers');
  }
});

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

    const updatedList = await axios.get(`https://api.createsend.com/api/v3.2/lists/${LIST_ID}/active.json`, {
      headers: {
        'Authorization': `Basic ${API_AUTH}`,
      }
    });

    res.status(201).json(updatedList.data.Results);
  } catch (error) {
    console.error('Error adding subscriber:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to add subscriber' });
  }
});


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
    
    const updatedList = await axios.get(`https://api.createsend.com/api/v3.2/lists/${LIST_ID}/active.json`, {
      headers: {
        'Authorization': `Basic ${API_AUTH}`,
      }
    });

    res.status(200).json(updatedList.data.Results);
  } catch (error) {
    console.error('Error deleting subscriber:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
