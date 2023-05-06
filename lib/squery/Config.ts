export interface ConfigInterface {
    execDir: string[],
    afterExec?: string[],//TODO
    beforeExec?: string[],//TODO
    rootDir:string,
    DB_KEY?: string,
    TOKEN_KEY?: string,
    URL_KEY?: string,
}
let _conf :any= {
    execDir: [],
    afterExec: [],//TODO
    beforeExec: [],//TODO
    rootDir: '',
    DB_KEY: 'a',
    TOKEN_KEY: 'a',
    URL_KEY: 'a',
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
