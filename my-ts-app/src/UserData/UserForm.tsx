
import './UserForm.css';
import { useState } from 'react';
import { UserFormStore } from './UserFormStore';
// import { RooState, RootDispatch } from '../AppStore';
// import { useDispatch, useSelector } from 'react-redux';
// import { setAddUser } from '../Main/MainStore';

function UserForm() {
    const { openedForm, setOpenedForm, createNewUser } = UserFormStore();
    // const dispatch:RootDispatch = useDispatch();
    const [name, setName] = useState('Opus')
    const [lastName, setLastName] = useState('Opus');;
    const [email, setEmail] = useState('sublymus@getMaxListeners.com');
    const [telephone, setTelephone] = useState('+7(999)862-74-41');
    const [room, setRoom] = useState(1);
    const [etage, setEtage] = useState(1);
    const [padiezd, setPadiezd] = useState(1);
    const [buildingId, setBuildingId] = useState('0');
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

                    <select className='user-building' onChange={(e)=>{
                                setBuildingId(e.currentTarget.value);
                            }}>
                        <option value="" disabled={true} selected={true}>Select Building </option>
                        <option value="0">Sublymus B0</option>
                        <option value="1">Sublymus B5</option>
                        <option value="2">Sublymus B10</option>
                        <option value="3">Sublymus B15</option>
                        <option value="4">Sublymus B20</option>
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
                            <select className='user-padiezd' onChange={(e)=>{
                                setPadiezd(Number(e.currentTarget.value))
                            }}>
                                <option value="" disabled={true} selected={true}>Select Padiezd</option>
                                <option value="1">Padiezd 1</option>
                                <option value="2">Padiezd 2</option>
                                <option value="3">Padiezd 3</option>
                                <option value="4">Padiezd 4</option>
                                <option value="5">Padiezd 5</option>
                                <option value="6">Padiezd 6</option>
                            </select>
                        </div>
                    </div>
                    <div className="auformth-submit" onClick={() => {
                        // dispatch(setAddUser({
                        //     name,
                        //     email,
                        //     telephone,
                        //     room,
                        //     etage,
                        //     lastName,
                        //     padiezd,
                        //     buildingId
                        // }))
                    }}>Create</div>

                </div>

            </div>
        </div>
    );
}

export default UserForm;