import React from 'react';
import { ChatContext } from './App.js';

function LoginForm() {
  const chatData  = React.useContext(ChatContext);
  const userInput = React.useRef();
  const [error, setError] = React.useState(false);
  const login = (ev) => {
    if (ev.type === 'keyup' && ev.key !== 'Enter') {
      return;
    }
    setError(false);
    chatData.login(userInput.current.value).catch(() => setError(true));
  }
  const logout = () => chatData.logout();

  if (chatData.user.username === null) {
    return (
      <div id="login">
        <div>
          Username:&nbsp;
          <input type="text" ref={userInput} onKeyUp={login} autoFocus />
          &nbsp;
          <button onClick={login}>Login</button>
          {error && <>&nbsp;Login error, please try again.</>}
        </div>
      </div>
    );
  }
  else {
    return (
      <div id="login">
        <div>
          Username: <b>{ chatData.user.username }</b>&nbsp;
          <button onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }
}

export default LoginForm;
