
import './UserForm.css';
import { useEffect, useState } from 'react';
import { UserFormStore } from './UserFormStore';
import { AppStore } from '../AppStore';
// import { RooState, RootDispatch } from '../AppStore';
// import { useDispatch, useSelector } from 'react-redux';
// import { setAddUser } from '../Main/MainStore';

function UserForm() {
    const { openedForm, setOpenedForm, createNewUser } = UserFormStore();
    // const dispatch:RootDispatch = useDispatch();
    const { entreprise: entrepriseI, quarters, userList, padiezdList, buildingList, HOST } = AppStore();
    const [name, setName] = useState('Opus')
    const [lastName, setLastName] = useState('Opus');;
    const [email, setEmail] = useState('sublymus@getMaxListeners.com');
    const [telephone, setTelephone] = useState('+7(999)862-74-41');
    const [room, setRoom] = useState(1);
    const [etage, setEtage] = useState(1);
    const [padiezd, setPadiezd] = useState(padiezdList[0]?._id);
    const [quarterId, setQuarterId] = useState(quarters[0]?._id);
    const [status, setStatus] = useState('');
    const { fetchEntreprise, fetchPadiezd, fetchBuilding, fetchUser, currentQuarter } = AppStore();
    useEffect(() => {
        if (quarterId) {
            fetchPadiezd(quarterId);
            fetchBuilding(quarterId);
        }
    }, [quarterId]);
    return (
        <div className="user-form" onClick={(e) => {

        }}>
            <div className="user-form-ctn">
                <div className="close" onClick={() => {
                    setOpenedForm('none')
                }}></div>
                <div className="image">
                </div>
                <div className="form">
                    <h1 className="form-title">Create User</h1>
                    <h5 className="form-prompt">{'Create account for new User'}</h5>

                    <div className="separator" ></div>
                    <div className="name-ctn" >
                        <input placeholder='First Name' className="form-name" value={name} onChange={(e) => {
                            setName(e.currentTarget.value);
                        }}></input>
                        <input placeholder='Last Name' className="form-last-name" value={lastName} onChange={(e) => {
                            setLastName(e.currentTarget.value);
                        }}></input>
                    </div>
                    <input placeholder='Email' className="form-email" value={email} onChange={(e) => {
                        setEmail(e.currentTarget.value);
                    }}></input>
                    <input placeholder='Telephone' className="telethone" value={telephone} onChange={(e) => {
                        setTelephone(e.currentTarget.value);
                    }}></input>

                    <select className='user-building' value={'owner'} onChange={(e) => {
                        setStatus(e.currentTarget.value);
                    }}>
                        <option value="" disabled={true} selected={true}>Select Status </option>
                        {['owner', 'locater'].map((s) =>
                            <option value={s}>{s}</option>
                        )}
                    </select>
                    <select className='user-building' value={quarterId} onChange={(e) => {
                        setQuarterId(e.currentTarget.value);
                    }}>
                        <option value="" disabled={true} selected={true}>Select Quarter </option>
                        {quarters.map((q) =>
                            <option value={q._id} >{q.name}</option>
                        )}
                    </select>

                    <div className='room-info'>
                        <div className='room'>
                            <h5>Room</h5>
                            <input placeholder='Room' type='number' className="form-email" value={room} onChange={(e) => {
                                setRoom(Number(e.currentTarget.value));
                            }}></input>
                        </div>
                        <div className='room'>
                            <h5>Etage</h5>
                            <input placeholder='Etage' type='number' className="form-email" value={etage} onChange={(e) => {
                                setEtage(Number(e.currentTarget.value));
                            }}></input>
                        </div>
                        <div className='room'>
                            <h5>Padiezd</h5>
                            <select className='user-padiezd' value= {padiezd}onChange={(e) => {
                                setPadiezd(e.currentTarget.value)
                            }}>
                                <option value="" disabled={true} selected={true}>Select Padiezd</option>
                                {padiezdList.map((p) =>
                                    <option value={p._id}>{'Padiezd ' + p.number}</option>
                                )}
                            </select>
                        </div>
                    </div>
                    <div className="auformth-submit" onClick={() => {
                        console.log('%%%%%%%%%%%%%%%%%%%%%%%%%');
                        
                        createNewUser({
                            entrepriseId: entrepriseI._id,
                            name,
                            email,
                            telephone,
                            room,
                            etage,
                            lastName,
                            padiezd,
                            quarterId,
                            status
                        });
                        setOpenedForm('none')
                    }}>Create</div>

                </div>

            </div>
        </div>
    );
}

export default UserForm;