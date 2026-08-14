import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const VerificationGateScreen: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogleAccount, user, loading } = useUser();

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  // If already authenticated and verified when visiting /verify screen
  useEffect(() => {
    if (!loading && user.isVerified) {
      if (user.hasCompletedSetup) {
        navigate('/catalog', { replace: true });
      } else {
        navigate('/setup', { replace: true });
      }
    }
  }, [loading, user, navigate]);

  const handleGoogleSignIn = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const profile = await signInWithGoogleAccount();
      setIsGranted(true);
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
      setTimeout(() => {
        if (profile && profile.hasCompletedSetup) {
          console.log('[VerificationGate] User recognized as existing, routing to /catalog');
          navigate('/catalog');
        } else {
          console.log('[VerificationGate] New user, routing to /setup');
          navigate('/setup');
        }
      }, 600);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      let msg = err.message || 'Authentication failed. Please try again.';
      if (msg.includes('PEC college email') || msg.includes('@pec.edu.in')) {
        msg = 'Please sign in with your PEC college email account (@pec.edu.in).';
      }
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#050505] text-[#e2e2e2] min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden select-none p-4">
      {/* Background Micro-illustration */}
      <div className="absolute bottom-6 -right-8 opacity-25 rotate-12 pointer-events-none w-56 h-56 sm:w-64 sm:h-64">
        <div className="w-full h-full flex items-center justify-center rounded-full bg-primary-container/10 blur-xl"></div>
        <span className="material-symbols-outlined text-9xl text-primary-container/40 absolute">local_drink</span>
      </div>

      {/* Floating background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary-container/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Main Content Canvas */}
      <main className="w-full max-w-md px-container-padding flex flex-col items-center justify-center z-10 py-8">
        {/* Brand / Identity */}
        <div className="mb-6 opacity-80">
          <h2 className="font-sans text-2xl font-extrabold text-primary-container neon-text-glow tracking-widest uppercase">
            RULESOFF
          </h2>
        </div>

        {/* Heading */}
        <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-center mb-3 text-on-surface leading-snug">
          PROVE YOU'RE ONE OF US.
        </h1>

        <p className="text-sm text-on-surface-variant/80 text-center mb-8 max-w-xs font-medium">
          Exclusive to PEC students. Sign in using your official PEC Google account (@pec.edu.in).
        </p>

        {/* Single Button Container */}
        <div className="w-full flex flex-col gap-4">
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="text-error text-xs font-semibold text-center px-4 bg-error-container/20 py-3 rounded-2xl border border-error/40 animate-fade-in flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary Action Button - Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || isGranted}
            className={`w-full font-sans text-sm font-bold rounded-full py-4 uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer ${
              isGranted
                ? 'bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]'
                : 'bg-white text-black hover:bg-gray-100 active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.2)]'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-black">refresh</span>
                <span>AUTHENTICATING...</span>
              </>
            ) : isGranted ? (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                <span>VERIFIED PEC STUDENT</span>
              </>
            ) : (
              <>
                {/* Google G Logo SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.26v3.15C3.25 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.23 0 10.06 0 12s.46 3.77 1.26 5.39l4.02-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.61l4.02 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>CONTINUE WITH GOOGLE</span>
              </>
            )}
          </button>

          {/* Supporting Text */}
          <p className="text-center text-[11px] text-on-surface-variant/50 mt-3 tracking-wider uppercase font-semibold">
            Only @pec.edu.in Google Workspace accounts allowed
          </p>
        </div>
      </main>
    </div>
  );
};
