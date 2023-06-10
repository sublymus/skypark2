import { configureStore, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import SQuery from "../lib/SQueryClient";
import { SQueryType } from "../SQreryType";

export const fetchLoginManager = createAsyncThunk(
    'auth/fetchLoginManager',
    async (loginData: { email: string, password: string }, thunkAPI) => {
        const res = await SQuery.service<typeof SQueryType.login>('login', 'manager', loginData);
        if (!res?.response || !res?.response?.signup.id) {
            return console.log('ERROR Loging : res=> ', res);
        }
        const manager = await SQuery.newInstance('manager', { id: res?.response?.signup.id });
        if (!manager) {
            return console.log('ERROR manager : res=> ', res);
        }
        const account = await manager.account;
        if (!account) {
            return console.log('ERROR account : res=> ', res);
        }
        const entreprise = await manager.entreprise;
        if (!entreprise) {
            return console.log('ERROR entreprise : res=> ', res);
        }
        console.log({ manager, account, entreprise });

        return manager.$cache
    }
)

const _manager: any = {
    id: '',
    messenger: {
        discussions: []
    },
    account: {
        name: "baron",
        email: "sublymus@gmail.com",
        password: "azert",
        telephone: "12345678",
        status: "property",
        address: {
            location: "l:567455;h45678654",
            room: 45,
            padiezd: 5,
            etage: 4,
            description: "je suis ici",
            city: "Rostov on don",
        },
        profile: {
            imgProfile: 'https://source.unsplash.com/random/?Cryptocurrency&1',
            banner: 'https://source.unsplash.com/random/?Cryptocurrency&1',
            message: "*** BEST ****",
        }
    }
}

const initManager: typeof _manager | null = null;


export const AuthSclice = createSlice({
    name: 'auth',

    initialState: {
        openAuth: 'signup' as string,
        currentManager: initManager,
        loading: false,
        success: false,
    },
    reducers: {
        setOpenAuth: (state, action) => {
            state.openAuth = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchLoginManager.fulfilled, (state, action) => {
            state.currentManager = action.payload
            state.loading = false;
            state.success = true;
        })
        
        builder.addCase(fetchLoginManager.pending, (state, action) => {
            state.loading = true;
        })
        
        builder.addCase(fetchLoginManager.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
        })
    },
});

export const { setOpenAuth } = AuthSclice.actions;