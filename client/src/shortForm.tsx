import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface ShortenLinkFormProps {
  onSubmit: () => void; // Callback function to execute after successful submission
}

const ShortenLinkForm: React.FC<ShortenLinkFormProps> = ({ onSubmit }) => {
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOriginalUrl(event.target.value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      // Make a POST request to the server to shorten the link
      const response = await axios.post('http://localhost:3000/shorten', { originalUrl });

      // Update state with the shortened URL
      setShortenedUrl(response.data.shortenedUrl);

      // Execute the callback function
      onSubmit();
    } catch (error) {
      console.error('Error shortening link:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Enter the URL to be shortened:
          <input
            type="url"
            value={originalUrl}
            onChange={handleInputChange}
            required
          />
        </label>
        <button type="submit">Shorten Link</button>
      </form>
      {shortenedUrl && (
        <div>
          <p>Shortened URL:</p>
          <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
            {shortenedUrl}
          </a>
        </div>
      )}
    </div>
  );
};

export default ShortenLinkForm;
