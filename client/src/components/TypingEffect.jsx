import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const TypingEffect = ({ text, components, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText(''); // Reset saat text berubah

    // === LOGIC SMART SPEED (BIAR GAK LAG) ===
    // Kalau teksnya panjang banget (> 200 karakter), kita "ngebut" ngetiknya
    // dengan nampilin 5 karakter sekaligus tiap interval.
    // Kalau pendek, pelan-pelan (1-2 karakter) biar estetik.
    const chunkSize = text.length > 200 ? 10 : 2; 
    const speed = text.length > 200 ? 10 : 15; // Interval dalam milidetik

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