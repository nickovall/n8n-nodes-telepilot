import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TelePilotApi implements ICredentialType {
	name = 'telePilotApi';
	displayName = 'Personal Telegram CoPilot API';
	properties: INodeProperties[] = [
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

	// Credential test removed: external POST to vendor license server (ls.telepilot.co:4413) over plain HTTP.
	// Credentials are validated at first use against Telegram MTProto servers directly.
}
