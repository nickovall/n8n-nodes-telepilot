import 'reflect-metadata';
import { IDataObject } from 'n8n-workflow';
declare const Client: any;
declare type AuthHandler = (update: IDataObject) => void;
export declare enum TelepilotAuthState {
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
declare class ClientSession {
    client: typeof Client;
    authState: TelepilotAuthState;
    phoneNumber: string;
    authHandler?: AuthHandler;
    constructor(client: typeof Client, authState: TelepilotAuthState, phoneNumber: string);
}
export declare function sleep(ms: number): Promise<unknown>;
export declare class TelePilotNodeConnectionManager {
    private clientSessions;
    private tdlConfigured;
    private TD_DATABASE_PATH_PREFIX;
    private TD_FILES_PATH_PREFIX;
    constructor();
    private normalizeApiId;
    private getClientSession;
    private detachAuthHandler;
    private maskPhoneNumber;
    closeLocalSession(apiId: unknown): Promise<any>;
    deleteLocalInstance(apiId: unknown): Promise<Record<string, string>>;
    getTdDatabasePathForClient(apiId: unknown): any;
    getTdFilesPathForClient(apiId: unknown): any;
    clientLoginWithPhoneNumber(apiId: unknown, apiHash: string, phone_number: string): Promise<string>;
    clientLoginSendAuthenticationCode(apiId: unknown, code: string): Promise<string>;
    clientLoginSendAuthenticationPassword(apiId: unknown, password: string): Promise<string>;
    createClientSetAuthHandlerForPhoneNumberLogin(apiId: unknown, apiHash: string, phoneNumber: string): Promise<ClientSession>;
    private initClient;
    private locateBinaryModules;
    markClientAsClosed(apiId: unknown): void;
    getAuthStateForCredential(apiId: unknown): TelepilotAuthState;
    getAllClientSessions(): {
        apiId: string;
        authState: TelepilotAuthState;
        phoneNumber: string;
    }[];
}
export {};
