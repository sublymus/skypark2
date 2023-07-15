// import { RooState, RootDispatch } from "../AppStore";
// import { useSelector, useDispatch } from 'react-redux';
import PageInfo from "./PageInfo";
// import { setInfoSize, setSelectedPage } from "./MainStore";
import PageMessage from "./PageMessage";

function NavBar() {
    // const { infoSize, selectedPage, focusedUser } = useSelector((state: RooState) => state.main)
    // const dispatch: RootDispatch = useDispatch();
    return (<></>
        // <div className="nav-bar" style={{ height: infoSize == 0 ? '0px' : infoSize == 1 ? '350px' : infoSize == 2 ? '100%' : '0px' }}>
        //     <div className="nav-top" style={{
        //         height: selectedPage == 1 ? '150px' : ''
        //     }}>
        //         <div className="bainner" style={{
        //             backgroundImage: `url(${focusedUser?.account.profile.banner[0].url})`,
        //             backgroundRepeat: 'no-repeat',
        //             backgroundPosition: 'center',
        //             backgroundSize: 'cover',
        //             // height:'150px'
        //         }}></div>
        //         <div className="profile" style={{
        //             backgroundImage: `url(${focusedUser?.account.profile.imgProfile[0].url})`,
        //             backgroundRepeat: 'no-repeat',
        //             backgroundPosition: 'center',
        //             backgroundSize: 'cover',
        //             // top:'100px',
        //             // width:'100px',
        //             // height:'100px'
        //         }}></div>
        //         <div className="size">
        //             <div className="lower" onClick={() => {
        //                 const s = infoSize - 1;
        //                 dispatch(setInfoSize(s < 0 ? 0 : s));
        //             }}></div>
        //             <div className="large" onClick={() => {
        //                 const s = infoSize + 1;
        //                 dispatch(setInfoSize(s > 2 ? 2 : s));
        //             }}></div>
        //             <div className="close" onClick={() => {
        //                 const s = infoSize + 1;
        //                 dispatch(setInfoSize(0));
        //             }}></div>
        //         </div>
        //     </div>
        //     <div className="user-name">{focusedUser?.account.name}</div>
        //     <div className="telephone">{focusedUser?.account.telephone}</div>
        //     <div className="onglet-pages">
        //         <div className={'onglet-info ' + (selectedPage == 0 ? 'active' : '')} onClick={() => {
        //             dispatch(setSelectedPage(0));
        //         }}>Client Info</div>
        //         <div className={'onglet-messenger ' + (selectedPage == 1 ? 'active' : '')} onClick={() => {
        //             dispatch(setSelectedPage(1));
        //         }}>Messenger</div>
        //         <div className={'onglet-setting ' + (selectedPage == 2 ? 'active' : '')} onClick={() => {
        //             dispatch(setSelectedPage(2));
        //         }}>Setting</div>
        //     </div>
        //     <div className="pages-ctn" style={{ display: infoSize > 1 ? 'flex' : 'none' }}>
        //         <PageInfo></PageInfo>
        //         <PageMessage></PageMessage>
        //         <div className="page-setting" style={{ display: selectedPage == 2 ? 'flex' : 'none' }}>

        //         </div>
        //     </div>

        // </div>
    );
}

export default NavBar;