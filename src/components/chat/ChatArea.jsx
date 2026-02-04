import React from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';

/**
 * 聊天区域主组件
 * 整合消息列表和输入区域
 */
const ChatArea = () => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <MessageList />
      <InputArea />
    </div>
  );
};

export default ChatArea;
