import 'reflect-metadata';
import { Service } from 'typedi';
import { IDataObject } from 'n8n-workflow';

const { Client } = require('@telepilotco/tdl');
const tdl = require('@telepilotco/tdl');
const fs = require('fs/promises');
const path = require('path');

const debug = require('debug')('telepilot-cm');

function loadPackageJson(): {
	version: string;
	dependencies: Record<string, string>;
	telepilot?: { tdlibBinaryVersion?: string };
} {
	const candidates = [
		path.resolve(__dirname, '../../../package.json'), // compiled dist path
		path.resolve(__dirname, '../../package.json'), // source tree path
	];

	for (const packagePath of candidates) {
		try {
			return require(packagePath);
		} catch (error) {
			// Try the next candidate. n8n loads compiled files from dist, tests may load source.
		}
	}

	return { version: 'unknown', dependencies: {} };
}

const packageJson = loadPackageJson();
const nodeVersion = packageJson.version;

const binaryVersion = packageJson.telepilot?.tdlibBinaryVersion ?? 'unknown';
const addonVersion = (packageJson.dependencies['@telepilotco/tdl'] ?? 'unknown').replace(/^[~^]/, '');

type AuthHandler = (update: IDataObject) => void;

function getTdDataPathPrefix(): string {
	if (process.env.TELEPILOT_TDLIB_DATA_DIR !== undefined && process.env.TELEPILOT_TDLIB_DATA_DIR !== '') {
		return process.env.TELEPILOT_TDLIB_DATA_DIR;
	}

	const n8nUserFolder = process.env.N8N_USER_FOLDER ?? path.join(process.env.HOME ?? process.cwd(), '.n8n');
	return path.join(n8nUserFolder, 'nodes', 'node_modules', '@telepilotco', 'n8n-nodes-telepilot', 'db');
}

export enum TelepilotAuthState {
	NO_CONNECTION = "NO_CONNECTION",
	WAIT_TDLIB_PARAMS = "authorizationStateWaitTdlibParameters",
	WAIT_ENCRYPTION_KEY = "authorizationStateWaitEncryptionKey",
	WAIT_PHONE_NUMBER = "authorizationStateWaitPhoneNumber",
	WAIT_CODE = "authorizationStateWaitCode",
	WAIT_DEVICE_CONFIRMATION = "authorizationStateWaitOtherDeviceConfirmation",
	WAIT_REGISTRATION = "authorizationStateWaitRegistration",
	WAIT_PASSWORD = "authorizationStateWaitPassword",
	WAIT_READY = "authorizationStateReady",
	WAIT_LOGGING_OUT = "authorizationStateLoggingOut",
	WAIT_CLOSING = "authorizationStateClosing",
	WAIT_CLOSED = "authorizationStateClosed"
}

function getEnumFromString(enumObj: any, str: string): any {
	for (const key in enumObj) {
		if (enumObj.hasOwnProperty(key) && enumObj[key] === str) {
			return enumObj[key];
		}
	}
	return undefined;
}

class ClientSession {
	client: typeof Client;
	authState: TelepilotAuthState;
	phoneNumber: string;
	authHandler?: AuthHandler;

	constructor(client: typeof Client, authState: TelepilotAuthState, phoneNumber: string) {
		this.client = client;
		this.authState = authState;
		this.phoneNumber = phoneNumber;
	}
}

export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

@Service()
export class TelePilotNodeConnectionManager {

	private clientSessions: Record<number, ClientSession> = {};
	private tdlConfigured: boolean = false;

	private TD_DATABASE_PATH_PREFIX = getTdDataPathPrefix();
	private TD_FILES_PATH_PREFIX = this.TD_DATABASE_PATH_PREFIX;


	constructor() {

	}

	private normalizeApiId(apiId: unknown): number {
		const parsedApiId = typeof apiId === 'number' ? apiId : Number(apiId);
		if (!Number.isInteger(parsedApiId) || parsedApiId <= 0) {
			throw new Error('Telegram api_id must be a positive integer');
		}
		return parsedApiId;
	}

	private getClientSession(apiId: unknown): ClientSession {
		const normalizedApiId = this.normalizeApiId(apiId);
		const clientSession = this.clientSessions[normalizedApiId];
		if (clientSession === undefined) {
			throw new Error('You need to login first, please check our guide at https://telepilot.co/login-howto');
		}
		return clientSession;
	}

	private detachAuthHandler(clientSession: ClientSession) {
		if (clientSession.authHandler !== undefined) {
			clientSession.client.removeListener('update', clientSession.authHandler);
			clientSession.authHandler = undefined;
		}
	}

	private maskPhoneNumber(phoneNumber: string) {
		if (phoneNumber.length <= 4) {
			return '[REDACTED]';
		}
		return `${'*'.repeat(phoneNumber.length - 4)}${phoneNumber.slice(-4)}`;
	}

	async closeLocalSession(apiId: unknown) {
		const normalizedApiId = this.normalizeApiId(apiId);
		debug('closeLocalSession apiId:' + normalizedApiId);
		const clientSession = this.getClientSession(normalizedApiId);
		this.detachAuthHandler(clientSession);
		const result = clientSession.client.close();
		delete this.clientSessions[normalizedApiId];
		debug(Object.keys(this.clientSessions));
		return result;
	}
	async deleteLocalInstance(apiId: unknown): Promise<Record<string, string>> {
		const normalizedApiId = this.normalizeApiId(apiId);
		const clientSession = this.clientSessions[normalizedApiId];

		if (clientSession !== undefined) {
			this.detachAuthHandler(clientSession);
			try {
				await clientSession.client.invoke({
					_: 'close',
				});
			} catch (e) {
				debug('Connection was already closed');
			}
			delete this.clientSessions[normalizedApiId];
		}

		const result: Record<string, string> = {};
		const removeDir = async (dirPath: string) => {
			await fs.rm(dirPath, { recursive: true, force: true });
		};

		const db_database_path = this.getTdDatabasePathForClient(normalizedApiId);
		await removeDir(db_database_path);
		result.db_database = `Removed ${db_database_path}`;

		const db_files_path = this.getTdFilesPathForClient(normalizedApiId);
		await removeDir(db_files_path);
		result.db_files = `Removed ${db_files_path}`;

		return result;
	}

	getTdDatabasePathForClient(apiId: unknown) {
		return path.join(this.TD_DATABASE_PATH_PREFIX, String(this.normalizeApiId(apiId)), '_td_database');
	}

	getTdFilesPathForClient(apiId: unknown) {
		return path.join(this.TD_FILES_PATH_PREFIX, String(this.normalizeApiId(apiId)), '_td_files');
	}

	async clientLoginWithPhoneNumber(apiId: unknown, apiHash: string, phone_number: string): Promise<string> {
		debug('clientLoginWithPhoneNumber');
		const clientSession = this.getClientSession(apiId);

		debug('clientLoginWithPhoneNumber.authState:' + clientSession.authState);
		if (clientSession.authState == TelepilotAuthState.WAIT_PHONE_NUMBER) {
			const result = await clientSession.client.invoke({
				_: 'setAuthenticationPhoneNumber',
				phone_number,
			});
			return result;
		}
		return "";

		// result = await clientSession.client.invoke({
		// 	_: 'checkAuthenticationCode',
		// 	code: ""
		// });
		//
		// result = await clientSession.client.invoke({
		// 	_: 'checkAuthenticationPassword',
		// 	password: ""
		// });


	}

	async clientLoginSendAuthenticationCode(apiId: unknown, code: string): Promise<string> {
		debug('clientLoginSendAuthenticationCode');
		const clientSession = this.getClientSession(apiId);
		const result = await clientSession.client.invoke({
			_: 'checkAuthenticationCode',
			code,
		});
		return result;
	}

	async clientLoginSendAuthenticationPassword(apiId: unknown, password: string): Promise<string> {
		debug('clientLoginSendAuthenticationPassword');
		const clientSession = this.getClientSession(apiId);
		const result = await clientSession.client.invoke({
			_: 'checkAuthenticationPassword',
			password,
		});
		return result;
	}

	async createClientSetAuthHandlerForPhoneNumberLogin(apiId: unknown, apiHash: string, phoneNumber: string): Promise<ClientSession> {
		const normalizedApiId = this.normalizeApiId(apiId);
		let client: typeof Client;
		if (this.clientSessions[normalizedApiId] === undefined) {
			client = this.initClient(normalizedApiId, apiHash);
			const clientSession = new ClientSession(client, TelepilotAuthState.NO_CONNECTION, phoneNumber);
			this.clientSessions[normalizedApiId] = clientSession;
		}
		if (this.clientSessions[normalizedApiId].authHandler === undefined) {
			const authHandler = (update: IDataObject) => {
				if (update._ !== 'updateAuthorizationState') {
					return;
				}
				const authorization_state = update.authorization_state as IDataObject;
				debug('authHandler.Got updateAuthorizationState:', authorization_state._);
				if (this.clientSessions[normalizedApiId] !== undefined) {
					this.clientSessions[normalizedApiId].authState = getEnumFromString(TelepilotAuthState, authorization_state._ as string);
					debug('set clientSession.authState to ' + this.clientSessions[normalizedApiId].authState);
				}
			};

			this.clientSessions[normalizedApiId].authHandler = authHandler;
			this.clientSessions[normalizedApiId].client.on('update', authHandler);
		}

		await sleep(1000);
		return this.clientSessions[normalizedApiId];
	}

	private initClient(apiId: number, apiHash: string) {
		const clients_keys = Object.keys(this.clientSessions);
		const { libFolder, libFile } = this.locateBinaryModules();
		debug('nodeVersion:', nodeVersion);
		debug('binaryVersion:', binaryVersion);
		debug('addonVersion:', addonVersion);
		if (!clients_keys.includes(apiId.toString()) || this.clientSessions[apiId] === undefined) {
			if (!this.tdlConfigured) {
				tdl.configure({
					libdir: libFolder,
					tdjson: libFile,
				});
				this.tdlConfigured = true;
			}
			return tdl.createClient({
				apiId,
				apiHash,
				databaseDirectory: this.getTdDatabasePathForClient(apiId),
				filesDirectory: this.getTdFilesPathForClient(apiId),
				nodeVersion,
				binaryVersion,
				addonVersion,
				// useTestDc: true
			});
		} else {
			return this.clientSessions[apiId].client;
		}
	}

	private locateBinaryModules() {
		const _lib_prebuilt_package = 'tdlib-binaries-prebuilt/prebuilds/';

		let libFile = "";
		const libFolder = __dirname + "/../../../../" + _lib_prebuilt_package;

		if (process.arch === "x64") {
			switch (process.platform) {
				case "win32":
					throw new Error("Your n8n installation is currently not supported, " +
						"please refer to https://telepilot.co/nodes/telepilot/#win-x64");
				case 'darwin':
					throw new Error("Your n8n installation is currently not supported, " +
						"please refer to https://telepilot.co/nodes/telepilot/#macos-x64");
				case 'linux':
						// libFile = libFolder + "libtdjson" + ".so"
						libFile = "libtdjson" + ".so";
					break;
				default:
					throw new Error("Not implemented for " + process.platform);
			}
		} else if (process.arch == "arm64") {
			switch (process.platform) {
				case "darwin":
					// 	"please refer to https://telepilot.co/nodes/telepilot/#macos-arm64")
					libFile = "libtdjson" + ".dylib";
					break;
				case "linux":
					libFile = "libtdjson" + ".so";
					break;
				default:
					throw new Error("Your n8n installation is currently not supported, " +
						"please refer to https://telepilot.co/nodes/telepilot/#win-arm64");
			}
		}
		// return {libFile, bridgeFile};
		return {libFolder, libFile};
	}

	markClientAsClosed(apiId: unknown) {
		const normalizedApiId = this.normalizeApiId(apiId);
		debug('markClientAsClosed apiId:' + normalizedApiId);
		const clientSession = this.clientSessions[normalizedApiId];
		if (clientSession !== undefined) {
			this.detachAuthHandler(clientSession);
			delete this.clientSessions[normalizedApiId];
		}
	}

	getAuthStateForCredential(apiId: unknown) {
		const normalizedApiId = this.normalizeApiId(apiId);
		if (this.clientSessions[normalizedApiId] === undefined) {
			return TelepilotAuthState.NO_CONNECTION;
		} else {
			const clientSession = this.clientSessions[normalizedApiId];
			return clientSession.authState;
		}
	}

	getAllClientSessions() {
		return Object.entries(this.clientSessions).map(([key, value]) => {
			// Perform some transformation on each ClientSession instance
			return {
				apiId: key,
				authState: value.authState,
				phoneNumber: this.maskPhoneNumber(value.phoneNumber),
			};
		});
	}
}
