import React from 'react';
import Conversations from '@twilio/conversations';
import LoginForm from './LoginForm.js';
import ChatRooms from './ChatRooms.js';
import ChatLog from './ChatLog.js';
import ChatInput from './ChatInput.js';
import './App.css';

export const ChatContext = React.createContext();

function App() {
  const [user, setUser] = React.useState({api: null, username: null, chatrooms: []});
  const [selectedChatroom, setSelectedChatroom] = React.useState(null);

  const chatData = {
    user: user,
    selectedChatroom: selectedChatroom,

    login: (_username) => {
      document.body.style.cursor = 'progress';
      return fetch('/login', {
        method: 'POST',
        body: JSON.stringify({username: _username})
      }).then(res => res.json()).then(data => {
        Conversations.create(data.token).then(client => {
          document.body.style.cursor = 'default';
          setUser({
            api: client,
            username: _username,
            chatrooms: data.chatrooms,
          });
        });
      }).catch((error) => {
        document.body.style.cursor = 'default';
        throw error;
      });
    },

    logout: () => {
      setUser({api: null, username: null, chatrooms: []});
      setSelectedChatroom(null);
    },

    selectChatroom: (sid) => {
      user.api.getConversationBySid(sid).then(conv => {
        setSelectedChatroom(conv);
      });  
    },
  }

  return (
    <div className="App">
      <h1>Twilio Conversations API Demo</h1>
      <ChatContext.Provider value={chatData}>
        <LoginForm />
        {chatData.user.username !== null &&
          <div id="chat">
            <ChatRooms />
            <ChatLog />
            <ChatInput />
          </div>
        }
      </ChatContext.Provider>
    </div>
  );
}

export default App;
