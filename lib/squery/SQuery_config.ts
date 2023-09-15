export interface ConfigInterface {
    execDir?: string[],
    afterExec?: string[],//TODO
    beforeExec?: string[],//TODO
    fileDir?:string[],
    rootDir:string,
    DB_KEY?: string,
    TOKEN_KEY?: string,
    URL_KEY?: string,
    IO_CORS?:{
        maxAge?: 0,
        origin?:string|string[],
        allowedHeaders?:string|string[],
        credentials?:boolean,
        exposedHeaders?:string|string[],
        methods?:string|string[],
        optionsSuccessStatus?:number,
        preflightContinue?:boolean
    }
}
export const  defaultConfig :ConfigInterface= {
    execDir:[],
    afterExec: [],//TODO
    beforeExec: [],//TODO
    fileDir:['fs'],
    rootDir: '',
    DB_KEY: 'a',
    TOKEN_KEY: 'a',
    URL_KEY: 'a',
    IO_CORS:{}
} as any as ConfigInterface