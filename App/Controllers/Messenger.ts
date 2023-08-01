import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { CtrlManager } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ResponseSchema } from "../../lib/squery/Initialize";
import DiscussionModel from "../Models/DiscussionModel";
import AccountModel from "../Models/AccountModel";
import mongoose, { mongo } from "mongoose";
const messenger: ControllerSchema = {
    i_saw: async (ctx: ContextSchema): ResponseSchema => { return },
    createDiscussion: async (ctx: ContextSchema): ResponseSchema => {
        const { receiverAccountId } = ctx.data
        const receiverAccount = await ModelControllers['account'].option.model.findOne({ _id: receiverAccountId });
        if (!receiverAccount) {
            return {
                error: "NOT_FOUND",
                code: "NOT_FOUND",
                message: "Receiver don't exist",
                status: 404
            }
        }

        if (receiverAccountId == ctx.signup.id) {
            return {
                error: "NOT_FOUND",
                code: "NOT_FOUND",
                message: "another account required",
                status: 404
            }
        }

        /** on recupere le  sender(UserModel)*/
        const sender = await ModelControllers[ctx.signup.modelPath].option.model.findOne({ _id: ctx.signup.id });
        if (!sender) {
            return {
                error: "NOT_FOUND",
                code: "NOT_FOUND",
                message: "sender don't exist",
                status: 404
            }
        }

        const discussion = await DiscussionModel.findOne({
            $or: [{
                'account1': receiverAccountId,
                'account2': ctx.login.id,
                isGroup: false,
            }, {
                'account1': ctx.login.id,
                'account2': receiverAccountId,
                isGroup: false
            }]
        });
        console.log('@@@@@@@@discussion', { discussion });

        if (discussion) {
            const res = await ModelControllers["discussion"]()['list']?.({
                ...ctx,
                __key: sender.__key.toString(),
                __permission: 'admin',
                data: {
                    addId: [(discussion._id as string).toString()],
                    paging: {
                        query: {
                            __parentModel: "messenger_" + sender.messenger.toString() + "_listDiscussion_discussion"
                        }
                    }
                }
            })
            console.log('@@@@@@@@@@discussion existe');
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: {
                    id: discussion._id,
                    modelPath: "discussion"
                },
                status: 200
            }
        }

        const resExtractor = await Controllers['server']()['extractor']({
            ...ctx,
            __key: receiverAccount.__key.toString(),
            __permission: 'admin',
            data: {
                modelPath: 'account',
                id: receiverAccountId,
                extractorPath: '../messenger'
            }
        });

        console.log('resExtractor', { resExtractor });

        if (!resExtractor?.response) {
            return resExtractor
        }
        console.log('sender', sender.messenger.toString());

        const res = await ModelControllers["discussion"]()['list']?.({
            ...ctx,
            __key: sender.__key.toString(),
            __permission: 'admin',
            data: {
                addNew: [{
                    members: [receiverAccountId, sender.account.toString()],
                    'account1':  ctx.login.id,
                    'account2': receiverAccountId,
                    isGroup: false,
                    channel: [],
                }],
                paging: {
                    query: {
                        __parentModel: "messenger_" + sender.messenger.toString() + "_listDiscussion_discussion"
                    }
                }
            }
        })

        console.log('res', res);

        if (!res?.response) {
            return res
        }
        console.log('added', res.response.added);
        if (!res.response.added[0]) {
            return;
        }


        const res2 = await ModelControllers["discussion"]()['list']?.({
            ...ctx,
            __key: receiverAccount.__key.toString(),
            __permission: 'admin',
            data: {
                addId: [res.response.added[0]],
                paging: {
                    query: {
                        __parentModel: "messenger_" + resExtractor.response.id.toString() + "_listDiscussion_discussion"
                    }
                }
            }
        })

        console.log('res2', res2);


        if (!res2?.response) {
            return res2
        }

        return {
            code: "OPERATION_SUCCESS",
            message: "OPERATION_SUCCESS",
            response: {
                id: res.response.added[0],
                modelPath: "discussion"
            },
            status: 200
        }
    },

    removeDiscussion: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const { discussionId } = ctx.data;
            const clientDisscussion = await ModelControllers['discussion'].option.model.findOne({ _id: discussionId });
            if (clientDisscussion) {
                const ctrl = ModelControllers['discussion']();
                const resDeleteDiscussion = await ModelControllers["discussion"]()['list']?.({
                    ...ctx,
                    data: {
                        remove: [discussionId],
                        paging: {
                            query: {
                                __parentModel: clientDisscussion.__parentModel,
                            }
                        }
                    }
                });
                if (!resDeleteDiscussion?.response) {
                    Log('ERROR_resDeleteDiscussion', resDeleteDiscussion);
                    return resDeleteDiscussion;
                }
                const disscussion = await ModelControllers['discussion'].option.model.findOne({ channel: clientDisscussion.channel });
                if (!disscussion) {
                    const channel = await ModelControllers['channel'].option.model.findOne({ id: clientDisscussion.channel });
                    if (channel) {
                        const resDeleteChannel = await (ctrl.delete || ctrl.destroy)?.({
                            ...ctx,
                            __key: channel.__key,
                            __permission: 'admin',
                            data: {
                                id: channel._id,
                            }
                        });
                        if (!resDeleteChannel?.response) Log('ERROR_resDeleteChannel', resDeleteChannel);
                    }

                }
            }
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: 0,
                status: 200
            }
        } catch (error: any) {
            return {
                error: "OPERATION_FAILED2",
                status: 404,
                code: "OPERATION_FAILED",
                message: error.message
            }
        }
    }

}

CtrlManager({
    ctrl: { messenger },
    access: {
        createDiscussion: "any"
    }
})


















