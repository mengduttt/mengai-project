import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CodeCanvas = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied!', {
      icon: '📋',
      style: {
        borderRadius: '12px',
        background: 'rgba(0,0,0,0.95)',
        color: '#fff',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 w-full rounded-xl overflow-hidden border border-white/10 bg-[#0c0c0e] shadow-2xl group">
      <div className="flex justify-between items-center bg-black/60 backdrop-blur-sm px-4 py-2.5 border-b border-white/5">
        <span className="text-xs text-blue-400 font-mono font-bold uppercase tracking-wider">{language || 'text'}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Code</span>
            </>
          )}
        </motion.button>
      </div>

      <div className="overflow-x-auto w-full custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            backgroundColor: 'transparent',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
          wrapLines={false}
          showLineNumbers={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeCanvas;