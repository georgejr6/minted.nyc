import React, { useState } from 'react';
import axios from 'axios';

// Define the React component for the NFT minting app
function App() {
  // Define state variables for media, latitude, longitude, loading state, transaction ID, and error state
  const [media, setMedia] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txId, setTxId] = useState(null);
  const [error, setError] = useState(null);

  // Define the form submission handler function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set loading state to true to show loading indicator
    setIsLoading(true);

    try {
      // Submit a POST request to the /nft endpoint of the backend server with media and location data
      const response = await axios.post('/nft', {
        media,
        location: {
          latitude,
          longitude,
        },
      });

      // Set the transaction ID and clear the error state
      setTxId(response.data.txId);
      setError(null);
    } catch (err) {
      // Log and display any errors that occur
      console.error(err);
      setError(err.message);
      setTxId(null);
    } finally {
      // Set loading state to false to hide loading indicator
      setIsLoading(false);
    }
  };

  // Render the form and transaction ID (if available) as well as any loading or error states
  return (
    <div>
      <h1>Mint an NFT with Location Data</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="media">Media (file upload)</label>
          <input type="file" id="media" onChange={(e) => setMedia(e.target.files[0])} />
        </div>
        <div>
          <label htmlFor="latitude">Latitude</label>
          <input type="number" id="latitude" step="any" onChange={(e) => setLatitude(parseFloat(e.target.value))} />
        </div>
        <div>
          <label htmlFor="longitude">Longitude</label>
          <input type="number" id="longitude" step="any" onChange={(e) => setLongitude(parseFloat(e.target.value))} />
        </div>
        <button type="submit" disabled={isLoading}>Mint NFT</button>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {txId && <p>Transaction ID: {txId}</p>}
    </div>
  );
}

export default App;
