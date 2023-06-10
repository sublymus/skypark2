
import { useDispatch, useSelector } from 'react-redux';
import { RooState, RootDispatch } from '../AppRedux';
import './TopBar.css';
import { setOpenAuth } from '../Auth/AuthRedux';

function TopBar() {
    const dispatch: RootDispatch = useDispatch();
    const {openAuth} = useSelector((state:RooState)=>state.auth)
    return (
        <div className={"top-bar "+(openAuth!=='none'?"blurry":'')}>
            <div className='top-ctn'>
                <div className='menu'></div>
                <div className='logo'>SKYPARK</div>
                <div className='.top-auth '>
                    <div className='not-connect'>
                        <div className='login-btn' onClick={() => {
                       dispatch(setOpenAuth('login'));
                    }}>Login</div>
                        <div className='signup-btn' onClick={() => {
                       dispatch(setOpenAuth('signup'));
                    }}>Create account</div>
                    </div>
                    <div className='connect'>
                        <div className='icon'></div>
                        <div className='name'></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TopBar;
