"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelePilotNodeConnectionManager = exports.sleep = exports.TelepilotAuthState = void 0;
require("reflect-metadata");
const typedi_1 = require("typedi");
const { Client } = require('@telepilotco/tdl');
const tdl = require('@telepilotco/tdl');
const fs = require('fs/promises');
const path = require('path');
const debug = require('debug')('telepilot-cm');
function loadPackageJson() {
    const candidates = [
        path.resolve(__dirname, '../../../package.json'),
        path.resolve(__dirname, '../../package.json'),
    ];
    for (const packagePath of candidates) {
        try {
            return require(packagePath);
        }
        catch (error) {
        }
    }
    return { version: 'unknown', dependencies: {} };
}
const packageJson = loadPackageJson();
const nodeVersion = packageJson.version;
const binaryVersion = (_b = (_a = packageJson.telepilot) === null || _a === void 0 ? void 0 : _a.tdlibBinaryVersion) !== null && _b !== void 0 ? _b : 'unknown';
const addonVersion = ((_c = packageJson.dependencies['@telepilotco/tdl']) !== null && _c !== void 0 ? _c : 'unknown').replace(/^[~^]/, '');
function getTdDataPathPrefix() {
    var _a, _b;
    if (process.env.TELEPILOT_TDLIB_DATA_DIR !== undefined && process.env.TELEPILOT_TDLIB_DATA_DIR !== '') {
        return process.env.TELEPILOT_TDLIB_DATA_DIR;
    }
    const n8nUserFolder = (_a = process.env.N8N_USER_FOLDER) !== null && _a !== void 0 ? _a : path.join((_b = process.env.HOME) !== null && _b !== void 0 ? _b : process.cwd(), '.n8n');
    return path.join(n8nUserFolder, 'nodes', 'node_modules', '@telepilotco', 'n8n-nodes-telepilot', 'db');
}
var TelepilotAuthState;
(function (TelepilotAuthState) {
    TelepilotAuthState["NO_CONNECTION"] = "NO_CONNECTION";
    TelepilotAuthState["WAIT_TDLIB_PARAMS"] = "authorizationStateWaitTdlibParameters";
    TelepilotAuthState["WAIT_ENCRYPTION_KEY"] = "authorizationStateWaitEncryptionKey";
    TelepilotAuthState["WAIT_PHONE_NUMBER"] = "authorizationStateWaitPhoneNumber";
    TelepilotAuthState["WAIT_CODE"] = "authorizationStateWaitCode";
    TelepilotAuthState["WAIT_DEVICE_CONFIRMATION"] = "authorizationStateWaitOtherDeviceConfirmation";
    TelepilotAuthState["WAIT_REGISTRATION"] = "authorizationStateWaitRegistration";
    TelepilotAuthState["WAIT_PASSWORD"] = "authorizationStateWaitPassword";
    TelepilotAuthState["WAIT_READY"] = "authorizationStateReady";
    TelepilotAuthState["WAIT_LOGGING_OUT"] = "authorizationStateLoggingOut";
    TelepilotAuthState["WAIT_CLOSING"] = "authorizationStateClosing";
    TelepilotAuthState["WAIT_CLOSED"] = "authorizationStateClosed";
})(TelepilotAuthState = exports.TelepilotAuthState || (exports.TelepilotAuthState = {}));
function getEnumFromString(enumObj, str) {
    for (const key in enumObj) {
        if (enumObj.hasOwnProperty(key) && enumObj[key] === str) {
            return enumObj[key];
        }
    }
    return undefined;
}
class ClientSession {
    constructor(client, authState, phoneNumber) {
        this.client = client;
        this.authState = authState;
        this.phoneNumber = phoneNumber;
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
let TelePilotNodeConnectionManager = class TelePilotNodeConnectionManager {
    constructor() {
        this.clientSessions = {};
        this.tdlConfigured = false;
        this.TD_DATABASE_PATH_PREFIX = getTdDataPathPrefix();
        this.TD_FILES_PATH_PREFIX = this.TD_DATABASE_PATH_PREFIX;
    }
    normalizeApiId(apiId) {
        const parsedApiId = typeof apiId === 'number' ? apiId : Number(apiId);
        if (!Number.isInteger(parsedApiId) || parsedApiId <= 0) {
            throw new Error('Telegram api_id must be a positive integer');
        }
        return parsedApiId;
    }
    getClientSession(apiId) {
        const normalizedApiId = this.normalizeApiId(apiId);
        const clientSession = this.clientSessions[normalizedApiId];
        if (clientSession === undefined) {
            throw new Error('You need to login first, please check our guide at https://telepilot.co/login-howto');
        }
        return clientSession;
    }
    detachAuthHandler(clientSession) {
        if (clientSession.authHandler !== undefined) {
            clientSession.client.removeListener('update', clientSession.authHandler);
            clientSession.authHandler = undefined;
        }
    }
    maskPhoneNumber(phoneNumber) {
        if (phoneNumber.length <= 4) {
            return '[REDACTED]';
        }
        return `${'*'.repeat(phoneNumber.length - 4)}${phoneNumber.slice(-4)}`;
    }
    async closeLocalSession(apiId) {
        const normalizedApiId = this.normalizeApiId(apiId);
        debug('closeLocalSession apiId:' + normalizedApiId);
        const clientSession = this.getClientSession(normalizedApiId);
        this.detachAuthHandler(clientSession);
        const result = clientSession.client.close();
        delete this.clientSessions[normalizedApiId];
        debug(Object.keys(this.clientSessions));
        return result;
    }
    async deleteLocalInstance(apiId) {
        const normalizedApiId = this.normalizeApiId(apiId);
        const clientSession = this.clientSessions[normalizedApiId];
        if (clientSession !== undefined) {
            this.detachAuthHandler(clientSession);
            try {
                await clientSession.client.invoke({
                    _: 'close',
                });
            }
            catch (e) {
                debug('Connection was already closed');
            }
            delete this.clientSessions[normalizedApiId];
        }
        const result = {};
        const removeDir = async (dirPath) => {
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
    getTdDatabasePathForClient(apiId) {
        return path.join(this.TD_DATABASE_PATH_PREFIX, String(this.normalizeApiId(apiId)), '_td_database');
    }
    getTdFilesPathForClient(apiId) {
        return path.join(this.TD_FILES_PATH_PREFIX, String(this.normalizeApiId(apiId)), '_td_files');
    }
    async clientLoginWithPhoneNumber(apiId, apiHash, phone_number) {
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
    }
    async clientLoginSendAuthenticationCode(apiId, code) {
        debug('clientLoginSendAuthenticationCode');
        const clientSession = this.getClientSession(apiId);
        const result = await clientSession.client.invoke({
            _: 'checkAuthenticationCode',
            code,
        });
        return result;
    }
    async clientLoginSendAuthenticationPassword(apiId, password) {
        debug('clientLoginSendAuthenticationPassword');
        const clientSession = this.getClientSession(apiId);
        const result = await clientSession.client.invoke({
            _: 'checkAuthenticationPassword',
            password,
        });
        return result;
    }
    async createClientSetAuthHandlerForPhoneNumberLogin(apiId, apiHash, phoneNumber) {
        const normalizedApiId = this.normalizeApiId(apiId);
        let client;
        if (this.clientSessions[normalizedApiId] === undefined) {
            client = this.initClient(normalizedApiId, apiHash);
            const clientSession = new ClientSession(client, TelepilotAuthState.NO_CONNECTION, phoneNumber);
            this.clientSessions[normalizedApiId] = clientSession;
        }
        if (this.clientSessions[normalizedApiId].authHandler === undefined) {
            const authHandler = (update) => {
                if (update._ !== 'updateAuthorizationState') {
                    return;
                }
                const authorization_state = update.authorization_state;
                debug('authHandler.Got updateAuthorizationState:', authorization_state._);
                if (this.clientSessions[normalizedApiId] !== undefined) {
                    this.clientSessions[normalizedApiId].authState = getEnumFromString(TelepilotAuthState, authorization_state._);
                    debug('set clientSession.authState to ' + this.clientSessions[normalizedApiId].authState);
                }
            };
            this.clientSessions[normalizedApiId].authHandler = authHandler;
            this.clientSessions[normalizedApiId].client.on('update', authHandler);
        }
        await sleep(1000);
        return this.clientSessions[normalizedApiId];
    }
    initClient(apiId, apiHash) {
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
            });
        }
        else {
            return this.clientSessions[apiId].client;
        }
    }
    locateBinaryModules() {
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
                    libFile = "libtdjson" + ".so";
                    break;
                default:
                    throw new Error("Not implemented for " + process.platform);
            }
        }
        else if (process.arch == "arm64") {
            switch (process.platform) {
                case "darwin":
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
        return { libFolder, libFile };
    }
    markClientAsClosed(apiId) {
        const normalizedApiId = this.normalizeApiId(apiId);
        debug('markClientAsClosed apiId:' + normalizedApiId);
        const clientSession = this.clientSessions[normalizedApiId];
        if (clientSession !== undefined) {
            this.detachAuthHandler(clientSession);
            delete this.clientSessions[normalizedApiId];
        }
    }
    getAuthStateForCredential(apiId) {
        const normalizedApiId = this.normalizeApiId(apiId);
        if (this.clientSessions[normalizedApiId] === undefined) {
            return TelepilotAuthState.NO_CONNECTION;
        }
        else {
            const clientSession = this.clientSessions[normalizedApiId];
            return clientSession.authState;
        }
    }
    getAllClientSessions() {
        return Object.entries(this.clientSessions).map(([key, value]) => {
            return {
                apiId: key,
                authState: value.authState,
                phoneNumber: this.maskPhoneNumber(value.phoneNumber),
            };
        });
    }
};
TelePilotNodeConnectionManager = __decorate([
    (0, typedi_1.Service)(),
    __metadata("design:paramtypes", [])
], TelePilotNodeConnectionManager);
exports.TelePilotNodeConnectionManager = TelePilotNodeConnectionManager;
//# sourceMappingURL=TelePilotNodeConnectionManager.js.map