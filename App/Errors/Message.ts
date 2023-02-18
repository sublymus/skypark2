import { ContextSchema } from "../../lib/squery/Context"

const FR_MESSAGE = {
    BAD_AUTH: 'authentification non valider',
    BAD_AUTH_SOUCIES: 't\'as quel soucies',
    NOT_DELETED: 'pas supprimable'
}
const RU_MESSAGE = {
    BAD_AUTH: 'недействительная аутентификация',
    BAD_AUTH_SOUCIES: 'в чем твоя проблема',
    NOT_DELETED: 'недействительная'

}
const EN_MESSAGE = {
    BAD_AUTH: 'not valid authentification ',
    BAD_AUTH_SOUCIES: 'what\'s your probleme',
    NOT_DELETED: 'not deleted',
    NOT_FOUND: 'not found',
    ADRESS: 'adress',
    ACCOUNT: 'account',
    USER: 'user',
    UNAUTHORIZED: 'not authorized',
    FAVORITES: "favorites",
    NOT_CREATED: "not create",
    OPERATION_SUCCESS : "Operation successful",
    OPERATION_FAILED: "Operation failed"

}


const ALL_MESSAGE: any = {
    FR_MESSAGE,
    EN_MESSAGE,
    RU_MESSAGE
}

const Message = async (ctx: ContextSchema, code: string) => {
    // let language =  ctx.request.language(['fr', 'en', 'ru']);
    let language = "en";
    language = language ? 'en' : 'en'

    return ALL_MESSAGE[language?.toUpperCase() + '_MESSAGE'][code] || code
}
export default Message;
