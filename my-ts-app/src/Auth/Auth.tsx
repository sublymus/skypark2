
import './Auth.css';
import { useState } from 'react';
import { AuthStore } from './AuthStore';

function Auth() {
    const { openAuth ,setOpenAuth , fetchLoginManager} = AuthStore()
    const [name, setName] = useState('')
    const [lastName, setLastName] = useState('');;
    const [email, setEmail] = useState('m1@gmail.com');
    const [pass, setPass] = useState('m1');
    return (
        <div className="auth" onClick={(e) => {
           if ((e.target as HTMLElement).className == 'auth') setOpenAuth('none');
        }}>
            <div className="auth-ctn">
                <div className="close" onClick={() => {
                   setOpenAuth('none')
                }}></div>
                <div className="image">
                </div>
                <div className="form">
                    <h1 className="auth-title">{openAuth == 'login' ? "Sign In" : 'Create account'}</h1>
                    <h5 className="auth-prompt">{openAuth == 'login' ? 'Create account for another manager' : 'Connect you account?'} <span onClick={() => {
                       setOpenAuth(openAuth == 'login' ? 'signup' : 'login')
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
                        fetchLoginManager({
                            email: email,
                            password: pass
                        })
                        setOpenAuth('none');
                    }}>{openAuth == 'login' ? "Sign In" : "Sign Up"}</div>
                </div>
            </div>
        </div>
    );
}

export default Auth;