import React, { useState } from 'react';
import { Copy, Check, ThumbsUp, ThumbsDown, Lightbulb, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied!', {
      icon: '📋',
      style: {
        borderRadius: '12px',
        background: 'rgba(0,0,0,0.9)',
        color: '#fff',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 group relative rounded-xl overflow-hidden border border-white/10 bg-[#0c0c0e]">
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">{language}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </motion.button>
      </div>
      <pre className="p-4 overflow-x-auto custom-scrollbar">
        <code className="text-sm text-gray-300 font-mono">{code}</code>
      </pre>
    </div>
  );
};

const MessageReactions = ({ onReact }) => {
  const reactions = [
    { icon: <ThumbsUp size={14} />, label: 'helpful', emoji: '👍' },
    { icon: <ThumbsDown size={14} />, label: 'not-helpful', emoji: '👎' },
    { icon: <Lightbulb size={14} />, label: 'insightful', emoji: '💡' },
    { icon: <Flame size={14} />, label: 'amazing', emoji: '🔥' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex gap-1 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-lg border border-white/5"
    >
      {reactions.map((reaction) => (
        <motion.button
          key={reaction.label}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            onReact(reaction.label);
            toast.success(`Reacted with ${reaction.emoji}`, {
              icon: reaction.emoji,
              duration: 1500,
              style: {
                borderRadius: '12px',
                background: 'rgba(0,0,0,0.9)',
                color: '#fff'
              }
            });
          }}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
          title={reaction.label}
        >
          {reaction.icon}
        </motion.button>
      ))}
    </motion.div>
  );
};

export { CodeBlock, MessageReactions };
