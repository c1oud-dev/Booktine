import React from 'react';

const HomePage: React.FC = () => {
  const username = localStorage.getItem('username');

  return (
    <div className="home-page">
      <h2>Welcome, {username || 'User'}!</h2>
      <p>This is the Home Page after login.</p>
    </div>
  );
};

export default HomePage;
