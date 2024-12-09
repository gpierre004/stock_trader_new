import React from 'react';
import { useSelector } from 'react-redux';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Investment Portfolio Dashboard</h1>
      <div style={styles.welcome}>
        Welcome back, {user?.email || 'Investor'}!
      </div>
      <div style={styles.summary}>
        <div style={styles.card}>
          <h3>Portfolio Value</h3>
          <p>$0.00</p>
        </div>
        <div style={styles.card}>
          <h3>Total Investments</h3>
          <p>0</p>
        </div>
        <div style={styles.card}>
          <h3>Performance</h3>
          <p>0%</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
  },
  title: {
    marginBottom: '2rem',
    color: '#333',
  },
  welcome: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    color: '#666',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  card: {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '& h3': {
      marginBottom: '1rem',
      color: '#333',
    },
    '& p': {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#007bff',
    },
  },
};

export default DashboardPage;
