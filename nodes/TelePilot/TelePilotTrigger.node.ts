import { Container } from 'typedi';

import {
	IDataObject,
	INodeType,
	INodeTypeDescription, ITriggerFunctions, ITriggerResponse,
} from 'n8n-workflow';

const debug = require('debug')('telepilot-trigger')

import {TelePilotNodeConnectionManager, TelepilotAuthState} from "./TelePilotNodeConnectionManager";
import { TDLibUpdateEvents } from './tdlib/updateEvents';
import { TDLibUpdate } from './tdlib/types'
import {Client} from "@telepilotco/tdl";


export class TelePilotTrigger implements INodeType {
	description: INodeTypeDescription = {
		// Basic node details will go here
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
					...TDLibUpdateEvents
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
	// The execute method will go here


	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const credentials = await this.getCredentials('telePilotApi');

		const cM = Container.get(TelePilotNodeConnectionManager);
		const apiId = credentials?.apiId;

		let client: Client;
		const clientSession = await cM.createClientSetAuthHandlerForPhoneNumberLogin(
			apiId,
			credentials?.apiHash as string,
			credentials?.phoneNumber as string,
		);
		debug('trigger.clientSession.authState: ' + clientSession.authState);
		if (clientSession.authState != TelepilotAuthState.WAIT_READY) {
			try {
				await cM.closeLocalSession(apiId);
			} catch (error) {
				debug('closeLocalSession after failed trigger auth:', error.message);
			}
			const notLoggedInPayload = [{
				error: 'Telegram account not logged in. Please use ChatTrigger node together with loginWithPhoneNumber action. Please check our guide at https://telepilot.co/login-howto',
			}];
			this.emit([this.helpers.returnJsonArray(notLoggedInPayload)]);
			return {};
		}

		client = clientSession.client;

		const updateEventsArray = this.getNodeParameter('events', []) as string[];
		const options = this.getNodeParameter('options', {}) as {
			ignoreGroups: boolean;
		}

		const _emit = (data: IDataObject) => {
			this.emit([this.helpers.returnJsonArray([data])]);
		}

		const shouldEmitUpdate = (update: IDataObject | TDLibUpdate) => {
			const incomingEvent = update._ as string;
			if (!updateEventsArray.includes('*') && !updateEventsArray.includes(incomingEvent) && updateEventsArray.length > 0) {
				return false;
			}
			if (options.ignoreGroups) {
				const msg = update?.message;
				const chatId = (typeof msg === 'object' && msg !== null && 'chat_id' in msg) ? msg.chat_id : undefined;
				if (typeof chatId === 'number' && chatId < 0) {
					return false;
				}
			}
			return true;
		};

		const _listener = (update: IDataObject | TDLibUpdate) => {
			if (shouldEmitUpdate(update)) {
				debug('Got update: ' + update._);
				_emit(update);
			}
		}

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
					reject(
						new Error(
							'Aborted, no message received within 30secs. This 30sec timeout is only set for "manually triggered execution". Active Workflows will listen indefinitely.',
						),
					);
				}, 30000);

				const _listener2 = (update: IDataObject) => {
					if (shouldEmitUpdate(update)) {
						debug('Got update in manual: ' + update._);
						_emit(update);

						clearTimeout(timeoutHandler);
						client.removeListener('update', _listener2);
						resolve(true);
					}
				}
				client.on('update',	_listener2);
			});
		};

		return {
			closeFunction,
			manualTriggerFunction,
		};
	}
}

exports.TelePilotTrigger = TelePilotTrigger;
