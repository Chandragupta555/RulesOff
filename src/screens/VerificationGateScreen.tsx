import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const VerificationGateScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setVerifiedEmail, parseNameFromPecEmail, validatePecEmail, user } = useUser();

  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name || '');
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setErrorMsg('');

    // If PEC email pattern matches, parse and pre-fill name if user hasn't manually overridden it
    if (validatePecEmail(val)) {
      const extracted = parseNameFromPecEmail(val);
      if (extracted && (!isNameManuallyEdited || !name)) {
        setName(extracted);
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setIsNameManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!validatePecEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid PEC student email (e.g. name.bt21cse@pec.edu.in)');
      return;
    }

    const finalName = name.trim() || parseNameFromPecEmail(cleanEmail) || 'PEC Student';

    // Simulate haptic tap
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await setVerifiedEmail(cleanEmail, finalName);
      setIsGranted(true);
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]);
      }
      setTimeout(() => {
        navigate('/setup');
      }, 700);
    } catch (err: any) {
      console.error('Firebase authentication failed:', err);
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidFormat = validatePecEmail(email);

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
        <div className="mb-section-gap opacity-80">
          <h2 className="font-sans text-2xl font-extrabold text-primary-container neon-text-glow tracking-widest uppercase">
            RULESOFF
          </h2>
        </div>

        {/* Heading */}
        <h1 className="font-sans text-3xl sm:text-4xl font-extrabold text-center mb-6 text-on-surface leading-snug">
          PROVE YOU'RE ONE OF US.
        </h1>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-element-gap">
          {/* Email Input Field */}
          <div className="relative">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 mb-2 block pl-4">
              PEC College Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter PEC email (e.g. john.bt21ece@pec.edu.in)"
                className="w-full bg-[#1A1A1A]/60 border border-[#1F1F1F] rounded-full py-4 pl-12 pr-4 text-on-surface font-sans text-base placeholder:text-on-surface-variant/40 focus:outline-none input-glow transition-all duration-200 backdrop-blur-md"
              />
            </div>
            {isValidFormat && (
              <span className="absolute right-4 top-[38px] material-symbols-outlined text-green-500 text-xl animate-scale-in">
                check_circle
              </span>
            )}
          </div>

          {/* Name Field (Editable & Auto-parsed from Email) */}
          <div className="relative mt-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/80 mb-2 block pl-4">
              Your Name (Parsed & Editable)
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">
                badge
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="Your full name"
                className="w-full bg-[#1A1A1A]/60 border border-[#1F1F1F] rounded-full py-4 pl-12 pr-4 text-on-surface font-sans text-base placeholder:text-on-surface-variant/40 focus:outline-none input-glow transition-all duration-200 backdrop-blur-md"
              />
            </div>
            {isValidFormat && name && (
              <p className="text-[11px] text-primary/80 pl-4 mt-1.5 font-medium">
                ✓ Auto-extracted prefix. Confirm or edit above.
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <p className="text-error text-xs font-medium text-center mt-1 px-4 bg-error-container/20 py-2 rounded-xl border border-error/30">
              {errorMsg}
            </p>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting || isGranted}
            className={`w-full font-sans text-sm font-bold rounded-full py-4 uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer ${
              isGranted
                ? 'bg-green-500 text-white shadow-[0_4px_20px_rgba(34,197,94,0.4)]'
                : 'bg-primary-container text-black neon-glow hover:brightness-110 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                <span>VERIFYING...</span>
              </>
            ) : isGranted ? (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                <span>ACCESS GRANTED</span>
              </>
            ) : (
              <>
                <span>VERIFY & CONTINUE</span>
                <span className="material-symbols-outlined font-bold">arrow_forward</span>
              </>
            )}
          </button>

          {/* Supporting Text */}
          <p className="text-center text-xs text-on-surface-variant/60 mt-4 tracking-wide uppercase font-semibold">
            We only let PEC students in.
          </p>
        </form>
      </main>
    </div>
  );
};
