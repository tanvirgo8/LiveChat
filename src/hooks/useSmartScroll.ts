import { useRef, useState, useCallback } from 'react';

const BOTTOM_THRESHOLD_PX = 100;

export function useSmartScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState<boolean>(true);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState<boolean>(false);

  // Measure if viewport is within threshold of the bottom
  const checkIfNearBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    return distanceToBottom <= BOTTOM_THRESHOLD_PX;
  }, []);

  // Handle scroll events with performance optimization
  const handleScroll = useCallback(() => {
    const nearBottom = checkIfNearBottom();
    setIsNearBottom(nearBottom);

    // Automatically clear unread badge if user manually scrolls back to the bottom
    if (nearBottom) {
      setHasNewMessagesBelow(false);
    }
  }, [checkIfNearBottom]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    const container = containerRef.current;
    if (!container) return;

    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }

    setIsNearBottom(true);
    setHasNewMessagesBelow(false);
  }, []);

  // Called when a new message arrives (either via REST send ACK or Socket.IO message:new)
  const handleNewMessage = useCallback((isOwnMessage: boolean) => {
    const nearBottom = checkIfNearBottom();

    if (isOwnMessage || nearBottom) {
      // User sent the message OR user is already near bottom -> scroll to bottom
      scrollToBottom(true);
    } else {
      // User is scrolled up reading older history -> keep position & show badge
      setHasNewMessagesBelow(true);
    }
  }, [checkIfNearBottom, scrollToBottom]);

  // Reset scroll state (e.g. when changing conversations)
  const resetScroll = useCallback(() => {
    setIsNearBottom(true);
    setHasNewMessagesBelow(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  return {
    containerRef,
    isNearBottom,
    hasNewMessagesBelow,
    handleScroll,
    scrollToBottom,
    handleNewMessage,
    resetScroll,
  };
}
