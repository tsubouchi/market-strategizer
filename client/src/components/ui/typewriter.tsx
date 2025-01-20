import { useState, useEffect } from "react";

interface TypewriterProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
}

export function Typewriter({ content, speed = 50, onComplete }: TypewriterProps) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [content, currentIndex, speed, onComplete]);

  return <div className="whitespace-pre-wrap">{displayedContent}</div>;
}
