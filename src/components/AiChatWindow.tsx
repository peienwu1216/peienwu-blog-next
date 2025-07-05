'use client';

import React, { useState, useEffect } from 'react';
import { useAiChat, type AiRole } from '@/hooks/useAiChat';
import ChatView from './ChatView';

// 定義元件的 Props
interface AiChatWindowProps {
  initialRole: AiRole;
  chatKey: string;
  onClose: () => void;
  onSwitchRole: (role: AiRole) => void;
  initialInputValue: string;
  onUnmount: (currentInput: string) => void;
  articleContent?: string;
  allowRoleSwitching?: boolean;
  startWithSummary?: boolean;
}

export default function AiChatWindow({ 
  initialRole, 
  chatKey,
  onClose,
  onSwitchRole,
  initialInputValue,
  onUnmount,
  articleContent, 
  allowRoleSwitching = true,
  startWithSummary = false
}: AiChatWindowProps) {
  // UI state
  const [isSwitchMenuOpen, setSwitchMenuOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isClearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [roleToSwitch, setRoleToSwitch] = useState<AiRole | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Chat logic from hook
  const chatState = useAiChat({
    initialRole,
    chatKey,
    initialInputValue,
    onUnmount,
    articleContent,
    startWithSummary,
  });

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);
  
  // Handlers
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSwitchRole = (role: AiRole) => {
    setRoleToSwitch(role);
    setConfirmModalOpen(true);
    setSwitchMenuOpen(false);
  };

  const confirmSwitch = () => {
    if (roleToSwitch) {
      onSwitchRole(roleToSwitch);
    }
    setConfirmModalOpen(false);
  };

  const handleClearChatWithModal = () => {
    chatState.handleClearChat();
    setClearConfirmOpen(false);
  };

  return (
    <ChatView
      // State from hook
      messages={chatState.messages}
      input={chatState.input}
      currentRole={chatState.currentRole}
      isLoading={chatState.isLoading}
      showSummaryButton={chatState.showSummaryButton}
      otherRole={chatState.otherRole}
      
      // UI state
      isVisible={isVisible}
      isSwitchMenuOpen={isSwitchMenuOpen}
      isConfirmModalOpen={isConfirmModalOpen}
      isClearConfirmOpen={isClearConfirmOpen}
      
      // Handlers from hook
      handleInputChange={chatState.handleInputChange}
      handleFormSubmit={chatState.handleFormSubmit}
      handleGenerateSummary={chatState.handleGenerateSummary}
      handleClearChat={handleClearChatWithModal}
      
      // UI handlers
      handleClose={handleClose}
      handleSwitchRole={handleSwitchRole}
      setSwitchMenuOpen={setSwitchMenuOpen}
      setConfirmModalOpen={setConfirmModalOpen}
      setClearConfirmOpen={setClearConfirmOpen}
      confirmSwitch={confirmSwitch}
      
      // Options
      allowRoleSwitching={allowRoleSwitching}
    />
  );
}

// Re-export the type for backward compatibility
export type { AiRole }; 