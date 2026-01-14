import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import Directory from './pages/Directory';

function App() {
  return (
    <>
      <Directory />
      <Analytics />
    </>
  );
}

export default App;
