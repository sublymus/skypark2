import Log from "sublymus_logger";
import { ContextSchema } from "../../lib/squery/Context";
import { SaveCtrl } from "../../lib/squery/CtrlManager";
import { ControllerSchema, Controllers, ModelControllers, ResponseSchema } from "../../lib/squery/Initialize";

const Messenger: ControllerSchema = {
    i_saw:  async (ctx: ContextSchema): ResponseSchema => {return},
    createDiscussion: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const { receiverId } = ctx.data;
            /** on recupere le  receiverAccount*/
            const receiverAccount = await ModelControllers['account'].option.model.findOne({ _id: receiverId });
            if (!receiverAccount) {
                return {
                    error: "NOT_FOUND",
                    code: "NOT_FOUND",
                    message: "Receiver don't exist",
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
            /** on recupere le  channel*/
            const discussion = await ModelControllers['discussion'].option.model.findOne({ receiver: receiverId, sender: ctx.login.id });
            let channel: any;
            if (!discussion) {

                const resChannel = await ModelControllers['channel']()['create']({
                    ...ctx,
                    data: {
                        name: "Channel",
                        description: "",
                        vectors: [],
                        users: []
                    }
                });

                if (resChannel.error) return resChannel;
                channel = resChannel.response.toString();
            } else {
                channel = discussion.channel.toString();
            }
            if (!channel) return {
                error: "CHANNEL_CREATION_FAILED",
                code: "CHANNEL_CREATION_FAILED",
                message: "CHANNEL_CREATION_FAILEDt",
                status: 404
            }
            /** si le sender ne dispose pas d'une discussion avec le receiver on le cree*/
            const senderDiscussion = await ModelControllers['discussion'].option.model.findOne({ __key: ctx.__key, receiver: receiverId, sender: ctx.login.id });
            if (!senderDiscussion) {
                const res = await ModelControllers["discussion"]()['list']({
                    ...ctx,
                    data: {
                        addNew: [{
                            receiver: receiverId,
                            sender: sender.account.toString(),
                            channel: channel,
                        }],
                        paging: {
                            query: {
                                __parentModel: "messenger_" + sender.messenger.toString() + "_listDiscussion_discussion"
                            }
                        }
                    }
                });
                if (res.error) return res
            }
            const receiverDiscussion = await ModelControllers['discussion'].option.model.findOne({ __key: receiverAccount.__key.toString(), receiver: receiverId, sender: ctx.login.id });
            if (!receiverDiscussion) {
                const resExtractor = await Controllers['server']()['extractor']({
                    ...ctx,
                    __key: receiverAccount.__key.toString(),
                    __permission: receiverAccount.__permission,
                    data: {
                        modelPath: 'account',
                        id: receiverId,
                        extractorPath: '../messenger'
                    }
                })
                if (resExtractor.error) {
                    return resExtractor
                }
                const res = await ModelControllers["discussion"]()['list']({
                    ...ctx,
                    __key: receiverAccount.__key,
                    __permission: receiverAccount.__permission,
                    data: {
                        addNew: [{
                            receiver: receiverId,
                            sender: sender.account.toString(),
                            channel: channel,
                        }],
                        paging: {
                            query: {
                                __parentModel: "messenger_" + resExtractor.response.id + "_listDiscussion_discussion"
                            }
                        }
                    }
                });

                if (res.error) return res
            }
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: {
                    id: channel,
                    modelPath: "channel"
                },
                status: 200
            }
        } catch (error) {
            return {
                error: "Messenger.createDiscussion:ERROR",
                status: 404,
                code: "OPERATION_FAILED",
                message: error.message
            }
        }
    },

    removeDiscussion: async (ctx: ContextSchema): ResponseSchema => {
        try {
            const { discussionId } = ctx.data;
            const clientDisscussion = await ModelControllers['discussion'].option.model.findOne({ _id: discussionId });
            if (clientDisscussion) {
                const ctrl = ModelControllers['discussion']();
                const resDeleteDiscussion = await ModelControllers["discussion"]()['list']({
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
                if (resDeleteDiscussion.error) {
                    Log('ERROR_resDeleteDiscussion', resDeleteDiscussion);
                    return resDeleteDiscussion;
                }
                const disscussion = await ModelControllers['discussion'].option.model.findOne({ channel: clientDisscussion.channel });
                if (!disscussion) {
                    const channel = await ModelControllers['channel'].option.model.findOne({ id: clientDisscussion.channel });
                    if (channel) {
                        const resDeleteChannel = await (ctrl.delete || ctrl.destroy)({
                            ...ctx,
                            __key: channel.__key,
                            __permission:'admin',
                            data: {
                                id: channel._id,
                            }
                        });
                        if (resDeleteChannel.error) Log('ERROR_resDeleteChannel', resDeleteChannel);
                    }

                }
            }
            return {
                code: "OPERATION_SUCCESS",
                message: "OPERATION_SUCCESS",
                response: 0,
                status: 200
            }
        } catch (error) {
            return {
                error: "OPERATION_FAILED2",
                status: 404,
                code: "OPERATION_FAILED",
                message: error.message
            }
        }
    }

}

const ctrlMaker = SaveCtrl({
    ctrl: { Messenger },
    access: {
        createDiscussion: "any"
    }
})


ctrlMaker.pre('createDiscussion', async (e) => {})
ctrlMaker.post('createDiscussion', async (e) => {})



















