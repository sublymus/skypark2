import { SQuery } from './AppStore';
import { SQueryType } from "./SQreryType";
import { AccountInterface, AddressInterface, EntrepriseInterface, MessengerInterface, ProfileInterface, ManagerInterface, CacheValues } from "./Descriptions";


import { create } from 'zustand'
import { UrlData } from "./lib/SQueryClient";
import { arrayBuffer } from 'node:stream/consumers';
import { Stream } from 'node:stream';
import { ReadStream } from 'node:fs';
import { SQuery2 } from './Description2';
import EventEmiter from './lib/event/eventEmiter';
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

    LABO: (loginData: { email: string, password: string }) => Promise<void>,
    fetchDisconnect: () => Promise<void>,
}

type setType = (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>), replace?: boolean | undefined) => void
const eventEmiter = new EventEmiter();
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
    fetchDisconnect: async () => {
        const transaction  = await SQuery2.newInstance('transaction',{
            id:''
        });
        transaction?.update({
            
        });
       // const er = await transaction?.unbind
        set(() => ({
            id: '',
            messenger: CacheValues['messenger'],
            entreprise: CacheValues['entreprise'],
            account: CacheValues['account'],
            manager: CacheValues['manager'],
            profile: CacheValues['profile'],
            address: CacheValues['address'],
        }))
        await SQuery.service('server', 'disconnection', {});
        const account = await SQuery2.newInstance('account', { id:''});

        account?.imgProfile
    },
    LABO: async (loginData: { email: string, password: string }) => {
        //********************   SQuery.service   ***************************
        const res = await SQuery2.service('login', 'manager', loginData);
        const res2 = await SQuery2.service('messenger', 'joinDiscussion', {
            discussionId:''
        });
        res2.response
        if (!res?.response || !res?.response?.signup.id) {
            return console.log('ERROR Loging : res=> ', res);
        }

        //********************   SQuery.newInstance   ***************************
        // collect your intances
        const manager = await SQuery.newInstance('manager', { id: res?.response?.signup.id });
        if (!manager) return

        const messenger = await manager.messenger;
        const entreprise = await manager.entreprise;
        const account = await manager.account;
        const profile = await account.profile;
        const address = await account.address;
        // push them in your state
        set(({ }) => ({ id: manager.$id, ...SQuery.cacheFrom({ account, entreprise, messenger, address, manager, profile }) }))

        SQuery.bind({manager , account , entreprise , profile},((actu)=>{
            
            const newState = actu({});
            console.log(newState);
            set(()=>(newState));
        }));
       
        const parent2  =  await account.newParentInstance<'user'>()
        parent2?.messenger
        eventEmiter.when('disconnect', () => {
           SQuery.unbind({manager , account , entreprise , profile})
        })
        SQuery.storage
        
        console.log('uid 4');
        
        /*
        when( 'refresh' , ( v, e )=> void )
        v : contain the modified properties; { p1: value1 }
        e : {
            event: string; // the trigger event
            count: number; // count call of listener for this event
            value: T;      // new Value
            lastValue: T;  // old Value
            uid: string;   // the listener uid;
            remove:(envents?: string)=>void // remove listener for this event or specified envents; envents:'e1 e2 e3' //TODO*
        }
       */
        address?.when('refresh', (v) => {
            set((state) => ({
                [address.$modelPath]: {
                    ...state[address.$modelPath],
                    ...v
                }
            }));
        })

        //********************   instance  read / update   ***************************

        const arrSimple =  account.arrSimple;
        account.arrSimple = [...arrSimple, 2, 3,];

        const arrFile = account.arrFile;
        account.arrFile = [...arrFile,
        {// create new file in server side
            buffer: new ArrayBuffer(1024),
            encoding: 'base64',
            fileName: 'file.json', // or name
            size: 1024,
            type: 'application/json' // or mime 
        }, { // existing file data.
            url: '/fs/erty.poiouk.wncjdd.json',
            size: 1024,
            extension: 'json'
        }
        ];


        const bigint = account.bigint;
        account.bigint = 1234567890n;

        const bool = account.bool;
        account.bool = !bool;

        const map = account.map
        account.map = new Map([['key', true]]);


        const map2 = account.map2
        account.map2 = [new Map([['key0', 0], ['key1', 1]])];
        const values = map2?.values();

        const obj = account.obj;
        account.obj = { salut: '', famille: '', nombreuse: 0 };
        obj?.salut

        const arrRef = await account.arrRef;
        const arrayData = await arrRef?.next() // back() | last() | next() | page(number?) | update(..) | when(..);
        arrayData?.items; // all information about arrayData 
        /*
        added: string[],            // recently added
        removed: string[],           // recently removed
        items: [],                   // cache values 
        itemsInstance: [] instance values, // instance values
        totalItems: number,          
        limit: number,
        totalPages: number,
        page: number,
        pagingCounter: number,
        hasPrevPage: boolean,
        hasNextPage: boolean,
        prevPage: number|null,
        nextPage: number|null
        */

        arrRef?.update({
            paging:{ 
                limit:20,
                page:arrayData?.page,
                query:{
                    
                    text:{ $in:['SQuery >> all','...']}
                },
                sort:{
                    text:1,
                    eert:1

                },
                select:'text account',
            }
        })

        //********************   SQuery.model   ***************************
        const parent  = SQuery2.currentClientInstance<'user'>()
        //********************   SQuery.model   ***************************

        const model1 = await SQuery2.createModel('entreprise');
        // or 
        if (!address) return
        const model2 = address.$model;

       
        // the description of model permit you to know exactly 
        const modelDescription = model2.description

        const instance1 = await model2.create({
            
        });

        const instance2 = await model2.newInstance({ id: ''/* model id*/ });

        const instance3 = await model2.update({
            id: ''/* model update data , id is required*/
        });
        const instance4 = await model2.newParentInstance<'address'>({
            childInstance: address
        });
        
        await model2.delete({
            id: ''
        });


 //********************   SQuery.Collector   ***************************
       
    }
}))

/*

    async isInstance(instance: any){
      return (
        instance.$modelPath &&
        instance.$id &&
        instance.newParentInstance &&
        instance.update &&
        instance.when
      );
    },
    async isArrayInstance(arrayInstance: any) {
      return (
        arrayInstance.back &&
        arrayInstance.next &&
        arrayInstance.page &&
        arrayInstance.$itemModelPath &&
        arrayInstance.last &&
        arrayInstance.update &&
        arrayInstance.when
      );
    },
    async isFileInstance (fileInstance: any)  {
      return false;
    },

*/