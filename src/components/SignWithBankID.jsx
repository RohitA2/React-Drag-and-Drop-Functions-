// frontend/src/components/SignWithBankID.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const SignWithBankID = ({ onSuccess, onError }) => {
  const [step, setStep] = useState('init');
  const [autoStartToken, setAutoStartToken] = useState(null);
  const [orderRef, setOrderRef] = useState(null);
  const [status, setStatus] = useState(null);

  // Initiate sign - CALLS THE BACKEND API
  const initiateSign = async () => {
    try {
      setStep('qr');
      console.log('Initiating BankID sign...');
      
      const response = await axios.post('http://localhost:5000/api/bankid/sign', {
        personalNumber: '191212121212', // Test SSN
        userVisibleData: 'I approve this document signing.', // Simple string
      });
      
      console.log('BankID response:', response.data);
      setOrderRef(response.data.orderRef);
      setAutoStartToken(response.data.autoStartToken);
      
    } catch (err) {
      console.error('Sign initiation error:', err);
      setStep('error');
      onError?.(err.response?.data?.error || err.message || 'Failed to initiate signing');
    }
  };

  // Poll status - CALLS THE BACKEND API
  useEffect(() => {
    if (orderRef && step === 'polling') {
      const id = setInterval(async () => {
        try {
          const response = await axios.post(`http://localhost:5000/api/bankid/collect/${orderRef}`);
          setStatus(response.data);
          
          if (response.data.status === 'complete') {
            clearInterval(id);
            setStep('success');
            onSuccess?.(response.data.completionData);
          } else if (['failed', 'cancelled'].includes(response.data.status)) {
            clearInterval(id);
            setStep('error');
            onError?.(`Signing ${response.data.status}`);
          }
        } catch (err) {
          console.error('Polling error:', err);
          clearInterval(id);
          setStep('error');
          onError?.(err.response?.data?.error || 'Failed to collect status');
        }
      }, 2000);
      
      return () => clearInterval(id);
    }
  }, [orderRef, step, onSuccess, onError]);

  const startPolling = () => {
    setStep('polling');
  };

  // Animated QR
  useEffect(() => {
    if (step === 'qr' && autoStartToken) {
      const qrInterval = setInterval(() => {
        setAutoStartToken((prev) => prev); // Trigger re-render
      }, 5000);
      return () => clearInterval(qrInterval);
    }
  }, [step, autoStartToken]);

  return (
    <div>
      {step === 'init' && (
        <button onClick={initiateSign}>Sign with BankID</button>
      )}
      {step === 'qr' && autoStartToken && (
        <div className="qr-container">
          <p>Scan with BankID app or click to open:</p>
          <QRCodeSVG
            value={`bankid:///?autostarttoken=${autoStartToken}&redirect=${encodeURIComponent(window.location.href)}`}
            size={256}
            fgColor="#000000"
            bgColor="#FFFFFF"
          />
          <p>QR updates every 5 seconds.</p>
          <button
            onClick={() => (window.location.href = `bankid:///?autostarttoken=${autoStartToken}`)}
          >
            Open BankID App
          </button>
          <button onClick={startPolling}>Simulate Scan (Test)</button>
        </div>
      )}
      {step === 'polling' && <p>Waiting for signature...</p>}
      {step === 'success' && status && (
        <div className="success">
          <h3>Signing Successful!</h3>
          <p>SSN: {status.completionData?.user?.personalNumber}</p>
          <p>Signature: {status.completionData?.signature?.value?.slice(0, 20)}...</p>
        </div>
      )}
      {step === 'error' && <p className="error">Error during signing. Please try again.</p>}
    </div>
  );
};

export default SignWithBankID;