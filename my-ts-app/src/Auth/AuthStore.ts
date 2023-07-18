import { SQuery } from './../AppStore';
import { Descriptions } from './../Descriptions';
import { SQueryType } from "../SQreryType";
import { AccountInterface, AddressInterface, EntrepriseInterface, MessengerInterface, ProfileInterface, ManagerInterface, CacheValues } from "../Descriptions";


import { create } from 'zustand'
import { UrlData } from "../lib/SQueryClient";
declare module "zustand" {

}


interface AuthState {
    id: string,
    account: AccountInterface;
    profile: ProfileInterface;
    address: AddressInterface;
    manager: ManagerInterface
    messenger: MessengerInterface;
    entreprise: EntrepriseInterface
    openAuth: 'login' | 'none' | 'signup',
    setAccount: (data: AccountInterface) => void
    setOpenAuth: (openAuth: 'login' | 'none' | 'signup') => void
    setProfile: (data: ProfileInterface) => void
    setAddress: (data: AddressInterface) => void
    setMessenger: (data: MessengerInterface) => void
    setEntreprise: (data: EntrepriseInterface) => void
    fetchLoginManager: (loginData: { email: string, password: string }) => Promise<void>,
    fetchDisconnect: () => Promise<void>,
}

type setType = (partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>), replace?: boolean | undefined) => void

export const AuthStore = create<AuthState>((set: setType) => ({
    id: '',
    messenger: CacheValues['messenger'],
    entreprise: CacheValues['entreprise'],
    account: CacheValues['account'],
    manager: CacheValues['manager'],
    profile: CacheValues['profile'],
    address: CacheValues['address'],
    openAuth: 'none',
    setOpenAuth: (openAuth: 'login' | 'none' | 'signup') => set(() => ({ openAuth })),
    setAccount: (account: AccountInterface) => {
        // state.currentManager = action.payload;
    },
    setProfile: (profile: ProfileInterface) => set(() => ({ profile })),
    setAddress: (address: AddressInterface) => set(() => ({ address })),
    setManager: (manager: ManagerInterface) => set(() => ({ manager })),
    setMessenger: (messenger: MessengerInterface) => set(() => ({ messenger })),
    setEntreprise: (entreprise: EntrepriseInterface) => set(() => ({ entreprise })),
    fetchDisconnect: async () => {

        set(() => ({
            id: '',
            messenger: CacheValues['messenger'],
            entreprise: CacheValues['entreprise'],
            account: CacheValues['account'],
            manager: CacheValues['manager'],
            profile: CacheValues['profile'],
            address: CacheValues['address'],
        }))
        await SQuery.service<typeof SQueryType.disconnect>('server', 'disconnection', {});

    },
    fetchLoginManager: async (loginData: { email: string, password: string }) => {

        const res = await SQuery.service<typeof SQueryType.login>('login', 'manager', loginData);

        if (!res?.response || !res?.response?.signup.id) {
            return console.log('ERROR Loging : res=> ', res);
        }

        const manager = await SQuery.newInstance('manager', { id: res?.response?.signup.id });
        if (!manager) return

        const account = await manager.account;

        const entreprise = await manager.entreprise;
        const messenger = await manager.messenger;

        const profile = await account.profile;
        const address = await account.address;

       // SQuery.bind(profile , set);                
        profile.when('refresh' , (v)=>{
            set(({profile}) => ({profile:{
                ...profile,
                ...v
            }}));
        })
        
        entreprise?.when('refresh' , (v)=>{
            set(({entreprise}) => ({entreprise:{
                ...entreprise,
                ...v
            }}));
        })

        set(({ }) => ({ id: manager.$id, ...SQuery.cacheFrom({ account, entreprise, messenger, address, manager , profile }) }))

    }
}))

