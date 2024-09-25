import React, { useState, useEffect } from 'react';
import '../styles/Homepage.css'; 
import deleteIcon from '../images/deletebutton.png'; 

const HomePage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [startTime, setStartTime] = useState(null); // To record the start time
  const [errors, setErrors] = useState(false); // To track if there are errors in submission

  const fetchSubscribers = () => {
    fetch('https://your-backend-api-url/api/subscribers')
      .then((response) => response.json())
      .then((data) => {
        setSubscribers(data.Results);
      })
      .catch((error) => console.error('Error fetching subscribers:', error));
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSubscriber = { name, email };

    if (!name || !email) {
      setErrors(true);
      return;
    }

    setErrors(false);

    setSubscribers([...subscribers, { Name: name, EmailAddress: email }]);

    const endTime = new Date().getTime(); // Time when "Add Subscriber" is clicked
    const timeToSubmit = (endTime - startTime) / 1000; // Time in seconds

    // Detect if email is personal or generic
    const personalEmails = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com"];
    const emailDomain = email.split('@')[1];
    const isGenericEmail = personalEmails.includes(emailDomain);

    // Send event to Google Analytics
    window.gtag('event', 'add_subscriber', {
      event_category: 'Subscription',
      event_label: 'Add Subscriber Button Click',
      value: 1,
      time_to_submit: timeToSubmit, // Custom parameter for time to submit
      email_type: isGenericEmail ? 'generic' : 'personal', // Custom parameter for email type
      submission_errors: errors ? 'yes' : 'no', // Custom parameter for submission errors
    });

    fetch('https://your-backend-api-url/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubscriber),
    })
    .then(response => response.json())
    .then(data => {
      setName('');
      setEmail('');
    })
    .catch((error) => {
      console.error('Error adding subscriber:', error);
    });
  };

  const handleDelete = (email) => {
    const updatedSubscribers = subscribers.filter(subscriber => subscriber.EmailAddress !== email);
    setSubscribers(updatedSubscribers);

    fetch(`https://your-backend-api-url/api/subscribers/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    })
    .then((response) => {
      if (response.ok) {
        console.log(`Deleted subscriber: ${email}`);
      } else {
        console.error('Failed to delete subscriber');
      }
    })
    .catch((error) => {
      console.error('Error deleting subscriber:', error);
    });
  };

  return (
    <div className="homepage-container">
      <h1>Manage Subscribers</h1>
      <form 
        onSubmit={handleSubmit} 
        onFocus={() => setStartTime(new Date().getTime())} // Record the time when user starts typing
      >
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
