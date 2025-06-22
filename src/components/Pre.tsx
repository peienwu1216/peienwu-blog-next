'use client';

import { useState, useRef } from 'react';

const Pre = ({ children }: { children: React.ReactNode }) => {
  const textInput = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    setCopied(true);
    if (textInput.current) {
        navigator.clipboard.writeText(textInput.current.textContent || '');
    }
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div ref={textInput} className="relative group">
        <pre>
            {children}
        </pre>
        <button
            aria-label="Copy to clipboard"
            onClick={onCopy}
            className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-slate-700/50 rounded-md text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
        >
            {copied ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M20 6 9 17l-5-5" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
            )}
        </button>
    </div>
  );
};

export default Pre; 