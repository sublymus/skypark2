import Log from "sublymus_logger";
import { ContextSchema } from "./Context";
// import { ResultSchema } from "./Initialize";
export type StatusType =
    '100:Continue' |
    '101:Switching_Protocols' |
    '102:Processing' |
    '103:Early_Hints_Experimental' |
    '200:OK' |
    '201:Created' |
    '202:Accepted' |
    '203:Non - Authoritative_Information' |
    '204:No_Content' |
    '205:Reset_Content' |
    '206:Partial_Content' |
    '207:Multi - Status' |
    '208:Already_Reported' |
    '226:IM_Used' |
    '300:Multiple_Choices' |
    '301:Moved_Permanently' |
    '302:Found' |
    '303:See_Other' |
    '304:Not_Modified' |
    '307:Temporary_Redirect' |
    '308:Permanent_Redirect' |
    '400:Bad_Request' |
    '401:Unauthorized' |
    '402:Payment_Required' |
    '403:Forbidden' |
    '404:Not_Found' |
    '405:Method_Not_Allowed' |
    '406:Not_Acceptable' |
    '407:Proxy_Authentication_Required' |
    '408:Request_Timeout' |
    '409:Conflict' |
    '410:Gone' |
    '411:Length_Required' |
    '412:Precondition_Failed' |
    '413:Content_Too_Large' |
    '414:URI_Too_Long' |
    '415:Unsupported_Media_Type' |
    '416:Range_Not_Satisfiable' |
    '417:Expectation_Failed' |
    '418:I\'m_a_teapot' |
    '421:Misdirected_Request' |
    '422:Unprocessable_Content' |
    '423:Locked' |
    '424:Failed_Dependency' |
    '425:Too_Early' |
    '426:Upgrade_Required' |
    '428:Precondition_Required' |
    '429:Too_Many_Requests' |
    '431:Request_Header_Fields_Too_Large' |
    '451:Unavailable_For_Legal_Reasons' |
    '500:Internal_Server_Error' |
    '501:Not_Implemented' |
    '502:Bad_Gateway' |
    '503:Service_Unavailable' |
    '504:Gateway_Timeout' |
    '505:HTTP_Version_Not_Supported' |
    '506:Variant_Also_Negotiates' |
    '507:Insufficient_Storage' |
    '508:Loop_Detected' |
    '510:Not_Extended' |
    '511:Network_Authentication_Required'


export type ErrorCaseSchema = {
    response?: any;
    error: string;
};

export type successCaseSchema = {
    response: any;
    error?: string;
};
export type StatusSchema = {
    status: StatusType,
}

export type ResultSchema = (successCaseSchema | ErrorCaseSchema) & StatusSchema;
type checkFunType = (ctx: ContextSchema , ...args: Array<any>) => ResultSchema | undefined | boolean
type VALUEType<F> = F extends (ctx: ContextSchema, ...args: infer V) => any ? V : any;
export function createBreaker<NAME extends string, F extends checkFunType, VALUE extends VALUEType<F>>(option: { name: NAME, check: F }) {
    //@ts-ignore
    const fun: {
        [key in NAME]: (ctx: ContextSchema, ...value: VALUE) => boolean;
    } = {
        [option.name as NAME]: (ctx: ContextSchema, ...value: VALUE) => {
            const res = option.check(ctx, ...value);
            const error = new Error('@**@');
            
            console.log('&&&',res);
            Log('TYPE_OF',option.name ,typeof res == 'boolean', typeof res == 'undefined')
            const canThrow = !(typeof res == 'boolean' || typeof res == 'undefined')
            if (canThrow) {
                throw new Error(JSON.stringify({
                    response:res.response,
                    error:res.error,
                    status:res.status,
                    debug:error
                }))
            }else{
                return res
            }
        }
    }
    return fun
}











































