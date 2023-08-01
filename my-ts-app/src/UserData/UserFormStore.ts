import { SQuery } from "../AppStore";
import { SQueryType } from "../SQreryType";


import { create } from 'zustand'

import { FileType, UrlData } from '../lib/SQueryClient';

interface AuthState {
    openedForm : 'create-user'|'none',
    newUserId:'',
    setOpenedForm:(form:'create-user'|'none')=>void,
    createNewUser:(data:{
        entrepriseId:string,
        name:string,
        email:string,
        telephone:string,
        room:number,
        etage:number,
        lastName:string,
        padiezd:string,
        quarterId:string
        status:string
    })=>Promise<void>,
        

}

type setType = (partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>), replace?: boolean | undefined) => void

export const UserFormStore = create<AuthState>((set:setType) => ({
    openedForm:'none',
    newUserId:'',
    setOpenedForm(form) {
        console.log(`%c setOpenedForm`,'font-weight: bold; font-size: 20px;color: #345;',{form});
        set({openedForm:form})
    },
    async createNewUser(data) {
        console.log(`%c createNewUser`,'font-weight: bold; font-size: 20px;color: #345;',{data});
        
        const res  = await SQuery.service('client','create',data)
        
        console.log(`%c createNewUser`,'font-weight: bold; font-size: 20px;color:green;',{res});
    },
}))

