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
let _conf :any= {
    execDir: ["/App/Models", "/App/Controllers", "/App/Tools", "/Start"],
    afterExec: [],//TODO
    beforeExec: [],//TODO
    fileDir:['fs'],
    rootDir: '',
    DB_KEY: 'a',
    TOKEN_KEY: 'a',
    URL_KEY: 'a',
    IO_CORS:{}
} 
type ConfigType = {
    get conf() : ConfigInterface,
    set conf(conf:ConfigInterface)  
}
export const Config: ConfigType ={
    get conf() {
        return _conf as ConfigInterface
    },
    set conf(conf:ConfigInterface){
        _conf = {
            ..._conf,
            ...conf
        }
    }
 }
