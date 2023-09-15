import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import {   ResponseSchema } from "../../lib/squery/Initialize";
import {DiscussionController} from "../Models/DiscussionModel";
import { SQuery } from "../../lib/squery/SQuery";
import { Local } from "../../lib/squery/SQuery_init";


export const MessengerController = new SQuery.Controller({
    name:'messenger',
    services:  {
        i_saw: async (ctx: ContextSchema): ResponseSchema => { return },
        createDiscussion: async (ctx: ContextSchema): ResponseSchema => {
            const { receiverAccountId } = ctx.data
            const receiverAccount = await Local.ModelControllers['account'].model.findOne({ _id: receiverAccountId });
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
            const sender = await Local.ModelControllers[ctx.signup.modelPath].model.findOne({ _id: ctx.signup.id });
            if (!sender) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "sender don't exist",
                    status: 404
                }
            }
    
            const discussion = await DiscussionController.model.findOne({
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
                const res = await Local.ModelControllers["discussion"]?.services['list']?.({
                    ...ctx,
                    __key: sender.__key.toString(),
                    __permission: 'admin',
                    data: {
                        addId: [discussion._id.toString()],
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
        },
    
        removeDiscussion: async (ctx: ContextSchema): ResponseSchema => {
            try {
                const { discussionId } = ctx.data;
                const clientDisscussion = await Local.ModelControllers['discussion'].model.findOne({ _id: discussionId });
                if (clientDisscussion) {
                    const ctrl =Local. ModelControllers['discussion'];
                    const resDeleteDiscussion = await Local.ModelControllers["discussion"]?.services['list']?.({
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
                    const disscussion = await Local.ModelControllers['discussion'].model.findOne({ channel: clientDisscussion.channel });
                    if (!disscussion) {
                        const channel = await Local.ModelControllers['channel'].model.findOne({ id: clientDisscussion.channel });
                        if (channel) {
                            const resDeleteChannel = await ctrl?.services.delete({
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
    
    },
    
})
















