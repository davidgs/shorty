import React from 'react';
import logo from './logo.svg';
import ShortenLinkForm from './shortForm';
import './App.css';

function App() {
  const foo = () => {
    console.log('done');
  }
  return (
    <div className="App">
      <ShortenLinkForm onSubmit={foo}/>
    </div>
  );
}

export default App;
