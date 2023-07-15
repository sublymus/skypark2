
import { useSelector,useDispatch } from 'react-redux';
import './Main.css';
import NavBar from './NavBar';
// import { RooState, RootDispatch } from '../AppStore';
// import { setFilterPadiezd, setFocusedUser, setInfoSize, setcurrentBuildingId } from './MainStore';
import { AuthStore } from '../Auth/AuthStore';
import { UserFormStore } from '../UserData/UserFormStore';


function Main() {
    // const {currentBuildingId , buildings , filterPadiezd} = useSelector((state:RooState)=>state.main)
    const {openAuth} =AuthStore()
    const {openedForm , setOpenedForm} =UserFormStore()
    // const dispatch: RootDispatch = useDispatch();
    // const building = buildings.find((b) => b.id == currentBuildingId);
    // const padiezd: string[] = [];
    // for (let i = 0; i < (building?.padiezd || 0); i++) {
    //     padiezd[i] = `padiezd ${i}`;
    // }
    // console.log(building);

    return (
        <div className={"main "+(openAuth!=='none'?"blurry":openedForm!=='none'?"blurry":'')}>
            <div className="buildings">
                {/* {buildings.map((data) =>
                    <div key={'building' + data.id} className={`building ${data.id === currentBuildingId ? ' active' : ''}`} data-id={data.id} onClick={(e) => dispatch(setcurrentBuildingId(e.currentTarget.dataset.id || "0"))}>{data.name}</div>
                )} */}
            </div>
            <div className="list-ctn">
                <div className="list-top">
                    {/* <div className="building-name">{building?.name}</div> */}
                    <div className="add-user"onClick={() => {
                        setOpenedForm('create-user');
                    }}>Add USer</div>
                    <div className="filter-ctn">
                        <div className="filter ">{'Padiezd'} <span></span></div>
                        <div className="filter ">{'Name'}<span></span></div>
                        <div className="filter ">{'Date'}<span></span></div>
                    </div>
                </div>
                <div className="list-padiezds">
                    {/* {padiezd.filter((p) => !filterPadiezd.includes(p)).map((p) => <div key={p} onClick={() => {
                       dispatch(setFilterPadiezd([...filterPadiezd, p]));
                    }}>{p}<span></span></div>)} */}
                </div>
                <div className="list">
                    {/* {building?.users.map(user => <div key={"id" + user.account.name} className="user-item" onClick={() => {
                        dispatch(setFocusedUser(user));
                        dispatch(setInfoSize(2));
                    }}> */}
                        <div className="img" style={{
                            // backgroundImage: `url(${user.account.profile.imgProfile})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'
                        }}></div>
                        <div className="ctn-1">
                            {/* <div className="name">{user.account.name}</div> */}
                            {/* <div className="padiezd-num">{user.account.address.padiezd}</div> */}
                        </div>
                        <div className="ctn-2">
                            {/* <div className="status">{user.account.status}</div>
                            <div className="telephone">{user.account.telephone}</div> */}
                        </div>
                        <div className="date">
                            {/* {user.account.status} */}
                        </div>
                    {/* </div>)} */}
                </div>
                <NavBar ></NavBar>
            </div>
            
        </div>
    );
}

export default Main;
