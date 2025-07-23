import React, { useState } from 'react';
import axios from 'axios';

const eS = [];

const url1 = 'http://20.244.56.144/evaluation-service/logs';

const Log = async (stack, level, packageName, message) => {
  const payload = {
    stack,
    level,
    package: packageName,
    message,
  };

  try {
    await axios.post(url1, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("Failed to send log:", err);
  }
};

const logError = (err, context = '') => {
  const message = (err.message || err.toString()) + (context ? ` | Context: ${context}` : '');

  const errorEntry = {
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  eS.push(errorEntry);
  console.error("Logged Error:", errorEntry);

  Log('frontend', 'error', 'api', message);
};

function App() {
  const [url, setUrl] = useState('');
  const [shortcode, setShortcode] = useState('');
  const [expiry, setExpiry] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setResponse(null);

  const expiryValue = expiry && Number(expiry) > 0 ? Number(expiry) : 30;

  try {
    const res = await axios.post('http://localhost:5000/shorten', {
      url,
      shortcode,
      expiry: expiryValue,
    });
    setResponse(res.data);
  } catch (err) {
    logError(err, 'Error in handleSubmit');
    if (err.response && err.response.data?.error) {
      setError(err.response.data.error);
    } else {
      setError('Something went wrong');
    }
  }
};

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>🔗 URL Shortener</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Enter URL"
          required
          style={{ width: "300px" }}
        /><br /><br />
        <input
          type="text"
          value={shortcode}
          onChange={e => setShortcode(e.target.value)}
          placeholder="Shortcode"
          required
          style={{ width: "300px" }}
        /><br /><br />
        <input
          type="number"
          value={expiry}
          onChange={e => setExpiry(e.target.value)}
          placeholder="Expiry (in minutes)"
          min="1"
          style={{ width: "300px" }}
        /><br /><br />
        <button type="submit">Shorten</button>
      </form>

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <p><strong>Shortened URL:</strong> <a href={response.short_url}>{response.short_url}</a></p>
          <p><strong>Expires at:</strong> {response.expiry}</p>
        </div>
      )}
    </div>
  );
}

export default App;