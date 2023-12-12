import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { ResponseSchema } from "../../lib/squery/Initialize";
import { DiscussionController } from "../Models/DiscussionModel";
import { SQuery } from "../../lib/squery/SQuery";
import { Local } from "../../lib/squery/SQuery_init";
import { Controllers } from "../Tools/Controllers";


export const MessengerController = new SQuery.Controller({
    name: 'messenger',
    services: {
        i_saw: async (ctx: ContextSchema): ResponseSchema => { return },
        createDiscussion: async (ctx: ContextSchema): ResponseSchema => {
            const { receiverAccountId } = ctx.data
            const receiverAccount = await Local.ModelControllers['account'].model.findOne({ _id: receiverAccountId });
            Log('receiverAccount', receiverAccount)
            if (!receiverAccount) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "Receiver don't exist",
                    status: 404
                }
            }
            if (receiverAccountId == ctx.login.id) {
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
            Log('sender', sender);
            let discussion = await DiscussionController.model.findOne({
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
            let discussionId = discussion?._id.toString();

            Log('discussion_old', discussionId);

            let isNewDiscussion = false;
            if (!discussion) {
                const res = await DiscussionController.services.create({
                    ...ctx,
                    data: {
                        members: [],
                        account1: ctx.login.id,
                        account2: receiverAccountId,
                        isGroup: false,
                        channel: [],
                    }
                });
                discussionId = res?.response as string
                Log('discussion_new', discussionId);
                isNewDiscussion = true;
            }

            if (isNewDiscussion && discussionId) {
                const resExtractor = await Controllers.server.services.extractor({
                    ...ctx,
                    __permission: 'admin',
                    data: {
                        modelPath: 'account',
                        id: receiverAccountId,
                        extractorPath: '../messenger'
                    }
                });
                const instance = resExtractor?.response;
                Log('extractor', {instance});

                try {
                    const res = await Local.ModelControllers["discussion"]?.services['list']?.({
                        ...ctx,
                        __key: sender.__key.toString(),
                        __permission: 'admin',
                        data: {
                            addId: [discussionId],
                            paging: {
                                query: {
                                    __parentModel: "messenger_" + sender.messenger.toString() + "_listDiscussion_discussion"
                                }
                            }
                        }
                    });
                    Log('sender_LIST', res?.response);
                } catch (error) {
                    console.log(error);
                }
                const res2 = await Local.ModelControllers["discussion"]?.services['list']?.({
                    ...ctx,
                    __key: receiverAccount.__key.toString(),
                    __permission: 'admin',
                    data: {
                        addId: [discussionId],
                        paging: {
                            query: {
                                __parentModel: "messenger_" + instance.id.toString() + "_listDiscussion_discussion"
                            }
                        }
                    }
                })
                Log('receiver_LIST', res2?.response);
                console.log('@@@@@@@@@@discussion existe');

            } else if (discussionId) {
                const res = await Local.ModelControllers["discussion"]?.services['list']?.({
                    ...ctx,
                    __key: sender.__key.toString(),
                    __permission: 'admin',
                    data: {
                        paging: {
                            query: {
                                __parentModel: "messenger_" + sender.messenger.toString() + "_listDiscussion_discussion"
                            }
                        }
                    }
                });
                const items = res?.response.items;
                Log('sender_items', res?.response);
                if (Array.isArray(items)) {
                    const exist = items.find((v) => {
                        return v == discussion?.id.toString();
                    });
                    if (!exist) {
                        await Local.ModelControllers["discussion"]?.services['list']?.({
                            ...ctx,
                            __key: sender.__key.toString(),
                            __permission: 'admin',
                            data: {
                                addId: [discussionId],
                                paging: {
                                    query: {
                                        __parentModel: "messenger_" + sender.messenger.toString() + "_listDiscussion_discussion"
                                    }
                                }
                            }
                        });
                    }
                }
                Log('new_sender_items', res?.response);

            }
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: discussion && {
                    id: discussion?._id,
                    modelPath: "discussion"
                },
                status: 200
            }
        },

        removeDiscussion: async (ctx: ContextSchema): ResponseSchema => {
            try {
                const { discussionId } = ctx.data;
                const clientDisscussion = await Local.ModelControllers['discussion'].model.findOne({ _id: discussionId });
                if (clientDisscussion) {
                    const ctrl = DiscussionController;
                    const resDeleteDiscussion = await ctrl.services['list']?.({
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
                    const disscussion = await ctrl.model.findOne({ channel: clientDisscussion.channel });
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
















