
import { useSelector, useDispatch } from 'react-redux';
import './Main.css';
import NavBar from './NavBar';
import { AuthStore } from '../Auth/AuthStore';
import { UserFormStore } from '../UserData/UserFormStore';
import { AppStore } from '../AppStore';
import { useEffect, useState } from 'react';
import { AccountInterface, AddressInterface, ProfileInterface, UserInterface } from '../Descriptions';
import { UrlData } from '../lib/SQueryClient';
import { MainStore } from './MainStore';


function Main() {

    const { openAuth } = AuthStore();
    const { openedForm, setOpenedForm } = UserFormStore();
    const { entreprise } = AuthStore();
    const { entreprise: entrepriseI, quarters, userList, padiezdList, buildingList, HOST } = AppStore();
    const { fetchEntreprise, fetchPadiezd, fetchBuilding, fetchUser } = AppStore();
    if (entreprise._id && !entrepriseI._id) fetchEntreprise(entreprise._id)

    const [currentQuarterId, setcurrentBuildingId] = useState('');
    const [deselectedPadiezd, setSeselectedPadiezd] = useState<string[]>([]);
    const [deselectedPBuilding, setSeselectedBuilding] = useState<string[]>([]);
    const [filtre, setFiltre] = useState<'Padiezd' | 'Building'>('Building');
    const [isFiltreOpen, setFiltreOpen] = useState(false);
    const [sort, setSort] = useState<string>('Name');
    const [isSortOpen, setSortOpen] = useState(false);
    const quarter = quarters.find((q) => q._id == currentQuarterId);

    useEffect(() => {
        fetchPadiezd(currentQuarterId);
        fetchBuilding(currentQuarterId);
    }, [currentQuarterId]);

    useEffect(() => {
        fetchUser({
            filter: filtre,
            ids: filtre == 'Building' ? buildingList.filter((b) => !deselectedPBuilding.includes(b._id)).map(p => p._id) : padiezdList.filter((p) => !deselectedPadiezd.includes(p._id)).map(p => p._id),
            sort,
            quarterId: quarter?._id ?? ''
        })
    }, [currentQuarterId , buildingList, deselectedPBuilding, padiezdList, deselectedPadiezd, filtre, sort]);


    const { setFocusedUser  ,focusedUser , modelObservator} = MainStore()
    useEffect(() => {
        modelObservator('user', focusedUser._id);
    }, [focusedUser]);

    return (
        <div className={"main " + (openAuth !== 'none' ? "blurry" : openedForm !== 'none' ? "blurry" : '')}>
            <div className="quarters">
                {quarters.map((quarter) =>
                    <div key={'quarter' + quarter._id} className={`quarter ${quarter._id === currentQuarterId ? ' active' : ''}`} data-id={quarter._id} onClick={(e) => setcurrentBuildingId(e.currentTarget.dataset.id || "0")}>{quarter.name}</div>
                )}
            </div>
            <div className="list-ctn">
                <div className="list-top">
                    <div className="building-name">{quarter?.name}</div>
                    <div className="add-user" onClick={() => {
                        setOpenedForm('create-user');
                    }}>Add USer</div>
                    <div className="filter-ctn">
                        <div className="filter" onClick={() => {
                            setFiltreOpen(!isFiltreOpen)
                        }}>{filtre} <span></span>
                            <div style={{ display: isFiltreOpen ? 'flex' : 'none' }}>
                                <div onClick={() => {
                                    setFiltre('Padiezd');
                                    setFiltreOpen(false)
                                }}>Padiezd</div>
                                <div onClick={() => {
                                    setFiltre('Building');
                                    setFiltreOpen(false)
                                }}>Building</div>
                            </div>
                        </div>
                        <div className="filter sort" onClick={() => {
                            setSortOpen(!isSortOpen)
                        }}>{sort}<span></span>
                            <div style={{ display: isSortOpen ? 'flex' : 'none' }}>
                                <div onClick={() => {
                                    setSort('Name');
                                    setSortOpen(false);
                                }}>Name</div>
                                <div onClick={() => {
                                    setSort('Date');
                                    setSortOpen(false);
                                }}>Date</div>
                                <div onClick={() => {
                                    setSort('Status');
                                    setSortOpen(false);
                                }}>Status</div>
                                <div onClick={() => {
                                    setSort('Telephone');
                                    setSortOpen(false);
                                }}>Telephone</div>
                                <div onClick={() => {
                                    setSort('Email');
                                    setSortOpen(false);
                                }}>Email</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="list-padiezds">
                    <div className='rest-filter' onClick={() => {
                        setSeselectedBuilding([]);
                        setSeselectedPadiezd([]);
                    }}></div>
                    {filtre == 'Padiezd' ? padiezdList.filter((p) => !deselectedPadiezd.includes(p._id)).map((p) => <div key={p._id} onClick={() => {
                        setSeselectedPadiezd([...deselectedPadiezd, p._id]);
                    }}>{'padiezd ' + p.number}<span></span></div>) :
                        buildingList.filter((b) => !deselectedPBuilding.includes(b._id)).map((b) => <div key={b._id} onClick={() => {
                            setSeselectedBuilding([...deselectedPBuilding, b._id]);
                        }}>{'padiezd ' + b.name}<span></span></div>)}
                </div>
                <div className="list">
                    {
                        userList.map((user) => (user.account as any as AccountInterface)).map(account =>
                            <div className='user-item' key={account._id} onClick={() => {
                                setFocusedUser(account)
                            }}>
                                <div className={'img ' + (((account.profile as any as ProfileInterface).imgProfile[0] as UrlData) ? '' : 'user-default-icon')} style={{

                                }}></div>

                                
                                <div className="ctn-1">
                                    <div className="name">{account.name}</div>
                                    <div className="padiezd-num">{(account.address as any as AddressInterface).padiezd}</div>
                                </div>
                                <div className="email">{account?.email}</div>
                                <div className="ctn-2">
                                    <div className="status">{account.status}</div>
                                    <div className="telephone">{account.telephone}</div>
                                </div>
                                <div className="date">
                                    {account.status}
                                </div>
                            </div>
                        )
                    }
                </div>
                <NavBar ></NavBar>
            </div>

        </div>
    );
}

export default Main;
