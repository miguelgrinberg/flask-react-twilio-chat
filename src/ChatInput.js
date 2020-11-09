import React from 'react';
import { ChatContext } from './App.js';
import './ChatInput.css';

function ChatInput() {
  const chatData = React.useContext(ChatContext);
  const input = React.useRef();

  React.useEffect(() => {
    if (chatData.selectedChatroom) {
      input.current.focus();
    }
  }, [chatData.selectedChatroom, input]);

  const onSubmit = ev => {
    if (ev.key !== 'Enter') {
      return;
    }
    chatData.selectedChatroom.sendMessage(input.current.value);
    input.current.value = '';
  }

  return (
    <div id="chat-input">
      <div></div>
      <div>Say something:&nbsp;</div>
      <input type="text" ref={input} onKeyUp={onSubmit} />
    </div>
  )
}

export default ChatInput;
