
import { RooState, RootDispatch } from "../AppRedux";
import { useSelector, useDispatch } from 'react-redux';
import { setInfoSize, setSelectedPage } from "./MainRedux";


function PageMessage() {
    const { buildings, currentBuildingId, selectedPage, focusedUser } = useSelector((state: RooState) => state.main)
    const building = buildings.find((b) => b.id == currentBuildingId);
    return (
        <div className="page-messenger" style={{ display: selectedPage === 1 ? 'flex' : 'none' }}>
            <div className="messages">
                {focusedUser.messenger.discussions.map((d, i) => <div key={i + (focusedUser?.account.name || '')} className={'message ' + (d.left ? 'left' : 'right')}>
                    <div className="icon" style={{
                        backgroundImage: `url(${focusedUser?.account.profile.imgProfile})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}></div>
                    <div className="text">{d.text}</div>
                </div>)}
            </div>
            <div className="writer">
                <textarea name="textarea" cols={30} rows={4}></textarea>
                <div className="icon"></div>
            </div>
        </div>
    );
}

export default PageMessage;
