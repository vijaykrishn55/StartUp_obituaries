import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import MessagingApp from './components/MessagingApp';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './App.css';
import './components/Common/ErrorBoundary.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <MessagingApp />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
