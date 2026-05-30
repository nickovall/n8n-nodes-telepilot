"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelePilot = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const TelePilotNodeConnectionManager_1 = require("./TelePilotNodeConnectionManager");
const common_descriptions_1 = require("./common.descriptions");
const debug = require('debug')('telepilot-node');
class TelePilot {
    constructor() {
        this.description = {
            displayName: 'Telegram CoPilot',
            name: 'telePilot',
            icon: 'file:TelePilot.svg',
            group: ['transform'],
            version: 1,
            description: 'Your Personal Telegram CoPilot',
            defaults: {
                name: 'Telegram CoPilot',
            },
            credentials: [
                {
                    name: 'telePilotApi',
                    required: true,
                },
            ],
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                common_descriptions_1.optionResources,
                common_descriptions_1.operationLogin,
                common_descriptions_1.operationUser,
                common_descriptions_1.operationContact,
                common_descriptions_1.operationGroup,
                common_descriptions_1.operationChat,
                common_descriptions_1.operationMessage,
                common_descriptions_1.operationFile,
                common_descriptions_1.operationCustom,
                common_descriptions_1.variable_user_id,
                common_descriptions_1.variable_force,
                common_descriptions_1.variable_chat_id,
                common_descriptions_1.variable_from_chat_id,
                common_descriptions_1.variable_is_marked_as_unread,
                common_descriptions_1.variable_from_message_id,
                common_descriptions_1.variable_limit,
                common_descriptions_1.variable_message_ids,
                common_descriptions_1.variable_message_id,
                common_descriptions_1.variable_message_force_read,
                common_descriptions_1.variable_messageText,
                common_descriptions_1.variable_local_photo_path,
                common_descriptions_1.variable_photo_caption,
                common_descriptions_1.variable_audio_path,
                common_descriptions_1.variable_audio_file_path,
                common_descriptions_1.variable_audio_caption,
                common_descriptions_1.variable_video_photo_path,
                common_descriptions_1.variable_file_path,
                common_descriptions_1.variable_file_caption,
                common_descriptions_1.variable_audio_binary_property_name,
                common_descriptions_1.variable_send_as_voice,
                common_descriptions_1.variable_revoke,
                common_descriptions_1.variable_username,
                common_descriptions_1.variable_query,
                common_descriptions_1.variable_title,
                common_descriptions_1.variable_message_thread_id,
                common_descriptions_1.variable_description,
                common_descriptions_1.variable_is_channel,
                common_descriptions_1.variable_user_ids,
                common_descriptions_1.variable_chat_action,
                common_descriptions_1.variable_url,
                common_descriptions_1.variable_video_duration,
                common_descriptions_1.variable_video_width,
                common_descriptions_1.variable_video_height,
                common_descriptions_1.variable_video_supports_streaming,
                common_descriptions_1.variable_thumbnail_width,
                common_descriptions_1.variable_thumbnail_height,
                common_descriptions_1.variable_thumbnail_file_path,
                common_descriptions_1.variable_json,
                common_descriptions_1.variable_file_id,
                common_descriptions_1.variable_remote_file_id,
                common_descriptions_1.variable_reply_to_msg_id,
                common_descriptions_1.variable_supergroup_id,
                common_descriptions_1.variable_audio_binary_property_name,
                common_descriptions_1.variable_send_as_voice
            ],
        };
    }
    async execute() {
        var _a;
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        const credentials = await this.getCredentials('telePilotApi');
        const cM = typedi_1.Container.get(TelePilotNodeConnectionManager_1.TelePilotNodeConnectionManager);
        const apiId = credentials === null || credentials === void 0 ? void 0 : credentials.apiId;
        debug('Executing telePilot node, resource=' + resource + ', operation=' + operation);
        let result;
        let client;
        if (resource === 'login') {
            if (operation === 'login') {
                const loginWithPhoneNumberHelpCommand = () => {
                    return {
                        text: "Following commands are supported:\n\n" +
                            "/start - start login via Phone Number and code (MFA is also supported if set)\n" +
                            "/stop - terminates current ClientSession for this Credential\n" +
                            "/clear - deletes local tdlib database, new login is required\n" +
                            "/cred - shows which Telegram Credential is used in this ChatTrigger (name + apiId, apiHash, phoneNumber)\n" +
                            "/stat - print all open Telegram sessions"
                    };
                };
                debug('loginWithPhoneNumber');
                const items = this.getInputData();
                const message = items[0].json['chatInput'];
                debug("message received: " + message);
                if (message === undefined) {
                    returnData.push({
                        compatibility: "QR-Code login is disabled starting from version 0.3.0",
                        doc: "Please connect ChatTrigger to this node and read instructions:",
                        url: "https://telepilot.co/login-howto"
                    });
                }
                else if (message.startsWith("/")) {
                    switch (message) {
                        case "/start":
                            let authState = cM.getAuthStateForCredential(apiId);
                            debug("loginWithPhoneNumber./start.authState: " + authState);
                            if (authState == TelePilotNodeConnectionManager_1.TelepilotAuthState.NO_CONNECTION) {
                                await cM.createClientSetAuthHandlerForPhoneNumberLogin(apiId, credentials === null || credentials === void 0 ? void 0 : credentials.apiHash, credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber);
                                authState = cM.getAuthStateForCredential(apiId);
                                debug("loginWithPhoneNumber./start2.authState: " + authState);
                                if (authState == TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_CODE) {
                                    returnData.push("Please provide AuthCode:");
                                }
                                else if (authState == TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_PASSWORD) {
                                    returnData.push("MFA Password:");
                                }
                            }
                            switch (authState) {
                                case TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_PHONE_NUMBER:
                                    await cM.clientLoginWithPhoneNumber(apiId, credentials === null || credentials === void 0 ? void 0 : credentials.apiHash, credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber);
                                    await (0, TelePilotNodeConnectionManager_1.sleep)(1000);
                                    authState = cM.getAuthStateForCredential(apiId);
                                    if (authState == TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_CODE) {
                                        returnData.push("Please provide AuthCode:");
                                    }
                                    else if (authState == TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_READY) {
                                        returnData.push("You have succesfully logged in. You can close this chat and start using Telepilot.");
                                    }
                                    else {
                                        returnData.push("Unexpected authState: " + authState);
                                    }
                                    break;
                                case TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_READY:
                                    returnData.push("You are logged in with phoneNumber " + (credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber));
                                    break;
                                default:
                                    debug("unexpected authState=" + authState);
                                    returnData.push("unexpected authState=" + authState);
                                    break;
                            }
                            break;
                        case "/stop":
                            await cM.closeLocalSession(apiId);
                            returnData.push("Telegram Account " + (credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber) + " disconnected.");
                            break;
                        case "/clear":
                            await cM.deleteLocalInstance(apiId);
                            returnData.push({
                                text: "Telegram Account disconnected, local session has been cleared. Please login again. " +
                                    "Please check our guide at https://telepilot.co/login-howto"
                            });
                            break;
                        case "/cred":
                            returnData.push({
                                apiId,
                                apiHash: "[REDACTED]",
                                phoneNumber: credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber,
                            });
                            break;
                        case "/help":
                            returnData.push(loginWithPhoneNumberHelpCommand());
                            break;
                        case "/stat":
                            returnData.push(cM.getAllClientSessions());
                            break;
                        default:
                            returnData.push("Command not supported." + loginWithPhoneNumberHelpCommand());
                            break;
                    }
                }
                else {
                    let authState = cM.getAuthStateForCredential(apiId);
                    debug("loginWithPhoneNumber.authState: " + authState);
                    switch (authState) {
                        case TelePilotNodeConnectionManager_1.TelepilotAuthState.NO_CONNECTION:
                            returnData.push({
                                text: "Unexpected command. Please refer to https://telepilot.co/login-howto or try /help command\n"
                            });
                            break;
                        case TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_CODE:
                            const code = message;
                            await cM.clientLoginSendAuthenticationCode(apiId, code);
                            await (0, TelePilotNodeConnectionManager_1.sleep)(1000);
                            authState = cM.getAuthStateForCredential(apiId);
                            if (authState == TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_PASSWORD) {
                                returnData.push("MFA Password:");
                            }
                            else if (authState == TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_READY) {
                                returnData.push("You have succesfully logged in. You can close this chat and start using Telepilot.");
                            }
                            else {
                                returnData.push("Unexpected authState: " + authState);
                            }
                            break;
                        case TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_PASSWORD:
                            const password = message;
                            await cM.clientLoginSendAuthenticationPassword(apiId, password);
                            await (0, TelePilotNodeConnectionManager_1.sleep)(1000);
                            returnData.push("authState:" + cM.getAuthStateForCredential(apiId));
                            break;
                        case TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_READY:
                            returnData.push("You are logged in with phoneNumber " + (credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber));
                            break;
                        default:
                            debug("unexpected authState=" + authState);
                            returnData.push("unexpected authState=" + authState);
                            break;
                    }
                }
            }
            else if (operation === 'closeSession') {
                try {
                    await cM.closeLocalSession(apiId);
                }
                catch (e) {
                    throw e;
                }
                returnData.push("Telegram Account " + (credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber) + " disconnected.");
            }
            else if (operation === 'removeTdDatabase') {
                result = await cM.deleteLocalInstance(apiId);
                returnData.push({
                    text: "Telegram Account disconnected, local session has been cleared.\nPlease login again. Please check our guide at https://telepilot.co/login-howto\n" +
                        "Or use /help"
                });
            }
        }
        else {
            const clientSession = await cM.createClientSetAuthHandlerForPhoneNumberLogin(apiId, credentials === null || credentials === void 0 ? void 0 : credentials.apiHash, credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber);
            debug("clientSession.authState=" + clientSession.authState);
            if (clientSession.authState != TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_READY) {
                await cM.closeLocalSession(apiId);
                if (this.continueOnFail()) {
                    returnData.push({ json: {
                            message: "Telegram account not logged in. " +
                                "Please use ChatTrigger node together with loginWithPhoneNumber action. " +
                                "Please check our guide at https://telepilot.co/login-howto or use /help command in Chat Trigger Node",
                            error: {
                                _: "error",
                                code: -1,
                                message: "Please login"
                            }
                        } });
                    return [this.helpers.returnJsonArray(returnData)];
                }
                else {
                    throw new Error("Please login: https://telepilot.co/login-howto");
                }
            }
            else {
                client = clientSession.client;
            }
        }
        try {
            if (resource === 'user') {
                if (operation === 'getMe') {
                    const result = await client.invoke({
                        _: 'getMe',
                    });
                    returnData.push(result);
                }
                else if (operation === 'getUser') {
                    const user_id = this.getNodeParameter('user_id', 0);
                    result = await client.invoke({
                        _: 'getUser',
                        user_id,
                    });
                    returnData.push(result);
                }
                else if (operation === 'getUserFullInfo') {
                    const user_id = this.getNodeParameter('user_id', 0);
                    result = await client.invoke({
                        _: 'getUserFullInfo',
                        user_id,
                    });
                    returnData.push(result);
                }
                else if (operation === 'createPrivateChat') {
                    const user_id = this.getNodeParameter('user_id', 0);
                    const force = this.getNodeParameter('force', 0);
                    result = await client.invoke({
                        _: 'createPrivateChat',
                        user_id,
                        force,
                    });
                    returnData.push(result);
                }
                else if (operation === 'createNewSecretChat') {
                    const user_id = this.getNodeParameter('user_id', 0);
                    result = await client.invoke({
                        _: 'createNewSecretChat',
                        user_id,
                    });
                    returnData.push(result);
                }
            }
            else if (resource === 'contact') {
                if (operation === 'getContacts') {
                    result = await client.invoke({
                        _: 'getContacts',
                    });
                    returnData.push(result);
                }
            }
            else if (resource === 'chat') {
                if (operation === 'getChatHistory') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const from_message_id = this.getNodeParameter('from_message_id', 0);
                    const limit = this.getNodeParameter('limit', 0);
                    result = await client.invoke({
                        _: 'getChatHistory',
                        chat_id,
                        from_message_id,
                        offset: 0,
                        limit,
                        only_local: false,
                    });
                    returnData.push(result);
                }
                else if (operation === 'getChats') {
                    const result = await client.invoke({
                        _: 'getChats',
                        limit: 9999,
                    });
                    returnData.push(result);
                }
                else if (operation === 'getChat') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const result = await client.invoke({
                        _: 'getChat',
                        chat_id,
                    });
                    returnData.push(result);
                }
                else if (operation === 'searchPublicChat') {
                    const username = this.getNodeParameter('username', 0);
                    const result = await client.invoke({
                        _: 'searchPublicChat',
                        username,
                    });
                    debug(username);
                    debug(result);
                    returnData.push(result);
                }
                else if (operation === 'searchPublicChats') {
                    const query = this.getNodeParameter('query', 0);
                    const result = await client.invoke({
                        _: 'searchPublicChats',
                        query,
                    });
                    debug(query);
                    debug(result);
                    returnData.push(result);
                }
                else if (operation === 'joinChat') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const result = await client.invoke({
                        _: 'joinChat',
                        chat_id,
                    });
                    debug(chat_id);
                    debug(result);
                    returnData.push(result);
                }
                else if (operation === 'openChat') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const result = await client.invoke({
                        _: 'openChat',
                        chat_id,
                    });
                    debug(chat_id);
                    debug(result);
                    returnData.push(result);
                }
                else if (operation === 'closeChat') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const result = await client.invoke({
                        _: 'closeChat',
                        chat_id,
                    });
                    debug(chat_id);
                    debug(result);
                    returnData.push(result);
                }
                else if (operation === 'toggleChatIsMarkedAsUnread') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const is_marked_as_unread = this.getNodeParameter('is_marked_as_unread', 0);
                    const result = await client.invoke({
                        _: 'toggleChatIsMarkedAsUnread',
                        chat_id,
                        is_marked_as_unread,
                    });
                    returnData.push(result);
                }
                else if (operation === 'createNewSupergroupChat') {
                    const title = this.getNodeParameter('title', 0);
                    const is_channel = this.getNodeParameter('is_channel', 0);
                    const description = this.getNodeParameter('description', 0);
                    const result = await client.invoke({
                        _: 'createNewSupergroupChat',
                        title,
                        is_channel,
                        description,
                        location: null,
                        for_import: false,
                    });
                    returnData.push(result);
                }
                else if (operation === 'deleteChat') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const result = await client.invoke({
                        _: 'deleteChat',
                        chat_id,
                    });
                    returnData.push(result);
                }
                else if (operation === 'addChatMembers') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const user_ids = this.getNodeParameter('user_ids', 0);
                    const idsArray = user_ids
                        .toString()
                        .split(',')
                        .map((s) => s.toString().trim());
                    const result = await client.invoke({
                        _: 'addChatMembers',
                        chat_id,
                        user_ids: idsArray,
                    });
                    returnData.push(result);
                }
                else if (operation === 'sendChatAction') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const action = {
                        _: this.getNodeParameter('action', 0)
                    };
                    const result = await client.invoke({
                        _: 'sendChatAction',
                        chat_id,
                        action,
                    });
                    returnData.push(result);
                }
            }
            else if (resource === 'file') {
                if (operation === 'getRemoteFile') {
                    const remote_file_id = this.getNodeParameter('remote_file_id', 0);
                    const result = await client.invoke({
                        _: 'getRemoteFile',
                        remote_file_id,
                    });
                    returnData.push(result);
                }
                else if (operation === 'downloadFile') {
                    const file_id = this.getNodeParameter('file_id', 0);
                    const result = await client.invoke({
                        _: 'downloadFile',
                        file_id,
                        priority: 16,
                        synchronous: true,
                    });
                    returnData.push(result);
                }
            }
            else if (resource === 'message') {
                if (operation === 'getMessage') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const message_id = this.getNodeParameter('message_id', 0);
                    const result = await client.invoke({
                        _: 'getMessage',
                        chat_id,
                        message_id,
                    });
                    returnData.push(result);
                }
                else if (operation === 'getMessageLink') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const message_id = this.getNodeParameter('message_id', 0);
                    const result = await client.invoke({
                        _: 'getMessageLink',
                        chat_id,
                        message_id,
                    });
                    returnData.push(result);
                }
                else if (operation === 'getMessageLinkInfo') {
                    const url = this.getNodeParameter('url', 0);
                    const result = await client.invoke({
                        _: 'getMessageLinkInfo',
                        url,
                    });
                    returnData.push(result);
                }
                else if (operation === 'viewMessages') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const message_ids = this.getNodeParameter('message_ids', 0);
                    const force_read = this.getNodeParameter('force_read', 0);
                    const idsArray = message_ids
                        .toString()
                        .split(',')
                        .map((s) => s.toString().trim());
                    const result = await client.invoke({
                        _: 'viewMessages',
                        chat_id,
                        message_ids: idsArray,
                        source: null,
                        force_read: force_read
                    });
                    returnData.push(result);
                }
                else if (operation === 'sendMessage') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const messageText = this.getNodeParameter('messageText', 0);
                    const reply_to_msg_id = this.getNodeParameter('reply_to_msg_id', 0);
                    const message_thread_id = this.getNodeParameter('message_thread_id', 0);
                    const result = await client.invoke({
                        _: 'sendMessage',
                        chat_id,
                        reply_to_msg_id,
                        message_thread_id,
                        input_message_content: {
                            _: 'inputMessageText',
                            text: {
                                _: 'formattedText',
                                text: messageText,
                            },
                        },
                    });
                    returnData.push(result);
                }
                else if (operation === 'sendMessageVideo') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const videoFilePath = this.getNodeParameter('videoFilePath', 0);
                    let videoCaption = this.getNodeParameter('fileCaption', 0);
                    let videoDuration = this.getNodeParameter('videoDuration', 0);
                    let videoWidth = this.getNodeParameter('videoWidth', 0);
                    let videoHeight = this.getNodeParameter('videoHeight', 0);
                    let videoSupportsStreaming = this.getNodeParameter('videoSupportsStreaming', 0);
                    let thumbnailWidth = this.getNodeParameter('thumbnailWidth', 0);
                    let thumbnailHeight = this.getNodeParameter('thumbnailHeight', 0);
                    let thumbnailFilePath = this.getNodeParameter('thumbnailFilePath', 0);
                    const reply_to_msg_id = this.getNodeParameter('reply_to_msg_id', 0);
                    const message_thread_id = this.getNodeParameter('message_thread_id', 0);
                    if (videoCaption === '' && videoCaption.length == 0) {
                        videoCaption = null;
                    }
                    const result = await client.invoke({
                        _: 'sendMessage',
                        chat_id,
                        reply_to_msg_id,
                        message_thread_id,
                        input_message_content: {
                            _: 'inputMessageVideo',
                            video: {
                                _: 'inputFileLocal',
                                path: videoFilePath,
                            },
                            duration: videoDuration,
                            width: videoWidth,
                            height: videoHeight,
                            supports_streaming: videoSupportsStreaming,
                            thumbnail: {
                                _: 'inputThumbnail',
                                thumbnail: {
                                    '_': 'inputFileLocal',
                                    path: thumbnailFilePath
                                },
                                width: thumbnailWidth,
                                height: thumbnailHeight,
                            },
                            caption: {
                                _: 'formattedText',
                                text: videoCaption,
                            },
                        },
                    });
                    returnData.push(result);
                }
                else if (operation === 'sendMessageAudio') {
                    const outputItem = {
                        operation: 'sendMessageAudio',
                        success: false,
                        error: null,
                        result: null,
                    };
                    try {
                        const chat_id = this.getNodeParameter('chat_id', 0);
                        outputItem.chat_id = chat_id;
                        const audioSource = this.getNodeParameter('audioSource', 0);
                        outputItem.audioSource = audioSource;
                        const sendAsVoice = this.getNodeParameter('sendAsVoice', 0, false);
                        outputItem.sendAsVoice = sendAsVoice;
                        let audioFilePath = '';
                        let processError = false;
                        if (audioSource === 'binaryData') {
                            try {
                                const binaryPropertyName = this.getNodeParameter('audioBinaryPropertyName', 0);
                                outputItem.binaryPropertyName = binaryPropertyName;
                                const inputData = this.getInputData();
                                if (!inputData || !inputData[0]) {
                                    outputItem.error = 'No input data available';
                                    processError = true;
                                }
                                else {
                                    const binaryData = inputData[0].binary;
                                    if (!binaryData) {
                                        outputItem.error = 'No binary data exists on input item';
                                        processError = true;
                                    }
                                    else {
                                        const binaryProperty = binaryData[binaryPropertyName];
                                        if (!binaryProperty) {
                                            outputItem.error = `Binary property "${binaryPropertyName}" not found`;
                                            processError = true;
                                        }
                                        else if (!binaryProperty.filepath) {
                                            outputItem.error = `Binary property "${binaryPropertyName}" does not contain a filepath`;
                                            processError = true;
                                        }
                                        else {
                                            audioFilePath = binaryProperty.filepath;
                                            outputItem.audioFilePath = audioFilePath;
                                        }
                                    }
                                }
                            }
                            catch (binaryError) {
                                outputItem.error = `Binary data error: ${binaryError.message}`;
                                processError = true;
                            }
                        }
                        else if (audioSource === 'filePath') {
                            try {
                                audioFilePath = this.getNodeParameter('audioFilePath', 0);
                                if (!audioFilePath) {
                                    outputItem.error = 'File path is empty';
                                    processError = true;
                                }
                                else {
                                    outputItem.audioFilePath = audioFilePath;
                                }
                            }
                            catch (pathError) {
                                outputItem.error = `File path error: ${pathError.message}`;
                                processError = true;
                            }
                        }
                        else {
                            outputItem.error = `Invalid audio source: ${audioSource}`;
                            processError = true;
                        }
                        if (!processError) {
                            let audioCaption = null;
                            try {
                                const captionValue = this.getNodeParameter('audioCaption', 0, '');
                                audioCaption = captionValue && captionValue.length > 0 ? captionValue : null;
                                outputItem.audioCaption = audioCaption;
                            }
                            catch (error) {
                            }
                            let reply_to_msg_id = '';
                            try {
                                reply_to_msg_id = this.getNodeParameter('reply_to_msg_id', 0, '');
                                outputItem.reply_to_msg_id = reply_to_msg_id;
                            }
                            catch (error) {
                            }
                            try {
                                const fs = require('fs');
                                if (!fs.existsSync(audioFilePath)) {
                                    outputItem.error = `Audio file not found at path: ${audioFilePath}`;
                                    processError = true;
                                }
                                else {
                                    const stats = fs.statSync(audioFilePath);
                                    outputItem.fileSize = stats.size;
                                    outputItem.fileExists = true;
                                    if (sendAsVoice) {
                                        const fileExtension = (_a = audioFilePath.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                                        outputItem.fileExtension = fileExtension;
                                        if (fileExtension !== 'ogg') {
                                            outputItem.warning = 'Voice messages work best with .ogg format. Your file is in .' + fileExtension + ' format. Consider converting to .ogg for better compatibility.';
                                            debug('Warning: Voice message format may not be optimal:', fileExtension);
                                        }
                                        const maxSize = 20 * 1024 * 1024;
                                        if (stats.size > maxSize) {
                                            outputItem.error = `File size (${Math.round(stats.size / 1024 / 1024)}MB) exceeds Telegram's limit of 20MB for voice messages`;
                                            processError = true;
                                        }
                                    }
                                }
                            }
                            catch (fsError) {
                                outputItem.error = `File system error: ${fsError.message}`;
                                processError = true;
                            }
                        }
                        if (!processError) {
                            try {
                                let inputMessageContent;
                                if (sendAsVoice) {
                                    inputMessageContent = {
                                        _: 'inputMessageVoiceNote',
                                        voice_note: {
                                            _: 'inputFileLocal',
                                            path: audioFilePath,
                                        },
                                        caption: {
                                            _: 'formattedText',
                                            text: outputItem.audioCaption,
                                        },
                                    };
                                }
                                else {
                                    inputMessageContent = {
                                        _: 'inputMessageAudio',
                                        audio: {
                                            _: 'inputFileLocal',
                                            path: audioFilePath,
                                        },
                                        caption: {
                                            _: 'formattedText',
                                            text: outputItem.audioCaption,
                                        },
                                    };
                                }
                                const result = await client.invoke({
                                    _: 'sendMessage',
                                    chat_id,
                                    reply_to_msg_id: outputItem.reply_to_msg_id,
                                    input_message_content: inputMessageContent,
                                });
                                outputItem.success = true;
                                outputItem.result = result;
                            }
                            catch (apiError) {
                                outputItem.errorDetails = {
                                    message: apiError.message,
                                    code: apiError.code,
                                    stack: apiError.stack,
                                    chat_id: chat_id,
                                    sendAsVoice: sendAsVoice,
                                    filePath: audioFilePath,
                                    fileSize: outputItem.fileSize
                                };
                                debug('Telegram API error details:', JSON.stringify(outputItem.errorDetails, null, 2));
                                if (apiError.message.includes('User restricted receiving of video messages')) {
                                    outputItem.error = 'The recipient has restricted receiving of voice messages. Please try sending as a regular audio file instead.';
                                    outputItem.errorType = 'USER_RESTRICTION';
                                }
                                else if (apiError.message.includes('FILE_REFERENCE_EXPIRED')) {
                                    outputItem.error = 'File reference has expired. Please try again.';
                                    outputItem.errorType = 'FILE_REFERENCE_EXPIRED';
                                }
                                else if (apiError.message.includes('FILE_ID_INVALID')) {
                                    outputItem.error = 'Invalid file ID. Please check the file and try again.';
                                    outputItem.errorType = 'FILE_ID_INVALID';
                                }
                                else if (apiError.message.includes('CHAT_WRITE_FORBIDDEN')) {
                                    outputItem.error = 'Cannot send messages to this chat. You may not have permission.';
                                    outputItem.errorType = 'CHAT_WRITE_FORBIDDEN';
                                }
                                else {
                                    outputItem.error = `Telegram API error: ${apiError.message}`;
                                    outputItem.errorType = 'UNKNOWN_ERROR';
                                }
                            }
                        }
                    }
                    catch (generalError) {
                        outputItem.error = `General error: ${generalError.message}`;
                    }
                    returnData.push(outputItem);
                }
                else if (operation === 'sendMessageFile') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const filePath = this.getNodeParameter('filePath', 0);
                    let fileCaption = this.getNodeParameter('fileCaption', 0);
                    const reply_to_msg_id = this.getNodeParameter('reply_to_msg_id', 0);
                    const message_thread_id = this.getNodeParameter('message_thread_id', 0);
                    if (fileCaption === '' && fileCaption.length == 0) {
                        fileCaption = null;
                    }
                    const result = await client.invoke({
                        _: 'sendMessage',
                        chat_id,
                        reply_to_msg_id,
                        message_thread_id,
                        input_message_content: {
                            _: 'inputMessageDocument',
                            document: {
                                _: 'inputFileLocal',
                                path: filePath,
                            },
                            caption: {
                                _: 'formattedText',
                                text: fileCaption,
                            },
                        },
                    });
                    returnData.push(result);
                }
                else if (operation === 'sendMessagePhoto') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const localFilePath = this.getNodeParameter('localFilePath', 0);
                    let photoCaption = this.getNodeParameter('photoCaption', 0);
                    const reply_to_msg_id = this.getNodeParameter('reply_to_msg_id', 0);
                    const message_thread_id = this.getNodeParameter('message_thread_id', 0);
                    if (photoCaption === '' && photoCaption.length == 0) {
                        photoCaption = null;
                    }
                    const result = await client.invoke({
                        _: 'sendMessage',
                        chat_id,
                        reply_to_msg_id,
                        message_thread_id,
                        input_message_content: {
                            _: 'inputMessagePhoto',
                            photo: {
                                _: 'inputFileLocal',
                                path: localFilePath,
                            },
                            caption: {
                                _: 'formattedText',
                                text: photoCaption,
                            },
                        },
                    });
                    returnData.push(result);
                }
                else if (operation === 'editMessageText') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const message_id = this.getNodeParameter('message_id', 0);
                    const messageText = this.getNodeParameter('messageText', 0);
                    const result = await client.invoke({
                        _: 'editMessageText',
                        chat_id,
                        message_id,
                        input_message_content: {
                            _: 'inputMessageText',
                            text: {
                                _: 'formattedText',
                                text: messageText,
                            },
                        },
                    });
                    returnData.push(result);
                }
                else if (operation === 'deleteMessages') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const message_ids = this.getNodeParameter('message_ids', 0);
                    const revoke = this.getNodeParameter('revoke', 0);
                    const idsArray = message_ids
                        .toString()
                        .split(',')
                        .map((s) => s.toString().trim());
                    const result = await client.invoke({
                        _: 'deleteMessages',
                        chat_id,
                        message_ids: idsArray,
                        revoke,
                    });
                    returnData.push(result);
                }
                else if (operation === 'forwardMessages') {
                    const chat_id = this.getNodeParameter('chat_id', 0);
                    const from_chat_id = this.getNodeParameter('from_chat_id', 0);
                    const message_ids = this.getNodeParameter('message_ids', 0);
                    const message_thread_id = this.getNodeParameter('message_thread_id', 0);
                    const idsArray = message_ids
                        .toString()
                        .split(',')
                        .map((s) => s.toString().trim())
                        .filter((s) => s.length > 0);
                    const result = await client.invoke({
                        _: 'forwardMessages',
                        chat_id,
                        from_chat_id,
                        message_ids: idsArray,
                        message_thread_id,
                    });
                    returnData.push(result);
                }
            }
            else if (resource === 'group') {
                if (operation === 'getSupergroup') {
                    const supergroup_id = this.getNodeParameter('supergroup_id', 0);
                    result = await client.invoke({
                        _: 'getSupergroup',
                        supergroup_id,
                    });
                    returnData.push(result);
                }
                else if (operation === 'getSupergroupFullInfo') {
                    const supergroup_id = this.getNodeParameter('supergroup_id', 0);
                    result = await client.invoke({
                        _: 'getSupergroupFullInfo',
                        supergroup_id,
                    });
                    returnData.push(result);
                }
            }
            else if (resource === 'request') {
                if (operation === 'customRequest') {
                    const jsonString = this.getNodeParameter('request_json', 0);
                    const obj = JSON.parse(jsonString);
                    debug(`Request JSON is : ${jsonString}`);
                    result = await client.invoke(obj);
                    returnData.push(result);
                }
            }
        }
        catch (e) {
            if (e.message === "A closed client cannot be reused, create a new Client") {
                cM.markClientAsClosed(apiId);
                if (this.continueOnFail()) {
                    returnData.push({ json: { message: e.message, error: e } });
                }
                else {
                    throw new Error("Session was closed or terminated. Please login again: https://telepilot.co/login-howto");
                }
            }
            else if (e.message === "Unauthorized") {
                cM.markClientAsClosed(apiId);
                if (this.continueOnFail()) {
                    returnData.push({ json: { message: e.message, error: e } });
                }
                else {
                    throw new Error("Please login: https://telepilot.co/login-howto");
                }
            }
            else {
                if (this.continueOnFail()) {
                    returnData.push({ json: { message: e.message, error: e } });
                }
                else {
                    throw e;
                }
            }
        }
        return [this.helpers.returnJsonArray(returnData)];
    }
}
exports.TelePilot = TelePilot;
//# sourceMappingURL=TelePilot.node.js.map