
import { useState } from 'react';
import './Main.css';
const _user = {
    id: '',
    account: {
        name: "baron",
        email: "sublymus@gmail.com",
        password: "azert",
        telephone: "12345678",
        status: "property",
        address: {
            location: "l:567455;h45678654",
            room: 45,
            padiezd: 5,
            etage: 4,
            description: "je suis ici",
            city: "Rostov on don",
        },
        profile: {
            imgProfile: 'https://source.unsplash.com/random/?Cryptocurrency&1',
            banner: 'https://source.unsplash.com/random/?Cryptocurrency&1',
            message: "*** BEST ****",
        }
    }
}
const buildings = [{
    id: '0',
    name: 'Sublymus E45',
    padiezd: 6,
    users: [_user]
}]

for (let i = 0; i < 5; i++) {
    buildings[i] = { ...buildings[0] };
    buildings[i].name = `Sublymus B${i * 5}`;
    buildings[i].id = `${i}`;
    for (let j = 0; j < 20; j++) {
        const u = buildings[i].users = [...buildings[i].users];
        u[j] = { ...u[0] };
        u[j].account = { ...u[j].account }
        u[j].id = i + '';
        u[j].account.name = `Baron B${buildings[i].id} I${j}`
    }
}

function Main() {
    const [currentBuildingId, setcurrentBuildingId] = useState('0');
    const [focusedUser, setFocusedUser] = useState<typeof _user>();

    const [infoSize, setInfoSize] = useState(2);
    const [selectedPage, setSelectedPage] = useState(0);

    const [filterPadiezd, setFilterPadiezd] = useState<string[]>([]);

    const building = buildings.find((b) => b.id == currentBuildingId);
    const padiezd: string[] = [];
    for (let i = 0; i < (building?.padiezd || 0); i++) {
        padiezd[i] = `padiezd ${i}`;
    }
    console.log(building);

    return (
        <div className="main">
            <div className="buildings">
                {buildings.map((data) =>
                    <div key={'building' + data.id} className={`building ${data.id === currentBuildingId ? ' active' : ''}`} data-id={data.id} onClick={(e) => setcurrentBuildingId(e.currentTarget.dataset.id || "0")}>{data.name}</div>
                )}
            </div>
            <div className="list-ctn">
                <div className="list-top">
                    <div className="building-name">{building?.name}</div>
                    <div className="filter-ctn">
                        <div className="filter ">{'Padiezd'} <span></span></div>
                        <div className="filter ">{'Name'}<span></span></div>
                        <div className="filter ">{'Date'}<span></span></div>
                    </div>
                </div>
                <div className="list-padiezds">
                    {padiezd.filter((p) => !filterPadiezd.includes(p)).map((p) => <div key={p} onClick={() => {
                        setFilterPadiezd([...filterPadiezd, p]);
                    }}>{p}<span></span></div>)}
                </div>
                <div className="list">
                    {building?.users.map(user => <div key={"id" + user.account.name} className="user-item" onClick={() => {
                        setFocusedUser(user);
                        setInfoSize(2);
                    }}>
                        <div className="img" style={{
                            backgroundImage: `url(${user.account.profile.imgProfile})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'
                        }}></div>
                        <div className="ctn-1">
                            <div className="name">{user.account.name}</div>
                            <div className="padiezd-num">{user.account.address.padiezd}</div>
                        </div>
                        <div className="ctn-2">
                            <div className="status">{user.account.status}</div>
                            <div className="telephone">{user.account.telephone}</div>
                        </div>
                        <div className="date">
                            {user.account.status}
                        </div>
                    </div>)}
                </div>
            </div>
            <div className="nav-bar" style={{ height: infoSize == 0 ? '0px' : infoSize == 1 ? '350px' : infoSize == 2 ? '100%' : '0px', transition: '200ms' }}>
                <div className="nav-top">
                    <div className="bainner" style={{
                        backgroundImage: `url(${focusedUser?.account.profile.banner})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
                    }}></div>
                    <div className="profile" style={{
                        backgroundImage: `url(${focusedUser?.account.profile.imgProfile})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover'
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
                <div className="user-name">{focusedUser?.account.name}</div>
                <div className="telephone">{focusedUser?.account.telephone}</div>
                <div className="onglet-pages">
                    <div className={'onglet-info ' + (selectedPage == 0 ? 'active' : '')} onClick={() => {
                        setSelectedPage(0);
                    }}>Client Info</div>
                    <div className={'onglet-messenger ' + (selectedPage == 1 ? 'active' : '')} onClick={() => {
                        setSelectedPage(1);
                    }}>Messenger</div>
                    <div className={'onglet-setting ' + (selectedPage == 2 ? 'active' : '')} onClick={() => {
                        setSelectedPage(2);
                    }}>Setting</div>
                </div>
                <div className="pages-ctn" style={{ display: infoSize > 1? 'flex' : 'none' }}>
                    <div className="user-info" style={{ display: selectedPage ==0 ? 'flex' : 'none' }}>
                        <div className='user-info-item'>
                            <div className="label">Status</div>
                            <div className="value">{focusedUser?.account.status}</div>
                        </div>
                        <div className='user-info-item'>
                            <div className="label">Email</div>
                            <div className="value">{focusedUser?.account.email}</div>
                        </div>
                        <div className='user-info-item'>
                            <div className="label">Telephone</div>
                            <div className="value">{focusedUser?.account.telephone}</div>
                        </div>
                        <div className='user-info-item'>
                            <div className="label">Telephone</div>
                            <div className="value">{focusedUser?.account.telephone}</div>
                        </div>
                        <div className='user-info-item'>
                            <div className="label">Telephone</div>
                            <div className="value">{focusedUser?.account.address.room}</div>
                        </div>
                        <div className='user-info-item'>
                            <div className="label">Etage</div>
                            <div className="value">{focusedUser?.account.address.etage}</div>
                        </div>
                        <div className='user-info-item'>
                            <div className="label">City</div>
                            <div className="value">{focusedUser?.account.address.city}</div>
                        </div>
                        <div className='user-info-item'>
                            <div className="label">Padiezd</div>
                            <div className="value">{focusedUser?.account.address.padiezd}</div>
                        </div>
                        <div className='user-info-item'>
                            <div className="label">Building</div>
                            <div className="value">{building?.name}</div>
                        </div>
                    </div>
                    <div className="page-messenger" style={{ display:  selectedPage ==1 ? 'flex' : 'none' }}>

                    </div>
                    <div className="page-setting" style={{ display:  selectedPage ==2 ? 'flex' : 'none' }}>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Main;
