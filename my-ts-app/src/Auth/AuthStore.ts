import { SQuery } from './../AppStore';
import { AccountInterface, AddressInterface, EntrepriseInterface, MessengerInterface, ProfileInterface, ManagerInterface, CacheValues } from "../Descriptions";


import { create } from 'zustand'
import { ArrayData, ArrayDataInit, UrlData } from "../lib/SQueryClient";
import EventEmiter, { listenerSchema } from '../lib/event/eventEmiter';
declare module "zustand" {

}

interface AuthState {
    account2: AccountInterface;
    profile: ProfileInterface;
    address: AddressInterface;
    manager: ManagerInterface;
    messenger: MessengerInterface;
    entreprise: EntrepriseInterface
    openAuth: 'login' | 'none' | 'signup',
    setOpenAuth: (openAuth: 'login' | 'none' | 'signup') => void
    fetchLoginManager: (loginData: { email: string, password: string }) => Promise<void>,
    fetchDisconnect: () => Promise<void>,
    fetchCurrentManager: () => Promise<void>
}

//TYPE*
type setType = (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>), replace?: boolean | undefined) => void

const eventEmiter = new EventEmiter()

export const AuthStore = create<AuthState>((set: setType) => ({
    messenger: CacheValues['messenger'],
    entreprise: CacheValues['entreprise'],
    account2: CacheValues['account'],
    manager: CacheValues['manager'],
    profile: CacheValues['profile'],
    address: CacheValues['address'],
    openAuth: 'none',
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

        if (!res?.response || !res?.response?.signup.id) return

        const manager = await SQuery.newInstance('manager', { id: res?.response?.signup.id });
        if (!manager) return

        const _messenger = await manager.messenger;
        if (!_messenger) return

        const entreprise = await manager.entreprise;
        const account2 = await manager.account;
        const profile = await account2.profile;
        const address = await account2.address;
        
        const listener = async ( _address:any)=>{

        }

        listener.uid = 'ertyui'

        address?.when('refresh',listener )

        SQuery.bind({manager , account2 , entreprise , profile},((actu)=>{
            
            const newState = actu({});
            console.log(newState);
            set(()=>(newState));
        }))
       
        eventEmiter.when('disconnect', () => {
           SQuery.unbind({manager , account2 , entreprise , profile})
        })
       
        
        set(({ }) => ({

            ...SQuery.cacheFrom({

                _messenger
                , account2,
                entreprise,
                address,
                manager,
                profile
            })
        }));

    }
}))

