
import './TopBar.css';

function TopBar() {

    return (
        <div className="top-bar">
            <div className='top-ctn'>
                <div className='menu'></div>
                <div className='logo'>SKYPARK</div>
                <div className='auth'>
                    <div className='not-connect'>
                        <div className='login-btn'>Login</div>
                        <div className='signup-btn'>Create account</div>
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
