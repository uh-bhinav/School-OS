// index.jsx (replace file contents with this)
import React, { useState, useEffect } from 'react';
import styles from './Login.module.css';
import logoUrl from './school-logo.png';
import { supabase } from './src/supabaseClient'; // path: adjust if your file structure is different

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');


  // useEffect(() => {
  //   // If user already logged in, redirect to dashboard
  //   (async () => {
  //     try {
  //       const { data } = await supabase.auth.getSession();
  //       if (data?.session) {
  //         window.location.href = '/dashboard';
  //       }
  //     } catch (err) {
  //       console.warn('Auth check failed', err);
      // }
    // })();
  // }, []);


  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const adminOrigin = import.meta.env.VITE_ADMIN_URL?.replace(/\/$/, '') || null;
        if (data?.session && adminOrigin) {
          // If we're already on the admin origin, do nothing.
          if (window.location.origin !== adminOrigin) {
            window.location.href = `${adminOrigin}/dashboard`;
        }
      }
    } catch (err) {
      console.warn('Auth check failed', err);
      }
    })();
  }, []);


  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      

      // // success
      // setMessage('Signed in — redirecting...');
      // // short delay so user can see message
      // setTimeout(() => window.location.href = '/dashboard', 500);


      // after successful sign-in
      setMessage('Signed in — redirecting...');
      const adminOrigin = import.meta.env.VITE_ADMIN_URL?.replace(/\/$/, '') || null;
      setTimeout(() => {
        if (adminOrigin && window.location.origin !== adminOrigin) {
        window.location.href = `${adminOrigin}/dashboard`;
        } else {
          // fallback: same-origin redirect
          window.location.href = '/dashboard';
        }
    }, 500);


    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e?.preventDefault();
    if (!email) return setError('Enter email first');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setMessage('Magic link sent. Check your email.');
    } catch (err) {
      setError(err?.message || 'Could not send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    if (!email || !password) return setError('Email and password required');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setMessage('Account created — check email to confirm.');
    } catch (err) {
      setError(err?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = () => {
    // Opens Supabase OAuth flow (ensure provider enabled in Supabase dashboard)
    supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLoginWithFacebook = () => {
    supabase.auth.signInWithOAuth({ provider: 'facebook' });
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
          Don’t have an account? <a href="#" className={styles.link} onClick={(e)=>{e.preventDefault(); setMessage('Contact admin to create account')}}>Contact admin</a>
        </p>

        <div className={styles.socialCol}>
          <button type="button" onClick={handleLoginWithGoogle} className={styles.socialBtn}>
            <span className={`${styles.socialIcon} ${styles.google}`} />
            Login with Google
          </button>
          <button type="button" onClick={handleLoginWithFacebook} className={styles.socialBtn}>
            <span className={`${styles.socialIcon} ${styles.facebook}`} />
            Login with Facebook
          </button>
        </div>

        <div className={styles.orRow}>
          <span className={styles.hr} />
          <span className={styles.orText}>Or</span>
          <span className={styles.hr} />
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <label className={styles.label} htmlFor="password">Password</label>
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
            <a href="#" className={styles.link}>Forgot Password ?</a>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
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
