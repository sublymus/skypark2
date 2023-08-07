import './TopBar.css';
import { AuthStore } from '../Auth/AuthStore';
import { UserFormStore } from '../UserData/UserFormStore';
import { FileType, UrlData } from '../lib/SQueryClient';
import { AppStore } from '../AppStore';
import { useState } from 'react';

function TopBar() {
    const { setOpenAuth, openAuth, account2, profile, manager, fetchDisconnect } = AuthStore();
    const { HOST } = AppStore();
    const [authOption, setAuthOption] = useState(false);

    console.log({ id: manager?._id });

    const { openedForm, setOpenedForm } = UserFormStore()
    return (
        <div className={"top-bar " + (openAuth !== 'none' ? "blurry" : openedForm !== 'none' ? "blurry" : '')}>
            <div className='top-ctn'>
                <div className='menu' >

                </div>
                
                <div className='logo'>SKYPARK</div>
                <div className='top-auth' >
                    <div className='auth-option' style={{ display: authOption ? 'flex' : 'none' }}>
                        <div>Profile</div>
                        <div onClick={async () => {
                            fetchDisconnect();
                            setAuthOption(!authOption);
                        }}>Disconnect</div>
                    </div>
                    <div className='not-connect' style={{ display: manager?._id ? 'none' : 'flex' }}>
                        <div className='login-btn' onClick={async () => {
                            setOpenAuth('login');
                        }}>Login</div>
                        <div className='signup-btn' onClick={async () => {
                            setOpenAuth('signup');
                        }}>Create account</div>
                    </div>
                    <div className='connect' style={{ display: manager?._id ? 'flex' : 'none' }} onClick={async () => {
                        setAuthOption(!authOption);
                    }}>
                        <div className='name'>{account2?.name}</div>
                        <div className={'icon ' + (profile?.imgProfile?.[0] ? '' : "connect-icon")} style={profile?.imgProfile?.[0] ? {
                            backgroundImage: `url(${HOST + (profile?.imgProfile?.[0] as UrlData)?.url})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'
                        } : {}}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
