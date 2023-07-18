import { ArgumentsType, SQuery } from "../AppStore";
import { AccountInterface } from "../Descriptions";
import { create } from 'zustand'

declare module "zustand"{
    
}

interface MainState {
    infoSize:number,
    selectedPage:number,
    setInfoSize:(n:number)=>void,
    setSelectedPage:(n:number)=>void,
    setFocusedUser:(account:AccountInterface)=>void,
    focusedUser:AccountInterface,
    modelObservator:(modelPath:ArgumentsType<typeof SQuery.newInstance>, id:string)=> Promise<void>
}

type setType = (partial: MainState | Partial<MainState> | ((state: MainState) => MainState | Partial<MainState>), replace?: boolean | undefined) => void

export const MainStore = create<MainState>((set:setType) => ({
    infoSize:0,
    focusedUser:{
        _id: '',
        name: '',
        email: '',
        userTarg: '',
        status: '',
        password: '',
        telephone: '',
        address: '',
        favorites: '',
        profile: '',
    },
    currentBuilding:{},
    selectedPage:0,
    modelObservator:async (modelPath , id)=>{
        const instance = await SQuery.newInstance('address', { id });
        instance
    },
    setInfoSize:(n)=>{
        set(({})=>({infoSize:n}));
    },
    setSelectedPage:(n)=>{
        set(({})=>({selectedPage:n}));
    },
    setFocusedUser:(account)=>{
        console.log(account);
        set(({})=>({focusedUser:account}))
    },
}))
