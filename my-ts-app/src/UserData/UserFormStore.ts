import { SQuery } from "../AppStore";
import { SQueryType } from "../SQreryType";


import { create } from 'zustand'
declare module "zustand"{
    
}
import { FileType, UrlData } from '../lib/SQueryClient';

interface AuthState {
    openedForm : 'create-user'|'none',
    setOpenedForm:(form:'create-user'|'none')=>void,
    createNewUser:(data:any)=>void,
}

type setType = (partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>), replace?: boolean | undefined) => void

export const UserFormStore = create<AuthState>((set:setType) => ({
    openedForm:'none',
    setOpenedForm(form) {
        set({openedForm:form})
    },
    createNewUser(data:any) {
        console.log(data);
        
    },
}))

