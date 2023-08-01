
import { useEffect } from "react";
import { ProfileInterface } from "../Descriptions";
import { UrlData } from "../lib/SQueryClient";
import { MainStore } from "./MainStore";
import PageInfo from "./PageInfo";
import PageMessage from "./PageMessage";
import { AuthStore } from "../Auth/AuthStore";

function NavBar() {
    const { infoSize, selectedPage, focusedUser, setInfoSize, setSelectedPage  } = MainStore();
    const { fetchDiscussion , currentChannel } = MainStore();
    useEffect(()=>{
        console.log('$$$$$$$$$$$$$$');
         
        if(focusedUser._id){
            setInfoSize(2);
            fetchDiscussion(focusedUser._id);
        }
    },[focusedUser]);

    console.log('currentChannel' , currentChannel);
    
    return (
        <div className="nav-bar" style={{ height: infoSize == 0 ? '0px' : infoSize == 1 ? '350px' : infoSize == 2 ? '100%' : '0px' }}>
            <div className="nav-top" style={{
                //height: selectedPage == 1 ? '150px' : ''
            }}>
                <div className="bainner" style={{
                    backgroundImage: `url(${((focusedUser?.profile)?.banner[0] as UrlData)?.url??'https://img.freepik.com/photos-gratuite/belle-photo-foret-automne-coloree-pleine-differents-types-plantes_181624-12425.jpg?w=1380&t=st=1689836953~exp=1689837553~hmac=b8518ad5265adc17fcb8ef965fe30b429822eb18c7ed3b220edb2cbbdcfe3af8'})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                }}></div>
                <div className={"profile"} style={{
                    backgroundImage: `url(${((focusedUser?.profile)?.imgProfile[0]as UrlData)?.url??'https://cdn-icons-png.flaticon.com/512/3177/3177440.png'})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                }}></div>
                <div className="size">
                    <div className="lower" onClick={() => {
                        const s = infoSize - 1;
                        setInfoSize(s < 0 ? 0 : s);
                    }}></div>
                    <div className="large" onClick={() => {
                        const s = infoSize + 1;
                       setInfoSize(s > 2 ? 2 : s);
                    }}></div>
                    <div className="close" onClick={() => {
                        const s = infoSize + 1;
                        setInfoSize(0);
                    }}></div>
                </div>
            </div>
            <div className="user-name">{focusedUser.name}</div>
            <div className="telephone">{focusedUser.telephone}</div>
            <div className="onglet-pages">
                <div className={'onglet-info ' + (selectedPage == 0 ? 'active' : '')} onClick={() => {
                    setSelectedPage(0);
                    setInfoSize(2);
                }}>Client Info</div>
                <div className={'onglet-messenger ' + (selectedPage == 1 ? 'active' : '')} onClick={() => {
                    setSelectedPage(1);
                    setInfoSize(2);
                }}>Messenger</div>
                <div className={'onglet-setting ' + (selectedPage == 2 ? 'active' : '')} onClick={() => {
                    setSelectedPage(2);
                    setInfoSize(2);
                }}>Setting</div>
            </div>
            <div className="pages-ctn" style={{ display: infoSize > 1 ? 'flex' : 'none' }}>
                {selectedPage == 0 ? <PageInfo></PageInfo> : null}
                {selectedPage == 1 ? <PageMessage></PageMessage>:null}
                <div className="page-setting" style={{ display: selectedPage == 2 ? 'flex' : 'none' }}>

                </div>
            </div>

        </div>
    );
}

export default NavBar;