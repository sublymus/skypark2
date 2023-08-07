import { accountInit } from './../AppStore';
import { MessageInterface, ProfileInterface } from './../Descriptions';
import { PickArgumentsType, SQuery } from "../AppStore";
import { AccountInterface, AddressInterface, CacheValues } from "../Descriptions";
import { create } from 'zustand'
import { ArrayData, ArrayDataInit } from '../lib/SQueryClient';

declare module "zustand" {

}


interface MainState {
    infoSize: number,
    selectedPage: number,
    setInfoSize: (n: number) => void,
    setSelectedPage: (n: number) => void,
    setFocusedUser: (account: typeof accountInit) => void,
    sendMessage: (data: {
        value: string,
        focusedUser: typeof accountInit
    }) => Promise<void>
    focusedUser: typeof accountInit,
    currentChannel: ArrayData<MessageInterface>,
    fetchDiscussion: (accountId: string) => Promise<void>

    //modelObservator:(modelPath:PickArgumentsType<0,typeof SQuery.newInstance>, id:string)=> Promise<void>
}

type setType = (partial: MainState | Partial<MainState> | ((state: MainState) => MainState | Partial<MainState>), replace?: boolean | undefined) => void
let a = 0;
export const MainStore = create<MainState>((set: setType) => ({
    infoSize: 0,
    focusedUser: accountInit,
    currentBuilding: {},
    currentChannel: ArrayDataInit,
    selectedPage: 0,
    setInfoSize: (n) => {
        console.log(`%c setInfoSize`, 'font-weight: bold; font-size: 20px;color: #345;', { n });
        set(({ }) => ({ infoSize: n }));
    },
    setSelectedPage: (n) => {
        console.log(`%c setSelectedPage`, 'font-weight: bold; font-size: 20px;color: #345;', { n });
        set(({ }) => ({ selectedPage: n }));
    },
    setFocusedUser: (account) => {
        console.log(`%c setFocusedUser`, 'font-weight: bold; font-size: 20px;color: #345;', { account });
        set(({ }) => ({ focusedUser: account }))
    },
    sendMessage: async (data) => {
        const res = await SQuery.service('messenger', 'createDiscussion', {
            receiverAccountId: data.focusedUser._id,
        });

        if (!res.response) return;

        const discussion = await SQuery.newInstance('discussion', { id: res.response.id });
        if (!discussion) return
        const ArrayDiscussion = await discussion.channel;
        ArrayDiscussion?.update({
            addNew: [{
                account: data.focusedUser._id,
                text: data.value
            }]
        })
    },
    fetchDiscussion: async (accountId) => {
        console.log(`%c fetchDiscussion`, 'font-weight: bold; font-size: 20px;color: #345;', { accountId });
        const res = await SQuery.service('messenger', 'createDiscussion', {
            receiverAccountId: accountId
        });

        if (!res.response) return set(({}) => ({ currentChannel: ArrayDataInit }));
        a = 0;
        const discussion = await SQuery.newInstance('discussion', { id: res.response.id });
        if (!discussion) return
        const ArrayDiscussion = await discussion.channel;
        const currentChannel = await ArrayDiscussion?.update({
            paging: {
                limit: 100,
                sort: {

                    __createdAt: 1,
                    
                },
            }
        });
        ArrayDiscussion?.when('update', async (modifiedData , e) => {
            a++;
            console.log(`%c update${a}`, 'font-weight: bold; font-size: 20px;color: green;', { modifiedData  ,  });
            const currentChannel = await ArrayDiscussion?.update({
                paging: {
                    limit: 100,
                    sort: {
                        __createdAt: 1
                    },
                }
            });;
            console.log(`%c currentChannel`, 'font-weight: bold; font-size: 20px;color: green;', { currentChannel  });
            set(({focusedUser}) => ({ currentChannel: currentChannel }))
        })
        set(() => ({ currentChannel: currentChannel }));
    },
}))
