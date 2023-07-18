
import { useEffect } from "react";
import { ProfileInterface } from "../Descriptions";
import { UrlData } from "../lib/SQueryClient";
import { MainStore } from "./MainStore";
import PageInfo from "./PageInfo";
import PageMessage from "./PageMessage";

function NavBar() {
    const { infoSize, selectedPage, focusedUser, setInfoSize, setSelectedPage } = MainStore()
    useEffect(()=>{
        console.log(2);
        
        if(focusedUser._id)setInfoSize(2)
    },[focusedUser])
    return (
        <div className="nav-bar" style={{ height: infoSize == 0 ? '0px' : infoSize == 1 ? '350px' : infoSize == 2 ? '100%' : '0px' }}>
            <div className="nav-top" style={{
                height: selectedPage == 1 ? '150px' : ''
            }}>
                <div className="bainner" style={focusedUser._id?{
                    backgroundImage: `url(${((focusedUser?.profile as any as ProfileInterface)?.banner[0] as any as UrlData)?.url})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    // height:'150px'
                }:{}}></div>
                <div className="profile" style={focusedUser._id?{
                    backgroundImage: `url(${((focusedUser?.profile as any as ProfileInterface)?.imgProfile[0]as any as UrlData)?.url})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    // top:'100px',
                    // width:'100px',
                    // height:'100px'
                }:{}}></div>
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
            <div className="user-name">{focusedUser?.name}</div>
            <div className="telephone">{focusedUser?.telephone}</div>
            <div className="onglet-pages">
                <div className={'onglet-info ' + (selectedPage == 0 ? 'active' : '')} onClick={() => {
                    setSelectedPage(0);
                }}>Client Info</div>
                <div className={'onglet-messenger ' + (selectedPage == 1 ? 'active' : '')} onClick={() => {
                    setSelectedPage(1);
                }}>Messenger</div>
                <div className={'onglet-setting ' + (selectedPage == 2 ? 'active' : '')} onClick={() => {
                    setSelectedPage(2)
                }}>Setting</div>
            </div>
            <div className="pages-ctn" style={{ display: infoSize > 1 ? 'flex' : 'none' }}>
                <PageInfo></PageInfo>
                <PageMessage></PageMessage>
                <div className="page-setting" style={{ display: selectedPage == 2 ? 'flex' : 'none' }}>

                </div>
            </div>

        </div>
    );
}

export default NavBar;