import {StoreDevtoolsModule} from "@ngrx/store-devtools";
export const environment = {
    production: false,
    hmr: true,
    imports: [
        StoreDevtoolsModule.instrumentStore({maxAge: 2}),
    ]
};