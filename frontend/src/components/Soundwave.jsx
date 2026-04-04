import React from 'react';

const Soundwave = ({ color = 'var(--primary)', size = '30px' }) => {
  return (
    <div className="soundwave-container" style={{ height: size }}>
      <div className="bar" style={{ backgroundColor: color }}></div>
      <div className="bar" style={{ backgroundColor: color }}></div>
      <div className="bar" style={{ backgroundColor: color }}></div>
      <div className="bar" style={{ backgroundColor: color }}></div>
      <div className="bar" style={{ backgroundColor: color }}></div>
    </div>
  );
};

export default Soundwave;
