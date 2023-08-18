import { SQuery } from './../AppStore';
import { AccountInterface, AddressInterface, EntrepriseInterface, MessengerInterface, ProfileInterface, ManagerInterface, CacheValues } from "../Descriptions";


import { create } from 'zustand'
import { ArrayData, ArrayDataInit, FileType, UrlData } from "../lib/SQueryClient";
import EventEmiter, { listenerSchema } from '../lib/event/eventEmiter';
declare module "zustand" {

}

const pc = {
    _id: "64cf94e7f55d6179677ab69d",
    imgProfile: [
        {
            url: '/fs/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsUGF0aCI6ImZzLzE2OTE0ODc0MDg2MzFfNjRkMjBjYjA0MjBhYTJhNDliOGQ4ODM0LndlYnAiLCJtb2RlbFBhdGgiOiJwcm9maWxlIiwicHJvcGVydHkiOiJpbWdQcm9maWxlIiwiY3JlYXRlZEF0IjoxNjkxNDg3NDA4NjMzLCJpYXQiOjE2OTE0ODc0MDh9.VdEUBTeKFx7Bc4Tcl5ZpuhPOOyNLHIhSVOS3u9kK2-w.webp',
            size: 22862,
            extension: 'webp',
            _id: "64d20cb0420aa2a49b8d8835"
        }
    ],
    banner: [],
    message: 'this is my profile',
    __parentModel: 'account_64cf94e7f55d6179677ab696_profile_profile',
    __key: "64cf94e7f55d6179677ab695",
    __createdAt: 1691325671410,
    __updatedProperty: ['imgProfile', '__updatedAt'],
    __updatedAt: 1691487408642,
    __v: 27,
    __parentList:[]
} as ProfileInterface


//TODO*
const defaultImage: FileType = {
    buffer: 'data:image/jpeg;base64,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',
    encoding: 'base64',
    fileName: 'defaultImage.jpeg',
    size: 2620,
    type: 'image/jpeg'
}
interface AuthState {
    account2: AccountInterface | undefined;
    profile: ProfileInterface | undefined;
    address: AddressInterface | undefined;
    manager: ManagerInterface | undefined;
    messenger: MessengerInterface | undefined;
    entreprise: EntrepriseInterface | undefined,
    openAuth: 'login' | 'none' | 'signup',
    setOpenAuth: (openAuth: 'login' | 'none' | 'signup') => void
    fetchLoginManager: (loginData?: { email: string, password: string }) => Promise<void>,
    fetchDisconnect: () => Promise<void>,
    setProfile: (data: Partial<ProfileInterface> & { _id: string }, file?: { imgProfile?: FileType[], bainner?: FileType[] }) => Promise<void>,
}

//TYPE*
type setType = (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>), replace?: boolean | undefined) => void

const eventEmiter = new EventEmiter()

const testId = '';

export const AuthStore = create<AuthState>((set: setType) => ({
    messenger: undefined,
    entreprise: undefined,
    account2: undefined,
    manager: undefined,
    profile: undefined,
    address: undefined,
    openAuth: 'none',
    setProfile: async (data, file) => {
        console.log(`%c setProfile`, 'font-weight: bold; font-size: 20px;color: #345;', { data, file });

        const res = await SQuery.service('post','statPost',{
            postId:'64dde279794553f81b24a998',

        })
        console.log(res);
        if(!res?.response) return



        const postStat = res.response.post.statPost
        console.log(postStat);
        postStat.totalCommentsCount
        // const model = await SQuery.createModel('test');
        // await model.delete({
        //     id:'64d60c9048cf61fdc8af5b5c'
        // })
        // const test = await model.newInstance({
        //     id: "64d60c9048cf61fdc8af5b5c",
        // })

        // console.log({test});

        // if (!file) return;
        // test.num = (test.num || 0) + 1;
        // test.bigint = (test.bigint||'')+`${(test.num||0) +1}`;
        //   test.stringMap =  test.stringMap?.set(test.num+'','str : '+test.num) //TODO* transformer les donner server en MAp
        //    test.bool = !test.bool; //TODO* ERROR ????
        //     test.fileArray = [...(test.fileArray as UrlData[]), defaultImage ];
        //    test.numberMap = test.numberMap?.set(test.num+'',test.num); //TODO*
        // if (test.ojectData)
        //     test.ojectData = {
        //         ...test.ojectData,
        //         nombreuse: test.num
        //     };
        //  test.str = 'str : '+test.num;
        // (await test.refArray_of_test)?.update({ // NOT RESPONSE
        //     addId:[data.message||''],
        // })

        // model.update({
        //     id: '64d549c8aca468052865f52a',
        //     bigint: '1234567890',
        //     bool: true,
        //     num: (test.num||0) +1,
        //     //fileArray: [...(test.fileArray as UrlData[]), ...(file.imgProfile || []), defaultImage],
        //     numberMap: new Map<string, number>([['i1', test.num||0]]),
        //     stringMap: new Map<string, string>([['i1', 'str'+test.num]]),
        //     ojectData: {
        //         famille: '1',
        //         nombreuse: test.num||0,
        //         salut: 'cou cou'
        //     },
        //     refArray_of_test: [...(test.$cache.refArray_of_test||[]),{
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }],
        //     // ref_of_test:"64d4750902288907b2d09f6f",
        //     simpleArray: [...(test.simpleArray||[]),(test.simpleArray?.[test.simpleArray?.length||0]||0)+1],
        //     str: 'lol'+test.num

        // })

        // test.update({
        //     ref_of_test:data.message, 
        // }) 

        // const test = await model.create({
        //     bigint: '1234567890',
        //     bool: true,
        //     num: 10,
        //     fileArray: [...(file.imgProfile || []), defaultImage],
        //     numberMap: new Map<string, number>([['i1', 1]]),
        //     stringMap: new Map<string, string>([['i1', 'str']]),
        //     ojectData: {
        //         famille: '1',
        //         nombreuse: 10,
        //         salut: 'cou cou'
        //     },
        //     refArray_of_test: [{
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         }, {
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         }, {
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         }, {
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         }, {
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         }, {
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },{
        //             bigint: '1234567890',
        //             bool: true,
        //             num: 10,
        //             fileArray: [...(file.imgProfile || []), defaultImage],
        //             numberMap: new Map<string, number>([['i1', 1]]),
        //             stringMap: new Map<string, string>([['i1', 'str']]),
        //             ojectData: {
        //                 famille: '1',
        //                 nombreuse: 10,
        //                 salut: 'cou cou'
        //             },
        //             refArray_of_test: [],
        //             //ref_of_test:"64d4750902288907b2d09f6f",
        //             simpleArray: [1, 2, 3, 4],
        //             str: 'lol'
        //         },],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     }, {
        //         bigint: '1234567890',
        //         bool: true,
        //         num: 10,
        //         fileArray: [...(file.imgProfile || []), defaultImage],
        //         numberMap: new Map<string, number>([['i1', 1]]),
        //         stringMap: new Map<string, string>([['i1', 'str']]),
        //         ojectData: {
        //             famille: '1',
        //             nombreuse: 10,
        //             salut: 'cou cou'
        //         },
        //         refArray_of_test: [],
        //         //ref_of_test:"64d4750902288907b2d09f6f",
        //         simpleArray: [1, 2, 3, 4],
        //         str: 'lol'
        //     },],
        //     // ref_of_test:"64d4750902288907b2d09f6f",
        //     simpleArray: [1, 2, 3, 4],
        //     str: 'lol'
        // });

        // console.log('setProfile', { test });

        // const description = model.description;
        // console.log('setProfile', { description });

        // const AccountModel = await SQuery.createModel('account');
        // const account = await AccountModel.newInstance({
        //     id: "64cf94e7f55d6179677ab697"
        // });

        // console.log('setProfile', { account });

        // const arrayData = (await test?.refArray_of_Account)?.page();
        // model.newInstance()

        //    const collected = await  SQuery.collector({
        //     $option:{},
        //     account:['64cf7488a156038b076c730c','64cf7488a156038b076c7310','64cf7488a156038b076c7317']
        //    });

        //    console.log({...collected});

        // const account = await profile.newParentInstance<'account'>();
        // console.log('parentInstance ', { account });

        // if (!account) return
        // account.name = file?.imgProfile?.[0]?.fileName || 'no File';
    },
    setOpenAuth: (openAuth: 'login' | 'none' | 'signup') => {
        console.log(`%c setOpenAuth`, 'font-weight: bold; font-size: 20px;color: #345;', { openAuth });
        set(() => ({ openAuth }))
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
    fetchLoginManager: async (loginData?: { email: string, password: string }) => {
        console.log(`%c fetchLoginManager`, 'font-weight: bold; font-size: 20px;color: #345;', { ...loginData });
        let signupId = '';
        if (loginData) {
            const res = await SQuery.service('login', 'manager', loginData);
            console.log(res);
            if (!res?.response || !res?.response?.signup.id) return console.log(`%c ERROR`, 'font-weight: bold; font-size: 20px;color: #345;', { er: res.error });
            signupId = res?.response?.signup.id
        }

        const manager = loginData ? await SQuery.newInstance('manager', { id: signupId }) : await SQuery.currentClientInstance<'manager'>();
        if (!manager) return

        const account = await manager.account;
        if(!account) return
        //account.email = 'er@fghj.com'

        

        const messenger = await manager.messenger;
        //  if (!messenger) return
        const entreprise = await manager.entreprise;
        const account2 = await manager.account;
        console.log({ account2 });

        const profile = await manager.extractor<'profile'>('./account/profile');
        console.log({ profile });

        //const profile = await account2?.profile;
        const address = await account2?.address;

        const listener = async (_address: any) => {

        }

        profile?.getEmiter().All((v, e) => {
            console.log(`%c  SUPER LOG : `, 'background: #3455; ', e?.event);

        })
        address?.when('refresh', listener, 'ertyui');

        SQuery.bind({ manager, account2, profile }, set)

        eventEmiter.when('disconnect', () => {
            SQuery.unbind({ manager, account2, profile })
        })

        const r = SQuery.cacheFrom({
            messenger,
            account2,
            entreprise,
            address,
            manager,
            profile
        });



        set(({ }) => ({

            ...r,
        }));

    }
}))

