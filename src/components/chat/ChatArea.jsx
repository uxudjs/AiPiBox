/**
 * 聊天区域主组件
 * 负责整合消息列表（MessageList）与输入区域（InputArea），构建对话界面的主体结构。
 */

import React from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';

const ChatArea = () => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <MessageList />
      <InputArea />
    </div>
  );
};

export default ChatArea;