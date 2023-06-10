import { configureStore, createSlice } from "@reduxjs/toolkit";


const discussions = [{
    text: 'salut',
    left: true,
}, {
    text: 'Comment ca va',
    left: false,
}, {
    text: 'je vais bien et chez toi',
    left: true,
}, {
    text: 'ca va super',
    left: false,
}, {
    text: 'Tu pourrais m\'envoyer les documents signer ',
    left: true,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'Comment ca va',
    left: false,
}, {
    text: 'je vais bien et chez toi',
    left: true,
}, {
    text: 'ca va super',
    left: false,
}, {
    text: 'Tu pourrais m\'envoyer les documents signer ',
    left: true,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}, {
    text: 'pas de soucies, je finir dans 30min',
    left: false,
}]
const _user = {
    id: '',
    messenger:{
        discussions
    },
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
export const MainSclice = createSlice({
    name:'app',
    initialState:{
        currentBuildingId : '0',
        focusedUser:_user,
        selectedPage:0,
        infoSize:2,
        filterPadiezd:[''],
        buildings,
    },
    reducers:{
        setPage:(state,action)=>{
            state.selectedPage = action.payload;
        },
        setcurrentBuildingId:(state,action)=>{
            state.currentBuildingId = action.payload;
        },
        setFocusedUser:(state,action)=>{
            state.focusedUser = action.payload;
        },
        setInfoSize:(state,action)=>{
            state.infoSize = action.payload;
        },
        setFilterPadiezd:(state,action)=>{
            state.filterPadiezd = action.payload;
        },
        setSelectedPage:(state,action)=>{
            state.selectedPage = action.payload;
        }
    }
});

export const {setPage ,setSelectedPage, setFilterPadiezd, setFocusedUser, setInfoSize, setcurrentBuildingId} = MainSclice.actions;