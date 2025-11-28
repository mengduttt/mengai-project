import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const CodeCanvas = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied!', {
        style: { background: '#333', color: '#fff' }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 w-full rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e] shadow-lg">
      {/* Header Code Block */}
      <div className="flex justify-between items-center bg-[#252526] px-4 py-2 border-b border-gray-700">
        <span className="text-xs text-blue-400 font-mono font-bold uppercase">{language || 'text'}</span>
        <button 
            onClick={handleCopy} 
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
        >
            {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Area Codingan (YANG TADI MELEDDAK) */}
      <div className="overflow-x-auto w-full">
        <SyntaxHighlighter 
            language={language} 
            style={vscDarkPlus} 
            customStyle={{ 
                margin: 0, 
                padding: '1.5rem', 
                backgroundColor: 'transparent', // Biar ngikut parent
                fontSize: '14px',
                lineHeight: '1.5',
            }}
            wrapLines={false} // Biar scroll ke samping, lebih rapi buat kodingan
            showLineNumbers={true}
        >
            {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeCanvas;