import { SQuery } from './../AppStore';
import { AccountInterface, AddressInterface, EntrepriseInterface, MessengerInterface, ProfileInterface, ManagerInterface, CacheValues } from "../Descriptions";


import { create } from 'zustand'
import { ArrayData, ArrayDataInit, FileType, UrlData } from "../lib/SQueryClient";
import EventEmiter, { listenerSchema } from '../lib/event/eventEmiter';
declare module "zustand" {

}

interface AuthState {
    account2: AccountInterface|undefined;
    profile: ProfileInterface|undefined;
    address: AddressInterface|undefined;
    manager: ManagerInterface|undefined;
    messenger: MessengerInterface|undefined;
    entreprise: EntrepriseInterface|undefined,
    openAuth: 'login' | 'none' | 'signup',
    setOpenAuth: (openAuth: 'login' | 'none' | 'signup') => void
    fetchLoginManager: (loginData: { email: string, password: string }) => Promise<void>,
    fetchDisconnect: () => Promise<void>,
    fetchCurrentManager: () => Promise<void>,
    setProfile:(data:Partial<ProfileInterface>&{_id:string} , file?:{imgProfile?:FileType[] , bainner?:FileType[]})=>  Promise<void>,

}

//TYPE*
type setType = (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>), replace?: boolean | undefined) => void

const eventEmiter = new EventEmiter()

export const AuthStore = create<AuthState>((set: setType) => ({
    messenger: undefined,
    entreprise: undefined,
    account2: undefined,
    manager: undefined,
    profile: undefined,
    address: undefined,
    openAuth: 'none',
    setProfile:async(data , file)=> {
        console.log(`%c setProfile`, 'font-weight: bold; font-size: 20px;color: #345;',{data , file});
        const profile = await SQuery.newInstance('profile', { id: data?._id ||''});
        if (!profile) return;
        profile.update({
            ...data,
            ...file
        })
    },
    setOpenAuth: (openAuth: 'login' | 'none' | 'signup') => {
        console.log(`%c setOpenAuth`, 'font-weight: bold; font-size: 20px;color: #345;', { openAuth });
        set(() => ({ openAuth }))
    },
    fetchCurrentManager: async () => {
        console.log(`%c fetchCurrentManager`, 'font-weight: bold; font-size: 20px;color: #345;', {});
        const manager = await SQuery.currentClientInstance<'manager'>();
        if (!manager) return;
        console.log({ manager });

    },
    fetchDisconnect: async () => {
        console.log(`%c fetchDisconnect`, 'font-weight: bold; font-size: 20px;color: #345;', {});
        set(() => ({
            messenger: CacheValues['messenger'],
            entreprise: CacheValues['entreprise'],
            account2: CacheValues['account'],
            manager: CacheValues['manager'],
            profile: CacheValues['profile'],
            address: CacheValues['address'],
        }))
        await SQuery.service('server', 'disconnection', {});
        eventEmiter.emit('disconnect', true);

    },
    fetchLoginManager: async (loginData: { email: string, password: string }) => {
        console.log(`%c fetchLoginManager`, 'font-weight: bold; font-size: 20px;color: #345;', { ...loginData });
        const res = await SQuery.service('login', 'manager', loginData);
console.log(res);

        if (!res?.response || !res?.response?.signup.id) return  console.log(`%c ERROR`, 'font-weight: bold; font-size: 20px;color: #345;', { er : res.error});

        const manager = await SQuery.newInstance('manager', { id: res?.response?.signup.id });
        console.log(`%c fetchLoginManager`, 'font-weight: bold; font-size: 20px;color: #345;',{manager});
        if (!manager) return

        const messenger = await manager.messenger;
        console.log(`%c fetchLoginManager`, 'font-weight: bold; font-size: 20px;color: #345;',{messenger});
      //  if (!messenger) return
        const entreprise = await manager.entreprise;
        const account2 = await manager.account;
        console.log({account2});
        
        const profile = await account2?.profile;
        const address = await account2?.address;
        
        const listener = async ( _address:any)=>{

        }

        console.log(`%c fetchLoginManager`, 'font-weight: bold; font-size: 20px;color: #345;', {
            account2: account2?.$cache,
            entreprise:entreprise?.$cache,
            address: address?.$cache,
            manager: manager.$cache,
            profile: profile?.$cache,
            messenger : messenger?.$cache
        });
        listener.uid = 'ertyui'

        address?.when('refresh',listener )

        SQuery.bind({manager , account2  , profile},set)
       
        eventEmiter.when('disconnect', () => {
           SQuery.unbind({manager , account2  , profile})
        })
       
       
        set(({ }) => ({

            ...SQuery.cacheFrom({
                messenger,
                account2,
                entreprise,
                address,
                manager,
                profile
            }),
        }));

    }
}))

