"use client";

import { useState, useEffect } from "react";
import axios from 'axios';
import dynamic from 'next/dynamic';

const AgoraUIKit = dynamic(
  () => import('agora-react-uikit').then((mod) => mod.default),
  { ssr: false }
);

const StylistPage = () => {
  const [appointmentId, setAppointmentId] = useState(null);
  const [token, setToken] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [videocall, setVideocall] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [rtcProps, setRtcProps] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) {
      fetchPendingAppointments();
    }
  }, [token]);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/v1/stylist/login', { email, password });
      setToken(response.data.token);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const fetchPendingAppointments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/appointment/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Pending appointments response data:", response.data);
      setAppointments(response.data.pendingAppointments);
    } catch (error) {
      console.error("Error fetching pending appointments:", error);
    }
  };

  const handleConnect = async (appointmentId) => {
    try {
      const response = await axios.post('http://localhost:8000/api/v1/appointment/accept', { appointmentId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
     
      const { channelName, agoraToken, uid } = response.data;
      setAppointmentId(appointmentId);

      const newRtcProps = {
        appId: "0667a7d327224fb7b8c3856c507692ec",
        channel: channelName,
        token: agoraToken,
        uid: uid,
        role: 'host'
      };

      console.log("for stylist", newRtcProps); 

      setChannelName(channelName);
      setRtcProps(newRtcProps);
      setVideocall(true);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const handleLeaveCall = async (appointmentId) => {
    try{
      const response = await axios.post('http://localhost:8000/api/v1/appointment/end', { appointmentId: appointmentId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Appointment ended successfully:", response.data);
    }catch(error){
      console.error("Error ending call:", error);
    }
    
    setVideocall(false);
    setRtcProps(null);
  };

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
      transition: 'transform 0.2s ease',
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
      '&:focus': {
        borderColor: '#3b82f6',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
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
      '&:hover': {
        backgroundColor: '#2563eb',
        transform: 'translateY(-1px)',
      },
    },
    appointmentsContainer: {
      width: '100%',
      maxWidth: '800px',
      margin: '20px auto',
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
    appointmentsList: {
      listStyleType: 'none',
      padding: '0',
      margin: '0',
    },
    appointmentItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      margin: '8px 0',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: 'translateX(4px)',
        backgroundColor: '#f1f5f9',
      },
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    userAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: '#64748b',
      fontWeight: '600',
    },
    userName: {
      fontSize: '16px',
      color: '#334155',
      fontWeight: '500',
    },
    connectButton: {
      padding: '10px 20px',
      backgroundColor: '#22c55e',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#16a34a',
        transform: 'translateY(-1px)',
      },
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
      '&:hover': {
        backgroundColor: '#dc2626',
        transform: 'translateY(-1px)',
      },
    },
  };

  return (
    <div style={styles.container}>
      {!token ? (
        <div style={styles.loginContainer}>
          <h2 style={{ ...styles.heading, marginTop: 0 }}>Stylist Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleLogin} style={styles.button}>
            Login
          </button>
        </div>
      ) : (
        <div style={styles.appointmentsContainer}>
          <h1 style={styles.heading}>Pending Appointments</h1>
          <ul style={styles.appointmentsList}>
            {appointments.map(appointment => (
              <li key={appointment.id} style={styles.appointmentItem}>
                <div style={styles.userInfo}>
                  <div style={styles.userAvatar}>
                    {(appointment.userId?.[0] || 'U').toUpperCase()}
                  </div>
                  <span style={styles.userName}>
                    {appointment.userId || 'Unknown User'}
                  </span>
                </div>
                <button 
                  onClick={() => handleConnect(appointment.id)} 
                  style={styles.connectButton}
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
            
          />
          <button onClick={() => handleLeaveCall(appointmentId)} style={styles.leaveButton}>
            End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default StylistPage;