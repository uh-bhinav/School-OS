// index.jsx
import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import logoUrl from './school-logo.png';
import { supabase } from './src/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sessionExists, setSessionExists] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const ADMIN_ORIGIN = (import.meta.env.VITE_ADMIN_URL || '').replace(/\/$/, '') || null;

  useEffect(() => {
    // Check whether a valid session exists but DO NOT auto-redirect.
    // If session exists, show a "Continue to dashboard" button so user can choose to go.
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSessionExists(Boolean(data?.session));
      } catch (err) {
        console.warn('Session check failed', err);
        setSessionExists(false);
      } finally {
        if (mounted) setIsCheckingSession(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const gotoDashboard = () => {
    // safe redirect helper
    if (ADMIN_ORIGIN && window.location.origin !== ADMIN_ORIGIN) {
      window.location.href = `${ADMIN_ORIGIN}/dashboard`;
    } else {
      window.location.href = '/dashboard';
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      // supabase returns { data, error } or throws; handle both
      if (res.error) throw res.error;
      // success - redirect only now
      setMessage('Signed in — redirecting...');
      setTimeout(gotoDashboard, 400);
    } catch (err) {
      const msg = err?.message || (err?.error_description ?? 'Login failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.gradientBg}>
        <div className={`${styles.blob} ${styles.blobPink}`} />
        <div className={`${styles.blob} ${styles.blobOrange}`} />
        <div className={`${styles.blob} ${styles.blobBlue}`} />
      </div>

      <div className={styles.brandTop}>
        {logoUrl ? (
          <img src={logoUrl} alt="School OS logo" className={styles.logo} />
        ) : (
          <div className={styles.logoFallback} aria-label="Logo" />
        )}
        <span className={styles.brandText}>School OS</span>
      </div>

      <main className={styles.cardWrap}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.subtext}>
          Don’t have an account?{' '}
          <a
            href="#"
            className={styles.link}
            onClick={(e) => {
              e.preventDefault();
              setMessage('Contact admin to create account');
            }}
          >
            Contact admin
          </a>
        </p>

        {/* If session check running, show small spinner/message */}
        {isCheckingSession ? (
          <div style={{ marginBottom: 12 }}>Checking session…</div>
        ) : sessionExists ? (
          <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            
            

          </div>
        ) : null}

        <div className={styles.orRow}>
          <span className={styles.hr} />
          <span className={styles.orText}>Or</span>
          <span className={styles.hr} />
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isCheckingSession}
          />

          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isCheckingSession}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={styles.eyeBtn}
              onClick={() => setShowPassword((s) => !s)}
            />
          </div>

          <div className={styles.rowBetween}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <a href="#" className={styles.link}>
              Forgot Password ?
            </a>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={loading || isCheckingSession}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className={styles.terms}>
          By continuing you agree to: <a href="#" className={styles.link}>Terms & Conditions</a>
        </p>
      </main>
    </div>
  );
}
