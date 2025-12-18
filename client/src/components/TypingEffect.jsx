import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const TypingEffect = ({ text, components, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // Safety check - if text is undefined/null, do nothing
    if (!text) return;
    
    let index = 0;
    setDisplayedText(''); // Reset saat text berubah

    // === LOGIC SMART SPEED (OPTIMIZED FOR FASTER DISPLAY) ===
    // Increased chunk size and reduced delay for faster typing
    const chunkSize = text.length > 200 ? 20 : 5;  // 2x faster chunks
    const speed = text.length > 200 ? 5 : 8;  // Faster intervals (was 10/15ms)

    const interval = setInterval(() => {
      if (index >= text.length) {
        setDisplayedText(text); // Pastikan teks lengkap di akhir
        clearInterval(interval);
        if (onComplete) onComplete();
        return;
      }

      // Ambil potongan teks (Chunking)
      // Ini rahasia anti-lag nya: Render per blok, bukan per huruf
      const nextIndex = index + chunkSize;
      setDisplayedText(text.slice(0, nextIndex));
      index = nextIndex;
    }, speed);

    return () => clearInterval(interval);
  }, [text]); // Hapus dependency onComplete biar ga loop

  return (
    <div className="prose prose-invert max-w-none w-full break-words">
        <ReactMarkdown components={components}>
            {displayedText}
        </ReactMarkdown>
    </div>
  );
};

export default TypingEffect;