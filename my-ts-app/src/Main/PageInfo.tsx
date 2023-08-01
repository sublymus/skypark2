import { MainStore } from "./MainStore";


function PageInfo() {
    const { infoSize, selectedPage, focusedUser, setInfoSize, setSelectedPage } = MainStore()
      
    return (
        <div className="user-info" style={{ display: selectedPage === 0 ? 'flex' : 'none' }}>
            <div className='user-info-item'>
                <div className="label">Status</div>
                <div className="value">{focusedUser.status}</div>
            </div>
            <div className='user-info-item'>
                <div className="label">Email</div>
                <div className="value">{focusedUser.email}</div>
            </div>
            <div className='user-info-item'>
                <div className="label">Telephone</div>
                <div className="value">{focusedUser.telephone}</div>
            </div>
            <div className='user-info-item'>
                <div className="label">Room</div>
                <div className="value">{focusedUser.address.room}</div>
            </div>
            <div className='user-info-item'>
                <div className="label">Etage</div>
                <div className="value">{focusedUser.address.etage}</div>
            </div>
            <div className='user-info-item'>
                <div className="label">City</div>
                <div className="value">{focusedUser.address.city}</div>
            </div>
            <div className='user-info-item'>
                <div className="label">Padiezd</div>
                <div className="value">{focusedUser.address.padiezd}</div>
            </div>
            <div className='user-info-item'>
                <div className="label">Building</div>
                <div className="value">{focusedUser.address._id}</div>
            </div>
        </div>
    );
}

export default PageInfo;
