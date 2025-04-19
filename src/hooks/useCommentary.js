import { useState } from 'react';

export const useCommentary = () => {
  const [isCommentaryWindowOpen, setIsCommentaryWindowOpen] = useState(false);
  const [commentary, setCommentary] = useState('');

  const openCommentaryWindow = (initialContent = '') => {
    setCommentary(initialContent);
    setIsCommentaryWindowOpen(true);
  };

  const closeCommentaryWindow = () => {
    setIsCommentaryWindowOpen(false);
    setCommentary('');
  };

  const updateCommentary = (content) => {
    setCommentary(content);
  };

  return {
    isCommentaryWindowOpen,
    commentary,
    openCommentaryWindow,
    closeCommentaryWindow,
    updateCommentary
  };
};