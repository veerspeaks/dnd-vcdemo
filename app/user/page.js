"use client";

import { useState, useEffect } from "react";
import axios from 'axios';
import dynamic from 'next/dynamic';

const AgoraUIKit = dynamic(
  () => import('agora-react-uikit').then((mod) => mod.default),
  { ssr: false }
);

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: '40px 20px',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loginContainer: {
    width: '100%',
    maxWidth: '400px',
    margin: '40px auto',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  heading: {
    textAlign: 'center',
    color: '#1e293b',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '24px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    margin: '8px 0',
    borderRadius: '8px',
    border: '2px solid #e2e8f0',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '16px',
  },
  stylistsContainer: {
    width: '100%',
    maxWidth: '800px',
    margin: '20px auto',
    padding: '32px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  stylistsList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  stylistCard: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  stylistAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#64748b',
    fontWeight: '600',
  },
  stylistName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#334155',
    margin: '0',
  },
  connectButton: {
    padding: '10px 24px',
    backgroundColor: '#22c55e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
  },
  videoCallContainer: {
    width: '100%',
    maxWidth: '1200px',
    marginTop: '24px',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  leaveButton: {
    marginTop: '16px',
    padding: '12px 24px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default function UserPage() {
  const [token, setToken] = useState(null);
  const [stylists, setStylists] = useState([]);
  const [videocall, setVideocall] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [rtcProps, setRtcProps] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) {
      fetchStylists();
    }
  }, [token]);

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8000/api/v1/user/login', { email, password });
      setToken(res.data.token);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const fetchStylists = async () => {
    try {
      // Example: /api/v1/user/stylists => returns an array of stylists
      const res = await axios.get('http://localhost:8000/api/v1/user/stylists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStylists(res.data.stylists);
      
    } catch (error) {
      console.error("Error fetching stylists:", error);
    }
  };

  const handleConnect = async (stylistId) => {
    try {
      const res = await axios.post(
        'http://localhost:8000/api/v1/appointment/request',
        { stylistId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { channelName, agoraToken, userId } = res.data;

      const newRtcProps = {
        appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || "0667a7d327224fb7b8c3856c507692ec",
        channel: channelName,
        token: agoraToken,  // This is the user token returned by requestConnection
        uid: userId,
        // uid: "67755c25149f151f1999dd32" 
        role: 'host'
      };

      console.log("for user", newRtcProps); 

      setChannelName(channelName);
      setRtcProps(newRtcProps);
      setVideocall(true);

    } catch (error) {
      console.error("Error connecting to stylist:", error);
    }
  };

  const handleLeaveCall = () => {
    setVideocall(false);
    setRtcProps(null);
  };

  return (
    <div style={styles.container}>
      {!token ? (
        <div style={styles.loginContainer}>
          <h2 style={{ ...styles.heading, marginTop: 0 }}>Welcome Back</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
          />
          <button 
            onClick={handleLogin} 
            style={{
              ...styles.button,
              '&:hover': {
                backgroundColor: '#2563eb',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Login
          </button>
        </div>
      ) : (
        <div style={styles.stylistsContainer}>
          <h1 style={styles.heading}>Available Stylists</h1>
          <ul style={styles.stylistsList}>
            {stylists.map(stylist => (
              <li 
                key={stylist._id} 
                style={{
                  ...styles.stylistCard,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    backgroundColor: '#f1f5f9',
                  },
                }}
              >
                <div style={styles.stylistAvatar}>
                  {stylist.name[0].toUpperCase()}
                </div>
                <h3 style={styles.stylistName}>{stylist.name}</h3>
                <button 
                  onClick={() => handleConnect(stylist._id)}
                  style={{
                    ...styles.connectButton,
                    '&:hover': {
                      backgroundColor: '#16a34a',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  Connect
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {videocall && rtcProps && (
        <div style={styles.videoCallContainer}>
          <AgoraUIKit
            rtcProps={rtcProps}
            callbacks={{ EndCall: handleLeaveCall }}
          />
          <button 
            onClick={handleLeaveCall} 
            style={{
              ...styles.leaveButton,
              '&:hover': {
                backgroundColor: '#dc2626',
                transform: 'translateY(-1px)',
              },
            }}
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
}