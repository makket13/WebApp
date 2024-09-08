import React, { useState, useEffect } from 'react';
import '../styles/Homepage.css'; 
import deleteIcon from '../images/deletebutton.png'; 

const HomePage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const fetchSubscribers = () => {
    fetch('http://localhost:3001/api/subscribers')
      .then((response) => response.json())
      .then((data) => {
        setSubscribers(data.Results);
      })
      .catch((error) => console.error('Error fetching subscribers:', error));
      console.log(subscribers);
  };

  useEffect(() => {
    fetchSubscribers();
    
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSubscriber = { name, email };
  
    
    setSubscribers([...subscribers, { Name: name, EmailAddress: email }]);
  
    fetch('http://localhost:3001/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubscriber),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Subscriber added:', data);
      setName('');
      setEmail('');
    })
    .catch((error) => {
      console.error('Error adding subscriber:', error);
  
     
      setSubscribers(subscribers.filter(subscriber => subscriber.EmailAddress !== email));
    });

    return newSubscriber;
  };

  const handleDelete = (email) => {
    const updatedSubscribers = subscribers.filter(subscriber => subscriber.EmailAddress !== email);
    setSubscribers(updatedSubscribers);
  
    fetch(`http://localhost:3001/api/subscribers/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    })
    .then((response) => {
      if (response.ok) {
        console.log(`Deleted subscriber: ${email}`);
      } else {
        console.error('Failed to delete subscriber');
  
        setSubscribers([...updatedSubscribers, subscribers.find(subscriber => subscriber.EmailAddress === email)]);
      }
    })
    .catch((error) => {
      console.error('Error deleting subscriber:', error);
  
      setSubscribers([...updatedSubscribers, subscribers.find(subscriber => subscriber.EmailAddress === email)]);
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
          <table className="subscribers-table">
            <thead>
              <tr>
                <th>Ονοματεπώνυμο</th>
                <th>Email</th>
                <th>Επιλογές</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber, index) => (
                <tr key={index}>
                  <td>{subscriber.Name}</td>
                  <td>{subscriber.EmailAddress}</td>
                  <td>
                    <img 
                      src={deleteIcon} 
                      alt="Delete" 
                      className="delete-icon" 
                      onClick={() => handleDelete(subscriber.EmailAddress)} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No subscribers yet</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
