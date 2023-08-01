import {  BuildingInterface, CacheValues, Controller, EntrepriseInterface, PadiezdInterface, QuarterInterface } from "./Descriptions";


import { create } from 'zustand'
import createSQueryFrom from "./lib/SQueryClient";
import { Descriptions } from "./Descriptions";
declare module "zustand" {

}
/*
 _id: new ObjectId("64b39177a1995071ad4044d9"),
      number: 1,
      users: [Array],
      channel: [],
      __key: new ObjectId("64b39173a1995071ad4044a7"),
      __parentModel: 'building_64b39177a1995071ad4044d8_padiezdList_padiezd',
      __createdAt: 1689489783581,
      __updatedAt: 1689489783584,
      __updatedProperty: [Array],
*/


export const SQuery = createSQueryFrom('http://localhost:3500',Descriptions, CacheValues , Controller);


//TYPE*
type PromiseReturnType<T extends Promise<any>> = T extends {then: infer U } ? (U extends (value: infer P)=>any ?  (P extends (value: infer Q)=>any ? Q:never ): never):never

//TYPE*
export type PickArgumentsType<N extends keyof Array<any> ,T > = T extends (...args: infer U) => any ? U extends Array<any> ? U[N] : never: never;


const f = (a:number , b:string)=>{}

type arg = PickArgumentsType<0 , typeof f>

export const accountInit = {
    ...CacheValues['account'],
    address:CacheValues['address'],
    profile:CacheValues['profile']
}
export const userInit = {
    account:accountInit
}

type allModelPath = keyof typeof Descriptions;
interface AppState {
    HOST: string,
    entreprise: EntrepriseInterface,
    quarters: QuarterInterface[],
    currentQuarter: QuarterInterface
    padiezdList: PadiezdInterface[]
    buildingList: BuildingInterface[],
    userList: (typeof userInit)[],
    fetchEntreprise: (id: string) => Promise<void>
    fetchBuilding: (id: string) => Promise<void>
    fetchPadiezd: (quarterId: string) => Promise<void>
    fetchUser: (data: { quarterId: string, ids: string[], filter: 'Padiezd' | 'Building', sort: string }) => Promise<void>
}

type setType = (partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>), replace?: boolean | undefined) => void

export const AppStore = create<AppState>((set: setType) => ({
    quarters: [],
    entreprise: CacheValues['entreprise'],
    currentQuarter: CacheValues['quarter'],
    userList: [],
    padiezdList: [],
    buildingList: [],
    HOST: 'http://localhost:3500',
    
    fetchEntreprise: async (id: string) => {
        if (!id) return
        const entreprise = await SQuery.newInstance('entreprise', { id });
        if (!entreprise) return;
        entreprise.when('refresh', (modified: any) => {
            set(({ entreprise }) => ({
                entreprise: {
                    ...entreprise,
                    ...modified,
                }
            }))
        });
        const _quarters = await entreprise.quarters

        console.log({ _quarters });

        const arrayData = await _quarters?.page();

        const quarters = arrayData?.items

        set(() => ({ ...SQuery.cacheFrom({entreprise}), quarters }));
    },

    fetchPadiezd: async (quarterId: string) => {
        console.log(`%c fetchPadiezd`,'font-weight: bold; font-size: 20px;color: #345;',{quarterId});

        const res = await SQuery.service('app', 'padiezdList', { quarterId });
        if (!res.response) return

        const padiezdList = res.response as PadiezdInterface[];
        console.log({ padiezdList });

        set(() => ({ padiezdList }))
    },
    fetchBuilding: async (quarterId: string) => {
        console.log(`%c fetchBuilding`,'font-weight: bold; font-size: 20px;color: #345;',{quarterId});
       
        const res = await SQuery.service('app', 'buildingList', { quarterId });
        if (!res.response) return

        const buildingList = res.response as BuildingInterface[];
        console.log({ buildingList });

        set(() => ({ buildingList }))
    },
    fetchUser: async (data) => {
        console.log(`%c fetchUser`,'font-weight: bold; font-size: 20px;color: #345;',{data});
        if (!data.quarterId) return
        const res = await SQuery.service('app', 'userList', data);
        if (!res.response) return
        const userList = res.response as any as (typeof userInit)[];
        console.log({ userList });

        set(() => ({ userList }))
    }
}))
