"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelePilotTrigger = void 0;
const typedi_1 = require("typedi");
const debug = require('debug')('telepilot-trigger');
const TelePilotNodeConnectionManager_1 = require("./TelePilotNodeConnectionManager");
const updateEvents_1 = require("./tdlib/updateEvents");
class TelePilotTrigger {
    constructor() {
        this.description = {
            displayName: 'Telegram CoPilot Trigger',
            name: 'telePilotTrigger',
            icon: 'file:TelePilot.svg',
            group: ['trigger'],
            version: 1,
            description: 'Your Personal Telegram CoPilot Listener',
            defaults: {
                name: 'TelePilot Trigger',
            },
            inputs: [],
            outputs: ['main'],
            credentials: [
                {
                    name: 'telePilotApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Events',
                    name: 'events',
                    type: 'multiOptions',
                    options: [
                        {
                            name: '*',
                            value: '*',
                        },
                        ...updateEvents_1.TDLibUpdateEvents
                    ],
                    default: ['updateNewMessage', 'updateMessageContent'],
                },
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add option',
                    default: {},
                    options: [
                        {
                            displayName: 'Ignore Groups Events',
                            description: 'Whether to ignore events for negative chat_ids',
                            name: 'ignoreGroups',
                            type: 'boolean',
                            default: false,
                        }
                    ]
                }
            ],
        };
    }
    async trigger() {
        const credentials = await this.getCredentials('telePilotApi');
        const cM = typedi_1.Container.get(TelePilotNodeConnectionManager_1.TelePilotNodeConnectionManager);
        const apiId = credentials === null || credentials === void 0 ? void 0 : credentials.apiId;
        let client;
        const clientSession = await cM.createClientSetAuthHandlerForPhoneNumberLogin(apiId, credentials === null || credentials === void 0 ? void 0 : credentials.apiHash, credentials === null || credentials === void 0 ? void 0 : credentials.phoneNumber);
        debug('trigger.clientSession.authState: ' + clientSession.authState);
        if (clientSession.authState != TelePilotNodeConnectionManager_1.TelepilotAuthState.WAIT_READY) {
            try {
                await cM.closeLocalSession(apiId);
            }
            catch (error) {
                debug('closeLocalSession after failed trigger auth:', error.message);
            }
            const notLoggedInPayload = [{
                    error: 'Telegram account not logged in. Please use ChatTrigger node together with loginWithPhoneNumber action. Please check our guide at https://telepilot.co/login-howto',
                }];
            this.emit([this.helpers.returnJsonArray(notLoggedInPayload)]);
            return {};
        }
        client = clientSession.client;
        const updateEventsArray = this.getNodeParameter('events', []);
        const options = this.getNodeParameter('options', {});
        const _emit = (data) => {
            this.emit([this.helpers.returnJsonArray([data])]);
        };
        const shouldEmitUpdate = (update) => {
            const incomingEvent = update._;
            if (!updateEventsArray.includes('*') && !updateEventsArray.includes(incomingEvent) && updateEventsArray.length > 0) {
                return false;
            }
            if (options.ignoreGroups) {
                const msg = update === null || update === void 0 ? void 0 : update.message;
                const chatId = (typeof msg === 'object' && msg !== null && 'chat_id' in msg) ? msg.chat_id : undefined;
                if (typeof chatId === 'number' && chatId < 0) {
                    return false;
                }
            }
            return true;
        };
        const _listener = (update) => {
            if (shouldEmitUpdate(update)) {
                debug('Got update: ' + update._);
                _emit(update);
            }
        };
        if (this.getMode() !== 'manual') {
            client.on('update', _listener);
            client.on('error', debug);
        }
        async function closeFunction() {
            debug('closeFunction(' + updateEventsArray + ')');
            client.removeListener('update', _listener);
        }
        const manualTriggerFunction = async () => {
            await new Promise((resolve, reject) => {
                const timeoutHandler = setTimeout(() => {
                    reject(new Error('Aborted, no message received within 30secs. This 30sec timeout is only set for "manually triggered execution". Active Workflows will listen indefinitely.'));
                }, 30000);
                const _listener2 = (update) => {
                    if (shouldEmitUpdate(update)) {
                        debug('Got update in manual: ' + update._);
                        _emit(update);
                        clearTimeout(timeoutHandler);
                        client.removeListener('update', _listener2);
                        resolve(true);
                    }
                };
                client.on('update', _listener2);
            });
        };
        return {
            closeFunction,
            manualTriggerFunction,
        };
    }
}
exports.TelePilotTrigger = TelePilotTrigger;
exports.TelePilotTrigger = TelePilotTrigger;
//# sourceMappingURL=TelePilotTrigger.node.js.map