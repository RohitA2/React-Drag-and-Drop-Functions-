import { useEffect, useState } from "react";
import axios from "axios";

export default function BankIDSignFlow({ sessionId, qrCodeLink }) {
  const [status, setStatus] = useState("Pending");

  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        const resp = await axios.get(
          `${process.env.API_URL}/bankid/status/${sessionId}`
        );

        const newStatus = resp.data?.data?.status;
        setStatus(newStatus);

        if (newStatus === "Completed") {
          clearInterval(interval);
          window.location.href = "/bankid-success";
        }
        if (newStatus === "Failed") {
          clearInterval(interval);
          window.location.href = "/bankid-failed";
        }

      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div style={styles.container}>
      <h2>Sign with BankID</h2>
      <p>Scan this QR code using BankID App:</p>

      <img src={qrCodeLink} alt="QR Code" style={styles.qr} />

      <p>
        Status: <b>{status}</b>
      </p>

      <small>Keep the BankID app open while signing…</small>
    </div>
  );
}

const styles = {
  container: { padding: 20, textAlign: "center" },
  qr: { width: 260, height: 260, borderRadius: 10 }
};
