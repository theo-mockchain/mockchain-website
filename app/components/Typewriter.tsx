import React, { useState, useEffect, useCallback } from 'react';

interface TypewriterProps {
  text: string | string[];
  title?: string;
  freeze?: boolean;
  cursor?: boolean;
  freezeCursor?: boolean;
  className?: string;
  onComplete?: () => void;
}

const Typewriter: React.FC<TypewriterProps> = ({
  text,
  title,
  freeze = false,
  cursor = true,
  freezeCursor = false,
  className = '',
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isTitleDisplayed, setIsTitleDisplayed] = useState(false);
  const isSingleString = typeof text === 'string';

  const typeNextCharacter = useCallback((currentText: string, fullText: string, callback: () => void) => {
    if (currentText.length < fullText.length) {
      const nextChar = fullText[currentText.length];
      const delay = Math.random() * 40 + 40; // Random delay between 40ms and 80ms
      setTimeout(() => {
        setDisplayText(currentText + nextChar);
      }, delay);
    } else {
      callback();
    }
  }, []);

  useEffect(() => {
    const fullText = !isTitleDisplayed && title ? title : (isSingleString ? text as string : (text as string[])[currentIndex]);
    const delayAfterComplete = title && !isTitleDisplayed ? 3000 : 2000; // Longer delay for title

    typeNextCharacter(displayText, fullText, () => {
      if (title && !isTitleDisplayed) {
        setTimeout(() => {
          setIsTitleDisplayed(true);
          setDisplayText('');
        }, delayAfterComplete);
      } else {
        setTimeout(() => {
          setDisplayText('');
          setCurrentIndex((prevIndex) => (prevIndex + 1) % (text as string[]).length);
        }, delayAfterComplete);
      }
    });
  }, [displayText, text, currentIndex, title, isSingleString, typeNextCharacter, isTitleDisplayed]);

  useEffect(() => {
    if (cursor && !(freezeCursor && displayText.length === (title ? title.length : (isSingleString ? (text as string).length : (text as string[])[currentIndex].length)))) {
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);

      return () => clearInterval(cursorInterval);
    }
  }, [cursor, freezeCursor, displayText, text, currentIndex, title, isSingleString]);

  return (
    <span className={`font-mono text-center ${className}`}>
      {displayText}
      {cursor && <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>_</span>}
    </span>
  );
};

export default Typewriter;
