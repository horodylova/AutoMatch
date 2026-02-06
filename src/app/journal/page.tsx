import React from 'react';

export default function JournalPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0e1b24',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <h1 style={{ 
        fontSize: '48px', 
        marginBottom: '20px',
        color: 'rgb(230, 214, 180)',
        fontFamily: 'sans-serif'
      }}>
        Journal
      </h1>
      <p style={{ 
        fontSize: '18px', 
        opacity: 0.8,
        maxWidth: '600px',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        Coming soon. Expert insights, car stories, and practical guides to help you find your perfect match.
      </p>
    </div>
  );
}
