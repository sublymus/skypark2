import { useEffect, useState } from "react";
import { MainStore } from "./MainStore";
import { AppStore } from "../AppStore";
import { AuthStore } from "../Auth/AuthStore";
import { UrlData } from "../lib/SQueryClient";


function PageMessage() {
    const { focusedUser , sendMessage , currentChannel } = MainStore();
    const { messenger , manager , account2 , profile  , } = AuthStore();
    const { HOST } = AppStore();
    const [value, setValue] = useState('');
    
    return (
        <div className="page-messenger" style={{ display: /*selectedPage */  1 ? 'flex' : 'none' }}>
            <div className="messages">
                {currentChannel?.items.map((m, i) =>( <div key={m._id} className={'message ' + (m.account == manager.account ? 'right' : 'left')}>
                        <div className="icon" style={{
                            backgroundImage: `url(${m.account == manager.account ? ((HOST+(profile?.imgProfile?.[0] as UrlData)?.url)??'https://icons.veryicon.com/png/o/miscellaneous/two-color-icon-library/user-286.png'):(HOST+focusedUser.profile.imgProfile[0])?? 'https://t3.ftcdn.net/jpg/03/94/89/90/360_F_394899054_4TMgw6eiMYUfozaZU3Kgr5e0LdH4ZrsU.jpg'})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'  
                        }}></div>
                        <div className="text">{m.text}</div>
                    </div>))} 
            </div>
            <div className="writer">
                <textarea name="textarea" cols={30} rows={4} value={value} onChange={(e) => {
                    setValue(e.currentTarget.value);
                }}></textarea>
                <div className="icon" onClick={(e) => {
                    sendMessage({
                        value: value,
                        focusedUser
                    });
                    setValue('')
                }}></div>
            </div>
        </div>
    );
}

export default PageMessage;
