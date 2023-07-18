import { AppStore, SQuery } from "../AppStore";
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
        console.log('fetchLoginManager')
        const res = await SQuery.service<typeof SQueryType.login>('login', 'manager', loginData);
        if (!res?.response || !res?.response?.signup.id) {
            return console.log('ERROR Loging : res=> ', res);
        }

        const manager = await SQuery.newInstance('manager', { id: res?.response?.signup.id });
        console.log({ manager });

        const entreprise = await manager.entreprise;
        console.log({ entreprise });

        const account = await manager.account;

        account.when('refresh', (v: any) =>
            set(({ account: a }) => ({ account: { ...a, ...v } }))
            , false)

        console.log({ account });
        const address = await account.address;
        (await (await (await address.quarter)?.supervisor)?.page(1))?.itemsInstance?.forEach(q => {

        });
        console.log({ address });
        const profile = await account.profile;

        profile.when('refresh', (v: any) =>
            set(({ profile: p }) => ({ profile: { ...p, ...v } }))
            , false)
        console.log({ profile });

        const astro :string= ''
        
        set(() => ({ openAuth: 'none', id: manager.$id, ...SQuery.cacheFrom({ account, address, profile, manager, entreprise })}))
    }
}))

