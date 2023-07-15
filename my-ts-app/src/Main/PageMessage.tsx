
// import { RooState, RootDispatch } from "../AppStore";
import profile from '../img/building.png'
import { useSelector, useDispatch } from 'react-redux';
// import { sendMessage, setInfoSize, setSelectedPage } from "./MainStore";
import { useState } from "react";


function PageMessage() {
    // const { buildings, currentBuildingId, selectedPage, focusedUser } = useSelector((state: RooState) => state.main)
    // const building = buildings.find((b) => b.id == currentBuildingId);
    // const dispatch: RootDispatch = useDispatch();
    const [value, setValue] = useState('');
    return (
        <div className="page-messenger" style={{ display: /*selectedPage */  1 ? 'flex' : 'none' }}>
            <div className="messages">
                {/* {focusedUser.messenger.discussions.map((d, i) =>
                    <div key={i + (focusedUser?.account.name || '')} className={'message ' + (d.left ? 'left' : 'right')}>
                        <div className="icon" style={{
                            backgroundImage: `url(${d.left?focusedUser?.account.profile.imgProfile[0].url:profile})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'
                        }}></div>
                        <div className="text">{d.text}</div>
                    </div>)} */}
            </div>{
                // building?.id
            }
            <div className="writer">
                <textarea name="textarea" cols={30} rows={4} value={value} onChange={(e) => {
                    setValue(e.currentTarget.value);
                }}></textarea>
                <div className="icon" onClick={(e) => {
                    // dispatch(sendMessage({
                    //     value: value,
                    //     focusedUser,
                    //     currentBuildingId,
                    //     building,
                    // }));
                    setValue('')
                }}></div>
            </div>
        </div>
    );
}

export default PageMessage;
