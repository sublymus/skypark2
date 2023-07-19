import { SQueryType } from "./SQreryType";
import { AccountInterface, AddressInterface, BuildingInterface, CacheValues, EntrepriseInterface, PadiezdInterface, QuarterInterface, UserInterface } from "./Descriptions";


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
      __parentModel: 'building_64b39177a1995071ad4044d8_padiezdList_padiezd',
      __key: new ObjectId("64b39173a1995071ad4044a7"),
      __createdAt: 1689489783581,
      __updatedProperty: [Array],
      __updatedAt: 1689489783584,
*/


type PromiseReturnType<T extends Promise<any>> = T extends {then: infer U } ? (U extends (value: infer P)=>any ?  (P extends (value: infer Q)=>any ? Q:never ): never):never
  
export const SQuery = createSQueryFrom(Descriptions, CacheValues);
export type ArgumentsType<T> = T extends (arg1: infer U, ...args: any[]) => any ? U : never;
type allModelPath = keyof typeof Descriptions;
interface AppState {
    HOST: string,
    entreprise: EntrepriseInterface,
    quarters: QuarterInterface[],
    currentQuarter: QuarterInterface
    padiezdList: PadiezdInterface[]
    buildingList: BuildingInterface[],
    userList: UserInterface[],
    fetchModel: (modelPath: allModelPath, id: string, callBack: (instance: (PromiseReturnType<ReturnType<typeof SQuery.newInstance>>  & { [p: string]: any })|null|undefined) => void) => Promise<void>
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
    fetchModel: async (modelPath, id: string, callBack) => {
        const instance = await SQuery.newInstance(modelPath, { id });
        callBack(instance);
    },
    fetchEntreprise: async (id: string) => {
        if (!id) return
        const _entreprise = await SQuery.newInstance('entreprise', { id });
        if (!_entreprise) return;
        _entreprise.when('refresh', (modified: any) => {
            set(({ entreprise }) => ({
                entreprise: {
                    ...entreprise,
                    ...modified,
                }
            }))
        });
        const _quarters = await _entreprise.quarters
        console.log({ _quarters });

        const arrayData = await _quarters?.page();

        const quarters = arrayData?.items

        const entreprise = _entreprise?.$cache as EntrepriseInterface;
        set(() => ({ entreprise, quarters }))
    },

    fetchPadiezd: async (quarterId: string) => {
        if (!quarterId) return
        const res = await SQuery.service('app', 'padiezdList', { quarterId });
        if (!res.response) return

        const padiezdList = res.response as PadiezdInterface[];
        console.log({ padiezdList });

        set(() => ({ padiezdList }))
    },
    fetchBuilding: async (quarterId: string) => {
        if (!quarterId) return
        const res = await SQuery.service('app', 'buildingList', { quarterId });
        if (!res.response) return

        const buildingList = res.response as BuildingInterface[];
        console.log({ buildingList });

        set(() => ({ buildingList }))
    },
    fetchUser: async (data) => {
        if (!data.quarterId) return
        const res = await SQuery.service('app', 'userList', data);
        if (!res.response) return
        const userList = res.response as UserInterface[];
        console.log({ userList });

        set(() => ({ userList }))
    }
}))

