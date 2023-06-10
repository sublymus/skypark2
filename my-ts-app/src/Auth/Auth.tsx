
import { useDispatch, useSelector } from 'react-redux';
import { RooState, RootDispatch } from '../AppRedux';
import './Auth.css';
import { fetchLoginManager, setOpenAuth } from './AuthRedux';
import { useState } from 'react';

function Auth() {
    const dispatch: RootDispatch = useDispatch();
    const { openAuth } = useSelector((state: RooState) => state.auth);
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('');;
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    return (
        <div className="auth" onClick={(e) => {
            if ((e.target as HTMLElement).className == 'auth') dispatch(setOpenAuth('none'));
        }}>
            <div className="auth-ctn">
                <div className="close" onClick={() => {
                    dispatch(setOpenAuth('none'))
                }}></div>
                <div className="image">
                </div>
                <div className="form">
                    <h1 className="auth-title">{openAuth == 'login' ? "Sign In" : 'Create account'}</h1>
                    <h5 className="auth-prompt">{openAuth == 'login' ? 'Create account for another manager' : 'Connect you account?'} <span onClick={() => {
                        dispatch(setOpenAuth(openAuth == 'login' ? 'signup' : 'login'))
                    }}>{openAuth == 'login' ? 'Create here' : 'Login here'}</span></h5>
                    <div className="google" style={{ display: openAuth == 'login' ? 'flex' : 'none' }}>
                        <div className="icon"></div>
                        <div className="label">Connexion</div>
                    </div>
                    <div className="separator" >{openAuth == 'login' ? 'OR' : ''}</div>
                    <div className="name-ctn" style={{ display: openAuth == 'login' ? 'none' : 'flex' }}>
                        <input placeholder='First Name' className="auth-name" value={name} onChange={(e) => {
                            setName(e.currentTarget.value);
                        }}></input>
                        <input placeholder='Last Name' className="auth-last-name" value={lastName} onChange={(e) => {
                            setLastName(e.currentTarget.value);
                        }}></input>
                    </div>
                    <input placeholder='Email' className="auth-email" value={email} onChange={(e) => {
                        setEmail(e.currentTarget.value);
                    }}></input>
                    <input placeholder='Password' className="auth-password" style={{ display: openAuth == 'login' ? 'flex' : 'none' }} value={pass} onChange={(e) => {
                        setPass(e.currentTarget.value);
                    }}></input>
                    <h5 className="auth-forget" style={{ display: openAuth == 'login' ? 'flex' : 'none' }}>Forgot Password?</h5>
                    <div className="auth-submit" onClick={() => {
                        dispatch(fetchLoginManager({
                            email: email,
                            password: pass
                        }))
                    }}>{openAuth == 'login' ? "Sign In" : "Sign Up"}</div>
                </div>
            </div>
        </div>
    );
}

export default Auth;