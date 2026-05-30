"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelePilotApi = void 0;
class TelePilotApi {
    constructor() {
        this.name = 'telePilotApi';
        this.displayName = 'Personal Telegram CoPilot API';
        this.properties = [
            {
                displayName: 'App api_id',
                name: 'apiId',
                type: 'number',
                default: 0,
                description: 'Telegram application api_id from my.telegram.org',
                required: true,
            },
            {
                displayName: 'App api_hash',
                name: 'apiHash',
                type: 'string',
                placeholder: '17d2f8ab587',
                default: '',
                description: 'Telegram application api_hash from my.telegram.org',
                required: true,
            },
            {
                displayName: 'Phone Number',
                name: 'phoneNumber',
                type: 'string',
                default: '00123456789',
                description: 'Telegram Account Phone Number, used as Login',
                required: true,
            },
        ];
    }
}
exports.TelePilotApi = TelePilotApi;
//# sourceMappingURL=TelePilotApi.credentials.js.map