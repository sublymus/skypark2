import { Provider, useSelector } from 'react-redux';
import './App.css';
import Main from './Main/Main';
import TopBar from './TopBar/TopBar';
import Auth from './Auth/Auth';
// import { RooState } from './AppStore';
import { AuthStore } from './Auth/AuthStore';
import UserForm from './UserData/UserForm';
import { UserFormStore } from './UserData/UserFormStore';

function App() {
  const { openAuth } = AuthStore();
  const {openedForm}= UserFormStore()
  return (
    <div className="app ctn">

      <TopBar></TopBar>
      <Main></Main>
      {
        openAuth !== "none" ? <Auth></Auth> : null 
      }
      {
        openedForm !== "none" ? <UserForm></UserForm> : null 
      }
    </div>
  );
}

export default App;
