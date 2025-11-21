import React from 'react';

// Define the styles for a cleaner presentation
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh', // Full viewport height
    backgroundColor: '#eef2f5', // Very light, modern background
    fontFamily: "'Inter', sans-serif", // A modern, clean sans-serif font
    color: '#333d47', // Darker text for good readability
    padding: '20px',
    boxSizing: 'border-box', // Include padding in element's total width and height
  },
  card: {
    padding: '40px',
    borderRadius: '16px', // More rounded corners
    backgroundColor: '#ffffff',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)', // Slightly stronger, but soft shadow
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out', // Smooth transitions for future interactions
    willChange: 'transform, box-shadow', // Optimize for animation
    opacity: 0, // Start invisible for the drop-in animation
  },
  // Keyframes for the 'drop-in' animation
  cardDropInAnimation: `
    @keyframes dropIn {
      0% {
        opacity: 0;
        transform: translateY(-100px); /* Start high above */
      }
      60% {
        opacity: 1;
        transform: translateY(10px); /* Overshoot slightly for a bounce effect */
      }
      80% {
        transform: translateY(-5px); /* Bounce up a little */
      }
      100% {
        opacity: 1;
        transform: translateY(0); /* Settle at its final position */
      }
    }
  `,
  // Applied to the card
  cardAnimated: {
    animation: 'dropIn 0.8s ease-out forwards', // Apply the drop-in animation
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '25px',
    position: 'relative', // For the 'X' animation
  },
  // Keyframes for icon spin/pulse
  iconEmphasisAnimation: `
    @keyframes iconSpinPulse {
      0% { transform: rotate(0deg) scale(1); opacity: 1; }
      25% { transform: rotate(-5deg) scale(1.05); }
      50% { transform: rotate(5deg) scale(1); }
      75% { transform: rotate(-5deg) scale(1.05); }
      100% { transform: rotate(0deg) scale(1); opacity: 1; }
    }
  `,
  // Applied to the icon
  iconAnimated: {
    animation: 'iconEmphasisAnimation 0.8s ease-out', // Only play once on entry
  },
  svgIcon: {
    width: '64px',
    height: '64px',
    color: '#ef4444', // A modern, slightly muted red for error
  },
  heading: {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '15px',
    color: '#2d3748', // Darker heading for contrast
  },
  message: {
    fontSize: '17px',
    lineHeight: '1.6',
    color: '#52606d',
    marginBottom: '30px',
  },
  button: {
    backgroundColor: '#ef4444', // Red button for a failed state, consistent with icon
    color: '#ffffff',
    padding: '12px 25px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '17px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out',
    '&:hover': {
      backgroundColor: '#dc2626', // Darker red on hover
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    }
  },
};

// SVG for an 'X' or 'Failure' icon - modern and clean
const FailureSVG = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);


export default function BankIdFailed() {
  return (
    <div style={styles.container}>
      {/* Inject the keyframes into the document head */}
      <style>
        {styles.cardDropInAnimation}
        {styles.iconEmphasisAnimation}
      </style>

      <div style={{ ...styles.card, ...styles.cardAnimated }}>
        <div style={{ ...styles.iconWrapper, ...styles.iconAnimated }}>
          <FailureSVG size={styles.svgIcon.width} color={styles.svgIcon.color} />
        </div>
        
        <h1 style={styles.heading}>
          Authentication Failed
        </h1>
        
        <p style={styles.message}>
          It looks like your BankID authentication or signing process was **unsuccessful or cancelled**. Please ensure all details are correct and try again.
        </p>

        <button 
          style={styles.button}
          onClick={() => console.log("Retrying BankID...")} // Placeholder for actual retry logic
        >
          Try Again
        </button>

      </div>
    </div>
  );
}