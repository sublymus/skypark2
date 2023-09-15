import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { ResultSchema } from "../../lib/squery/Initialize";
import { createBreaker } from "../../lib/squery/SQuery_breaker";

const { EXIST_BREAKER: existBreaker } = createBreaker({
    name: 'EXIST_BREAKER',
    check: (ctx, value: any, message?: string) => {
        if (value) {
            return true
        } else {
            return {
                status: '404:Not_Found',
                error: message || "value don't exist`",
            }
        }
    }
})
function EXIST_BREAKER(ctx: ContextSchema, value: any, message?: string): value is Object {
    const l =  existBreaker(ctx, value, message);
    Log('wertyui',l)
    return l;
}

const { ACCESS_BREAKER } = createBreaker({
    name: 'ACCESS_BREAKER',
    check: (ctx, models: string[]) => {
        if (!models.includes(ctx.signup.modelPath))
            return {
                error: 'manager Or admin',
                status: "100:Continue",
            }

    }
})

const { RESULT_ERROR_BREAKER } = createBreaker({
    name: 'RESULT_ERROR_BREAKER',
    check: (ctx, result: ResultSchema) => {
        if (!result?.response)
            return {
                error: result.error || "Server_Error",
                status: "500:Internal_Server_Error",
            }

    }
})
const { COMPARE_BREAKER } = createBreaker({
    name: 'COMPARE_BREAKER',
    check: (ctx, A: any, B: any, fun?: (ctx: ContextSchema, A: any, B: any) => boolean | ResultSchema | undefined) => {
        if (!fun)
            return A == B

    }
})
const { BREAKER } = createBreaker({
    name: 'BREAKER',
    check: (ctx, message: string) => {
        return {
            error: message,
            status: "500:Internal_Server_Error",
        }

    }
})
const { RESPONSE_BREAKER } = createBreaker({
    name: 'RESPONSE_BREAKER',
    check: (ctx, response: any) => {
        if (!(response ?? false)) {
            return {
                status: '404:Not_Found',
                error: "response don't exist`",
            }
        }
        return {
            response,
            status: "200:OK",
        }

    }
})
export { EXIST_BREAKER, ACCESS_BREAKER, RESULT_ERROR_BREAKER, COMPARE_BREAKER, BREAKER, RESPONSE_BREAKER }