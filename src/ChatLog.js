import React from 'react';
import { ChatContext } from './App.js';
import './ChatLog.css'

function ChatLog() {
  const chatData = React.useContext(ChatContext);
  const [messages, setMessages] = React.useState([]);
  const bottom = React.useRef();

  React.useEffect(() => {
    bottom.current.scrollIntoView();
  }, [messages]);

  React.useEffect(() => {
    const messageAdded = (msg) => {
      setMessages(m => m.concat([msg]));
    };

    if (chatData.selectedChatroom) {
      chatData.selectedChatroom.getMessages().then(msgs => {
        setMessages(msgs.items);
      });
      chatData.selectedChatroom.on('messageAdded', messageAdded);
      return () => {
        chatData.selectedChatroom.off('messageAdded', messageAdded);
      };
    }
  }, [chatData.selectedChatroom]);

  return (
    <div id="chat-content">
      <div id="chat-log">
        {messages.map(msg =>
          <div key={msg.sid}><b>{msg.author}</b>: {msg.body}</div>
        )}
        <div ref={bottom} />
      </div>
    </div>
  );
}

export default ChatLog;
