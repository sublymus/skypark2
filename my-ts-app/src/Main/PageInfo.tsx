import { MainStore } from "./MainStore";


function PageInfo() {
    const { infoSize, selectedPage, focusedUser, setInfoSize, setSelectedPage } = MainStore()
    // const { buildings, currentBuildingId, selectedPage, focusedUser } = useSelector((state: RooState) => state.main)
    // const building = buildings.find((b) => b.id == currentBuildingId);
    return (<></>
        // <div className="user-info" style={{ display: selectedPage === 0 ? 'flex' : 'none' }}>
        //     <div className='user-info-item'>
        //         <div className="label">Status</div>
        //         <div className="value">{focusedUser?.account.status}</div>
        //     </div>
        //     <div className='user-info-item'>
        //         <div className="label">Email</div>
        //         <div className="value">{focusedUser?.account.email}</div>
        //     </div>
        //     <div className='user-info-item'>
        //         <div className="label">Telephone</div>
        //         <div className="value">{focusedUser?.account.telephone}</div>
        //     </div>
        //     <div className='user-info-item'>
        //         <div className="label">Room</div>
        //         <div className="value">{focusedUser?.account.address.room}</div>
        //     </div>
        //     <div className='user-info-item'>
        //         <div className="label">Etage</div>
        //         <div className="value">{focusedUser?.account.address.etage}</div>
        //     </div>
        //     <div className='user-info-item'>
        //         <div className="label">City</div>
        //         <div className="value">{focusedUser?.account.address.city}</div>
        //     </div>
        //     <div className='user-info-item'>
        //         <div className="label">Padiezd</div>
        //         <div className="value">{focusedUser?.account.address.padiezd}</div>
        //     </div>
        //     <div className='user-info-item'>
        //         <div className="label">Building</div>
        //         <div className="value">{building?.name}</div>
        //     </div>
        // </div>
    );
}

export default PageInfo;
