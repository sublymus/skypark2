import { configureStore, createSlice } from "@reduxjs/toolkit";
import { MainSclice } from "./Main/MainRedux";
import { AuthSclice } from "./Auth/AuthRedux";

const AppSclice = createSlice({
    name: 'app',
    initialState: {

        currentUser: {
            id: '',
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
        },
        page: 'main',
    },
    reducers: {
        setPage: (state, action) => {
            state.page = action.payload;
        }
    }
});

export const RootStore = configureStore({
    reducer: {
        app: AppSclice.reducer,
        main: MainSclice.reducer,
        auth: AuthSclice.reducer,
    }
})

export type RooState = ReturnType<typeof RootStore.getState>
export type RootDispatch = typeof RootStore.dispatch;
export const { setPage } = AppSclice.actions;