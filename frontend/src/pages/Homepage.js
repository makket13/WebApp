import React, { useState, useEffect, useRef } from 'react';
import '../styles/Homepage.css'; 
import deleteIcon from '../images/deletebutton.png'; 


const HomePage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [startTime, setStartTime] = useState(null);
  const typingStarted = useRef(false);


  const handleButtonClick = (buttonName) => {
    if (window.gtag) {
      window.gtag('event', 'button_clicked', {
        button_name: buttonName
      });
    } else {
      console.error('Google Analytics not loaded');
    }
  };


  const handleTyping = () => {
    if (!typingStarted.current) {
      typingStarted.current = true;
      setStartTime(Date.now());
    }
  };

  const updateUserProperty = (numSubscribers) => {
    if (window.gtag) {
      window.gtag('set', { 'num_subscribers': numSubscribers });
      window.gtag('event', 'subscriber_count_changed', {
        num_subscribers: numSubscribers
      });
  
    } else {
      console.error('Google Analytics not loaded');
    }
  };

  const fetchSubscribers = () => {
    fetch('https://webapp-v60b.onrender.com/api/subscribers')
      .then((response) => response.json())
      .then((data) => {
        setSubscribers(data.Results);
        updateUserProperty(data.Results.length);
      })
      .catch((error) => console.error('Error fetching subscribers:', error));
  };

  useEffect(() => {
    fetchSubscribers();

    const checkGtagLoaded = () => {
      if (typeof window.gtag === 'function') {
      } else {
        console.error("Google Analytics not loaded");
      }
    };

    window.addEventListener('load', checkGtagLoaded);

    return () => window.removeEventListener('load', checkGtagLoaded);
  }, []);

  const handleInputChange = () => {
    if (!startTime) {
      setStartTime(new Date());
    }
  };

  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newSubscriber = { name, email };
  
    setSubscribers([...subscribers, { Name: name, EmailAddress: email }]);
  
    fetch('https://webapp-v60b.onrender.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubscriber),
    })
    .then(response => response.json())
    .then(data => {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      updateUserProperty(subscribers.length + 1);
      const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
      const emailDomain = email.split('@')[1];
      const emailType = genericDomains.includes(emailDomain) ? 'generic' : 'personal';
  
      if (window.gtag) {
        window.gtag('event', 'add_subscriber', {
          time_needed: timeTaken,
          email_type: emailType,
          errors: 0,
        });
      } else {
        console.error('Google Analytics not loaded');
      }
  
      setName('');
      setEmail('');
      setStartTime(null);
      typingStarted.current = false;
    })
    .catch((error) => {
      console.error('Error adding subscriber:', error);
      setSubscribers(subscribers.filter(subscriber => subscriber.EmailAddress !== email));
      if (window.gtag) {
        window.gtag('event', 'cm_api_error', {
          error_message: error.message,
          error_type: 'add',
        });
      } else {
        console.error('Google Analytics not loaded');
      }
    });
  
    return newSubscriber;
  };
  

  const handleDelete = (email, index) => {
    const updatedSubscribers = subscribers.filter(subscriber => subscriber.EmailAddress !== email);
    const totalSubscribers = subscribers.length;
    const position = `${index + 1}/${totalSubscribers}`;
    
    // Check if email is personal or generic
    const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const emailDomain = email.split('@')[1];
    const emailType = genericDomains.includes(emailDomain) ? 'generic' : 'personal';
  
    if (window.gtag) {
      window.gtag('event', 'remove_subscriber', {
        position: position,
        email_type: emailType,
      });
    } else {
      console.error('Google Analytics not loaded');
    }
  
    setSubscribers(updatedSubscribers);
  
    fetch(`https://webapp-v60b.onrender.com/api/subscribers/${encodeURIComponent(email)}`, {
      method: 'DELETE',
    })
    .then((response) => {
      if (response.ok) {
        updateUserProperty(updatedSubscribers.length);
      } else {
        console.error('Failed to delete subscriber');
        setSubscribers([...updatedSubscribers, subscribers.find(subscriber => subscriber.EmailAddress === email)]);
        if (window.gtag) {
          window.gtag('event', 'cm_api_error', {
            error_message: 'Failed to delete subscriber',
            error_type: 'remove',
          });
        } else {
          console.error('Google Analytics not loaded');
        }
      }
    })
    .catch((error) => {
      console.error('Error deleting subscriber:', error);
      setSubscribers([...updatedSubscribers, subscribers.find(subscriber => subscriber.EmailAddress === email)]);
      if (window.gtag) {
        window.gtag('event', 'cm_api_error', {
          error_message: error.message,
          error_type: 'remove',
        });
      } else {
        console.error('Google Analytics not loaded');
      }
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
          onChange={(e) => {
            setName(e.target.value);
            handleInputChange();
            handleTyping();
          }} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => {
            setEmail(e.target.value);
            handleInputChange();
            handleTyping();
          }} 
          required 
        />
        <button type="submit" onClick={() => handleButtonClick('Add Subscriber')}>Add Subscriber</button>
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
                    onClick={() =>{
                       handleDelete(subscriber.EmailAddress, index);
                       handleButtonClick('Delete button');}}
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
