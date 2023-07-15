import './TopBar.css';
import { AuthStore } from '../Auth/AuthStore';
import { UserFormStore } from '../UserData/UserFormStore';

function TopBar() {
    const{setOpenAuth , openAuth , id , account}= AuthStore();
    const {openedForm , setOpenedForm} =UserFormStore()
    return (
        <div className={"top-bar "+(openAuth!=='none'?"blurry":openedForm!=='none'?"blurry":'')}>
            <div className='top-ctn'>
                <div className='menu'></div>
                <div className='logo'>SKYPARK</div>
                <div className='.top-auth '>
                    <div className='not-connect' style={{display:id?'none':'flex'}}>
                        <div className='login-btn' onClick={async() => {
                       setOpenAuth('login');
                    }}>Login</div>
                        <div className='signup-btn' onClick={async() => {
                       setOpenAuth('signup');
                    }}>Create account</div>
                    </div>
                    <div className='connect'style={{display:id?'flex':'none'}}>
                        <div className='name'>{account.name}</div>
                        <div className='icon'></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
