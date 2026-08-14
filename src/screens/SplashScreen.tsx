import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      if (user.hasCompletedSetup) {
        navigate('/catalog');
      } else if (user.isVerified) {
        navigate('/setup');
      } else {
        navigate('/verify');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigate, user]);

  const handleTap = () => {
    if (user.hasCompletedSetup) {
      navigate('/catalog');
    } else if (user.isVerified) {
      navigate('/setup');
    } else {
      navigate('/verify');
    }
  };

  return (
    <div
      onClick={handleTap}
      className="bg-[#050505] text-on-surface h-screen w-screen overflow-hidden flex flex-col items-center justify-center relative select-none cursor-pointer"
    >
      {/* Ambient particles / glowing backdrop elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating Noodle Packet Line Art */}
        <div
          className="absolute top-1/4 left-1/6 opacity-15 floating-item w-36 h-36 border border-primary-container/20 rounded-2xl flex items-center justify-center p-4 bg-primary-container/5 backdrop-blur-sm"
          style={{ transform: 'rotate(-12deg)' }}
        >
          <span className="material-symbols-outlined text-6xl text-primary-container/60">ramen_dining</span>
        </div>

        {/* Floating Chips Bag Line Art */}
        <div
          className="absolute bottom-1/4 right-1/6 opacity-15 floating-item-delayed w-40 h-40 border border-primary-container/20 rounded-2xl flex items-center justify-center p-4 bg-primary-container/5 backdrop-blur-sm"
          style={{ transform: 'rotate(15deg)' }}
        >
          <span className="material-symbols-outlined text-6xl text-primary-container/60">local_pizza</span>
        </div>

        {/* Soft Glowing Radial Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-container/10 blur-[100px] rounded-full pointer-events-none"></div>
      </div>

      {/* Main Content Canvas */}
      <div className="z-10 flex flex-col items-center justify-center text-center px-container-padding">
        {/* Wordmark */}
        <h1
          className={`font-sans text-4xl sm:text-5xl font-extrabold text-primary-container neon-text-glow uppercase tracking-widest mb-element-gap transition-all duration-1000 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          RULESOFF
        </h1>

        {/* Tagline */}
        <p
          className={`font-sans text-lg text-on-surface-variant opacity-80 tracking-wide transition-all duration-1000 delay-300 ${
            mounted ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Gate's shut. We're open.
        </p>

        {/* Micro Tap Prompt */}
        <span className="mt-12 text-xs font-semibold text-primary/40 uppercase tracking-widest animate-pulse">
          Tap anywhere to enter
        </span>
      </div>
    </div>
  );
};
