import React, { useState, useEffect, useCallback, useRef } from "react";

interface TypewriterProps {
  text: string | string[];
  title?: string;
  freeze?: boolean;
  cursor?: boolean;
  freezeCursor?: boolean;
  className?: string;
  onComplete?: () => void;
}

const TypewriterComponent: React.FC<TypewriterProps> = ({
  text,
  title,
  freeze = false,
  cursor = true,
  freezeCursor = false,
  className = "",
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isTitleDisplayed, setIsTitleDisplayed] = useState(false);

  // Add refs to maintain state between renders
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const isSingleString = typeof text === "string";

  const typeNextCharacter = useCallback(
    (currentText: string, fullText: string, callback: () => void) => {
      if (currentText.length < fullText.length) {
        const nextChar = fullText[currentText.length];
        const delay = Math.random() * 40 + 40;

        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setDisplayText(currentText + nextChar);
        }, delay);
      } else {
        callback();
      }
    },
    []
  );

  useEffect(() => {
    const fullText =
      !isTitleDisplayed && title
        ? title
        : isSingleString
        ? (text as string)
        : (text as string[])[currentIndex];
    const delayAfterComplete = title && !isTitleDisplayed ? 3000 : 2000;

    const completeCallback = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (title && !isTitleDisplayed) {
          setIsTitleDisplayed(true);
          setDisplayText("");
        } else if (!freeze) {
          setDisplayText("");
          setCurrentIndex(
            (prevIndex) => (prevIndex + 1) % (text as string[]).length
          );
        }
      }, delayAfterComplete);
    };

    typeNextCharacter(displayText, fullText, completeCallback);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    displayText,
    text,
    currentIndex,
    title,
    isSingleString,
    typeNextCharacter,
    isTitleDisplayed,
    freeze,
  ]);

  useEffect(() => {
    if (
      cursor &&
      !(
        freezeCursor &&
        displayText.length ===
          (title
            ? title.length
            : isSingleString
            ? (text as string).length
            : (text as string[])[currentIndex].length)
      )
    ) {
      // Clear existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [
    cursor,
    freezeCursor,
    displayText,
    text,
    currentIndex,
    title,
    isSingleString,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <span className={`font-mono text-center ${className}`}>
      {displayText}
      {cursor && (
        <span
          className={`${
            showCursor ? "opacity-100" : "opacity-0"
          } transition-opacity duration-100`}
        >
          _
        </span>
      )}
    </span>
  );
};

export default React.memo(TypewriterComponent, (prevProps, nextProps) => {
  return (
    prevProps.text === nextProps.text &&
    prevProps.title === nextProps.title &&
    prevProps.freeze === nextProps.freeze &&
    prevProps.cursor === nextProps.cursor &&
    prevProps.freezeCursor === nextProps.freezeCursor &&
    prevProps.className === nextProps.className
  );
});
