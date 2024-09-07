import React, { useState, useEffect } from 'react';
import '../styles/Homepage.css'; 

const HomePage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/subscribers')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched data:', data);  // Εκτυπώνει τα δεδομένα στο console του browser
        setSubscribers(data.Results);  // Προσαρμόζουμε για να χρησιμοποιούμε τα δεδομένα από το "Results"
      })
      .catch((error) => console.error('Error fetching subscribers:', error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSubscriber = { name, email };

    fetch('http://localhost:3001/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubscriber),
    })
      .then(response => response.json())
      .then(data => {
        setSubscribers([...subscribers, data]);
        setName('');
        setEmail('');
      });
  };

  return (
    <div className="homepage-container">
      <h1>Manage Subscribers</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">Add Subscriber</button>
      </form>

      <div>
        <h2>Subscribers</h2>
        {subscribers.length > 0 ? (
          <ul>
            {subscribers.map((subscriber, index) => (
              <li key={index}>{subscriber.Name} - {subscriber.EmailAddress}</li>
            ))}
          </ul>
        ) : (
          <p>No subscribers yet</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
