import { Provider, useSelector } from 'react-redux';
import './App.css';
import Main from './Main/Main';
import TopBar from './TopBar/TopBar';
import Auth from './Auth/Auth';
import { RooState } from './AppRedux';

function App() {
  const { openAuth } = useSelector((state: RooState) => state.auth)
  return (
    <div className="app ctn">

      <TopBar></TopBar>
      <Main></Main>
      {
        openAuth !== "none" ? <Auth></Auth> : null 
      }
    </div>
  );
}

export default App;
