import React from 'react';
import { motion } from 'framer-motion';

export const CowMascot: React.FC<{ mood?: 'happy' | 'alert' | 'sleepy', size?: number }> = ({ mood = 'happy', size = 120 }) => {
  return (
    <motion.div 
      initial={{ y: 5, rotate: -2 }}
      animate={{ y: [5, -5, 5], rotate: [-2, 2, -2] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center"
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Head Shape */}
        <path d="M160 100C160 144.183 133.137 180 100 180C66.8629 180 40 144.183 40 100C40 55.8172 66.8629 20 100 20C133.137 20 160 55.8172 160 100Z" fill="#F8FAFC" stroke="#334155" strokeWidth="4"/>
        
        {/* Ears */}
        <path d="M45 45C35 35 20 40 25 60C30 80 45 75 45 45Z" fill="#F8FAFC" stroke="#334155" strokeWidth="4"/>
        <path d="M155 45C165 35 180 40 175 60C170 80 155 75 155 45Z" fill="#F8FAFC" stroke="#334155" strokeWidth="4"/>
        
        {/* Spots */}
        <path d="M70 40C60 40 50 55 55 70C60 85 85 80 70 40Z" fill="#334155" />
        <path d="M130 130C145 130 150 150 140 160C130 170 115 155 130 130Z" fill="#334155" />
        
        {/* Eyes */}
        {mood === 'happy' && (
          <>
            <circle cx="75" cy="85" r="6" fill="#334155" />
            <circle cx="125" cy="85" r="6" fill="#334155" />
          </>
        )}
        {mood === 'alert' && (
          <>
            <circle cx="75" cy="85" r="8" fill="#334155" />
            <circle cx="125" cy="85" r="8" fill="#334155" />
            <circle cx="77" cy="83" r="3" fill="white" />
            <circle cx="127" cy="83" r="3" fill="white" />
          </>
        )}
        {mood === 'sleepy' && (
          <>
            <path d="M65 85Q75 95 85 85" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
            <path d="M115 85Q125 95 135 85" stroke="#334155" strokeWidth="4" strokeLinecap="round"/>
          </>
        )}

        {/* Muzzle */}
        <path d="M60 130C60 113.431 77.9086 100 100 100C122.091 100 140 113.431 140 130C140 146.569 122.091 160 100 160C77.9086 160 60 146.569 60 130Z" fill="#FED7AA" stroke="#334155" strokeWidth="3"/>
        
        {/* Nostrils */}
        <circle cx="85" cy="130" r="4" fill="#F97316" fillOpacity="0.3" />
        <circle cx="115" cy="130" r="4" fill="#F97316" fillOpacity="0.3" />

        {/* Mouth */}
        <path d="M85 145Q100 155 115 145" stroke="#F97316" strokeWidth="3" strokeLinecap="round" fill="none"/>
      </svg>
      
      {/* Decorative Blush */}
      <div className="absolute top-[55%] left-[25%] w-3 h-2 bg-pink-200 rounded-full blur-[1px]" />
      <div className="absolute top-[55%] right-[25%] w-3 h-2 bg-pink-200 rounded-full blur-[1px]" />
    </motion.div>
  );
};
