"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variable_thumbnail_width = exports.variable_video_supports_streaming = exports.variable_video_height = exports.variable_video_width = exports.variable_video_duration = exports.variable_url = exports.variable_json = exports.variable_file_caption = exports.variable_send_as_voice = exports.variable_audio_caption = exports.variable_file_path = exports.variable_audio_binary_property_name = exports.variable_audio_file_path = exports.variable_audio_path = exports.variable_chat_action = exports.variable_user_ids = exports.variable_description = exports.variable_is_channel = exports.variable_title = exports.variable_supergroup_id = exports.variable_message_thread_id = exports.variable_reply_to_msg_id = exports.variable_remote_file_id = exports.variable_file_id = exports.variable_query = exports.variable_username = exports.variable_revoke = exports.variable_photo_caption = exports.variable_video_photo_path = exports.variable_local_photo_path = exports.variable_messageText = exports.variable_message_id = exports.variable_message_force_read = exports.variable_message_ids = exports.variable_limit = exports.variable_from_message_id = exports.variable_is_marked_as_unread = exports.variable_from_chat_id = exports.variable_chat_id = exports.variable_force = exports.variable_user_id = exports.operationFile = exports.operationMessage = exports.operationChat = exports.operationGroup = exports.operationCustom = exports.operationContact = exports.operationUser = exports.operationLogin = exports.optionResources = void 0;
exports.variable_thumbnail_file_path = exports.variable_thumbnail_height = void 0;
exports.optionResources = {
    displayName: 'Resource',
    name: 'resource',
    type: 'options',
    options: [
        {
            name: 'Chat',
            value: 'chat',
        },
        {
            name: 'Contact',
            value: 'contact',
        },
        {
            name: 'Custom Request',
            value: 'request',
        },
        {
            name: 'File',
            value: 'file',
        },
        {
            name: 'Group',
            value: 'group',
        },
        {
            name: 'Login',
            value: 'login',
        },
        {
            name: 'Media',
            value: 'media',
        },
        {
            name: 'Message',
            value: 'message',
        },
        {
            name: 'User',
            value: 'user',
        },
    ],
    default: 'chat',
    noDataExpression: true,
    required: true,
    description: 'Get Chat History',
};
exports.operationLogin = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['login'],
        },
    },
    options: [
        {
            name: 'Login with Phone Number Using ChatTrigger',
            value: 'login',
            action: 'Login with phone number using n8n chat',
        },
        {
            name: 'Close Session',
            value: 'closeSession',
            action: 'Close session',
        },
        {
            name: 'Remove Td_database',
            value: 'removeTdDatabase',
            action: 'Remove td database',
        },
    ],
    default: 'login',
    noDataExpression: true,
};
exports.operationUser = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['user'],
        },
    },
    options: [
        {
            name: 'Create New Secret Chat',
            value: 'createNewSecretChat',
            action: 'Create new secret chat',
        },
        {
            name: 'Create Private Chat',
            value: 'createPrivateChat',
            action: 'Create private chat',
        },
        {
            name: 'Get Me',
            value: 'getMe',
            action: 'Get me',
        },
        {
            name: 'Get User',
            value: 'getUser',
            action: 'Get user',
        },
        {
            name: 'Get User Full Info',
            value: 'getUserFullInfo',
            action: 'Get user full info',
        },
    ],
    default: 'getMe',
    noDataExpression: true,
};
exports.operationContact = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['contact'],
        },
    },
    options: [
        {
            name: 'Get Contacts',
            value: 'getContacts',
            action: 'Get all user contacts',
        },
    ],
    default: 'getContacts',
    noDataExpression: true,
};
exports.operationCustom = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['request'],
        },
    },
    options: [
        {
            name: 'Custom Request',
            value: 'customRequest',
            action: 'Make custom request',
        }
    ],
    default: 'customRequest',
    noDataExpression: true,
};
exports.operationGroup = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['group'],
        },
    },
    options: [
        {
            name: 'Get Supergroup Members',
            value: 'getSupergroupMembers',
            action: 'Get supergroup members',
        },
        {
            name: 'Get Supergroup Info',
            value: 'getSupergroup',
            action: 'Get supergroup information',
        },
        {
            name: 'Get Supergroup Full Info',
            value: 'getSupergroupFullInfo',
            action: 'Get supergroup full information',
        },
    ],
    default: 'getSupergroup',
    noDataExpression: true,
};
exports.operationChat = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['chat'],
        },
    },
    options: [
        {
            name: 'Add Chat Members',
            value: 'addChatMembers',
            action: 'Adds multiple new members to a chat',
        },
        {
            name: 'Close Chat',
            value: 'closeChat',
            action: 'Close chat',
        },
        {
            name: 'Create SuperGroup or Channel',
            value: 'createNewSupergroupChat',
            action: 'Create supergroup or channel',
        },
        {
            name: 'Delete Chat',
            value: 'deleteChat',
            action: 'Delete chat',
        },
        {
            name: 'Get Chat',
            value: 'getChat',
            action: 'Get chat',
        },
        {
            name: 'Get Chat History',
            value: 'getChatHistory',
            action: 'Get chat history',
        },
        {
            name: 'Get Chats',
            value: 'getChats',
            action: 'Get chats',
        },
        {
            name: 'Join Chat',
            value: 'joinChat',
            action: 'Join chat',
        },
        {
            name: 'Mark Chat as Unread',
            value: 'toggleChatIsMarkedAsUnread',
            action: 'Mark chat as unread',
        },
        {
            name: 'Open Chat',
            value: 'openChat',
            action: 'Open chat',
        },
        {
            name: 'Search Public Chat (by Username)',
            value: 'searchPublicChat',
            action: 'Search public chat by username',
        },
        {
            name: 'Search Public Chats (Search in Username, Title)',
            value: 'searchPublicChats',
            action: 'Search public chats',
        },
        {
            name: 'Send Chat Action',
            value: 'sendChatAction',
            action: 'Sends a chat action',
        },
    ],
    default: 'getChatHistory',
    noDataExpression: true,
};
exports.operationMessage = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['message'],
        },
    },
    options: [
        {
            name: 'Delete Messages',
            value: 'deleteMessages',
            action: 'Delete messages',
        },
        {
            name: 'Edit Message Text',
            value: 'editMessageText',
            action: 'Edit message text',
        },
        {
            name: 'Forward Messages',
            value: 'forwardMessages',
            action: 'Forward messages',
        },
        {
            name: 'Get Message Link',
            value: 'getMessageLink',
            action: 'Get direct link to a specific message in a group or supergroup',
        },
        {
            name: 'Get Message Link Info',
            value: 'getMessageLinkInfo',
            action: 'Returns information about a public or private message link',
        },
        {
            name: 'Get Messages',
            value: 'getMessage',
            action: 'Get message',
        },
        {
            name: 'Send Message with Audio',
            value: 'sendMessageAudio',
            action: 'Send a message with an audio file',
        },
        {
            name: 'Send Message with File',
            value: 'sendMessageFile',
            action: 'Send a message with any file type',
        },
        {
            name: 'Send Message with Photo',
            value: 'sendMessagePhoto',
            action: 'Send message with photo',
        },
        {
            name: 'Send Message with Video',
            value: 'sendMessageVideo',
            action: 'Send message with video',
        },
        {
            name: 'Send Text Message',
            value: 'sendMessage',
            action: 'Send text message',
        },
        {
            name: 'View Messages',
            value: 'viewMessages',
            action: 'Mark messages as viewed by the user',
        }
    ],
    default: 'sendMessage',
    noDataExpression: true,
};
exports.operationFile = {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['file'],
        },
    },
    options: [
        {
            name: 'Get Remote File',
            value: 'getRemoteFile',
            action: 'Get remote file',
        },
        {
            name: 'Download File',
            value: 'downloadFile',
            action: 'Download file',
        },
    ],
    default: 'downloadFile',
    noDataExpression: true,
};
exports.variable_user_id = {
    displayName: 'User ID',
    name: 'user_id',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['getUser', 'getUserFullInfo', 'createPrivateChat', 'createNewSecretChat'],
            resource: ['user'],
        },
    },
    default: '',
    placeholder: '122323',
    description: 'ID of chat',
};
exports.variable_force = {
    displayName: 'Force',
    name: 'force',
    type: 'boolean',
    required: true,
    displayOptions: {
        show: {
            operation: ['createPrivateChat'],
            resource: ['user'],
        },
    },
    default: false,
    placeholder: '122323',
    description: 'Whether creation of private chat should be forced',
};
exports.variable_chat_id = {
    displayName: 'Chat ID',
    name: 'chat_id',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: [
                'getChat',
                'getChatHistory',
                'sendMessage',
                'sendMessagePhoto',
                'sendMessageVideo',
                'sendMessageAudio',
                'sendMessageFile',
                'deleteMessages',
                'forwardMessages',
                'toggleChatIsMarkedAsUnread',
                'getMessage',
                'editMessageText',
                'joinChat',
                'openChat',
                'closeChat',
                'deleteChat',
                'addChatMembers',
                'sendChatAction',
                'getMessageLink',
                'viewMessages'
            ],
            resource: ['chat', 'message'],
        },
    },
    default: '',
    placeholder: '122323',
    description: 'ID of chat',
};
exports.variable_from_chat_id = {
    displayName: 'From Chat ID',
    name: 'from_chat_id',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['forwardMessages'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '122323',
    description: 'ID of chat from which to forward messages',
};
exports.variable_is_marked_as_unread = {
    displayName: 'Mark as Unread?',
    name: 'is_marked_as_unread',
    type: 'boolean',
    required: true,
    displayOptions: {
        show: {
            operation: ['toggleChatIsMarkedAsUnread'],
            resource: ['chat'],
        },
    },
    default: true,
    placeholder: 'true',
    description: 'Whether Chat should be marked as Unread',
};
exports.variable_from_message_id = {
    displayName: 'From Message ID',
    name: 'from_message_id',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['getChatHistory'],
            resource: ['chat'],
        },
    },
    default: '0',
    placeholder: '133222323',
    description: 'Identifier of the message starting from which history must be fetched; use 0 to get results from the last message',
};
exports.variable_limit = {
    displayName: 'Limit',
    name: 'limit',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['getChatHistory'],
            resource: ['chat'],
        },
    },
    default: '0',
    placeholder: '100',
    description: 'Maximum number of messages to be returned; up to 100 messages can be retrieved at once',
};
exports.variable_message_ids = {
    displayName: 'Message IDs',
    name: 'message_ids',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['deleteMessages', 'forwardMessages', 'viewMessages'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '123,234,345',
    description: 'Comma-separated identifiers of the messages to be deleted or forwarded',
};
exports.variable_message_force_read = {
    displayName: 'Force Read',
    name: 'force_read',
    type: 'boolean',
    required: true,
    displayOptions: {
        show: {
            operation: ['viewMessages'],
            resource: ['message'],
        },
    },
    default: true,
    placeholder: '12345678',
    description: 'Whether to mark the specified messages as read even the chat is closed',
};
exports.variable_message_id = {
    displayName: 'Message ID',
    name: 'message_id',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['getMessage', 'editMessageText', 'getMessageLink'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '12345678',
    description: 'Identifier of the messages',
};
exports.variable_messageText = {
    displayName: 'Message Text',
    name: 'messageText',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendMessage', 'editMessageText'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: 'Sample message text',
    description: 'Text of the messages',
};
exports.variable_local_photo_path = {
    displayName: 'Message Photo',
    name: 'localFilePath',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendMessagePhoto'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '/tmp/my-pic.png',
    description: 'Local path to the file',
};
exports.variable_video_photo_path = {
    displayName: 'Message Video',
    name: 'videoFilePath',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '/tmp/my-pic.avi',
    description: 'Local path to the video file',
};
exports.variable_photo_caption = {
    displayName: 'Photo Caption',
    name: 'photoCaption',
    type: 'string',
    displayOptions: {
        show: {
            operation: ['sendMessagePhoto'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: 'My best photo',
};
exports.variable_revoke = {
    displayName: 'Delete for All Users?',
    name: 'revoke',
    type: 'boolean',
    required: true,
    displayOptions: {
        show: {
            operation: ['deleteMessages'],
            resource: ['message'],
        },
    },
    default: true,
    description: 'Whether given messages should be deleted for all users',
};
exports.variable_username = {
    displayName: 'Chat Username',
    name: 'username',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['searchPublicChat'],
            resource: ['chat'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'Username to use in searchPublicChat',
};
exports.variable_query = {
    displayName: 'Query',
    name: 'query',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['searchPublicChats'],
            resource: ['chat'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'Query used to search public chats by looking in their username and title',
};
exports.variable_file_id = {
    displayName: 'File ID',
    name: 'file_id',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['downloadFile'],
            resource: ['file'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'Identifier of the file to download',
};
exports.variable_remote_file_id = {
    displayName: 'File ID',
    name: 'remote_file_id',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['getRemoteFile'],
            resource: ['file'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'Identifier of the Remote file to download',
};
exports.variable_reply_to_msg_id = {
    displayName: 'Reply to messageId',
    name: 'reply_to_msg_id',
    type: 'string',
    displayOptions: {
        show: {
            operation: ['sendMessage', 'sendMessagePhoto', 'sendMessageAudio', 'sendMessageFile', 'sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'Identifier of Message',
};
exports.variable_message_thread_id = {
    displayName: 'Reply to threadID',
    name: 'message_thread_id',
    type: 'number',
    displayOptions: {
        show: {
            operation: ['sendMessage', 'sendMessagePhoto', 'forwardMessages', 'sendMessageFile', 'sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'If not 0, a message thread identifier in which the message will be sent',
};
exports.variable_supergroup_id = {
    displayName: 'Supergroup ID',
    name: 'supergroup_id',
    type: 'string',
    displayOptions: {
        show: {
            operation: ['getSupergroup', 'getSupergroupFullInfo'],
            resource: ['group'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'Identifier of the Supergroup',
};
exports.variable_title = {
    displayName: 'Title',
    name: 'title',
    type: 'string',
    displayOptions: {
        show: {
            operation: ['createNewSupergroupChat'],
            resource: ['chat'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'Title of the new chat or channel',
};
exports.variable_is_channel = {
    displayName: 'Is Channel?',
    name: 'is_channel',
    type: 'boolean',
    displayOptions: {
        show: {
            operation: ['createNewSupergroupChat'],
            resource: ['chat'],
        },
    },
    default: false,
    placeholder: 'false',
    description: 'Whether to create a channel',
};
exports.variable_description = {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    displayOptions: {
        show: {
            operation: ['createNewSupergroupChat'],
            resource: ['chat'],
        },
    },
    default: '',
    placeholder: 'Text',
    description: 'Chat description; 0-255 characters',
};
exports.variable_user_ids = {
    displayName: 'User IDs',
    name: 'user_ids',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            operation: ['addChatMembers'],
            resource: ['chat'],
        },
    },
    default: '',
    placeholder: '122323,2322222',
    description: 'Comma-separated list of user_ids to be added to Supergroup or Channel',
};
exports.variable_chat_action = {
    displayName: 'Action',
    name: 'action',
    type: 'options',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendChatAction'],
            resource: ['chat'],
        },
    },
    options: [
        {
            action: "Cancel",
            name: "Cancel",
            value: "chatActionCancel"
        },
        {
            action: "Recording voice note",
            name: "Recording Voice Note",
            value: "chatActionRecordingVoiceNote"
        },
        {
            action: "Typing",
            name: "Typing",
            value: "chatActionTyping"
        },
        {
            action: "Uploading document",
            name: "Uploading Document",
            value: "chatActionUploadingDocument"
        },
        {
            action: "Uploading photo",
            name: "Uploading Photo",
            value: "chatActionUploadingPhoto"
        },
        {
            action: "Uploading video",
            name: "Uploading Video",
            value: "chatActionUploadingVideo"
        },
        {
            action: "Uploading voice note",
            name: "Uploading Voice Note",
            value: "chatActionUploadingVoiceNote"
        },
    ],
    default: 'chatActionTyping',
    description: 'The action description',
};
exports.variable_audio_path = {
    displayName: 'Audio Source',
    name: 'audioSource',
    type: 'options',
    default: 'filePath',
    description: 'Whether to use a local file path or binary data from previous node',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendMessageAudio'],
            resource: ['message'],
        },
    },
    options: [
        {
            name: 'Local File Path',
            value: 'filePath',
            description: 'Use a local file path',
        },
        {
            name: 'Binary Data',
            value: 'binaryData',
            description: 'Use binary data from previous node',
        },
    ],
};
exports.variable_audio_file_path = {
    displayName: 'Audio File Path',
    name: 'audioFilePath',
    type: 'string',
    default: '',
    description: 'Path to local audio file',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendMessageAudio'],
            resource: ['message'],
            audioSource: ['filePath'],
        },
    },
};
exports.variable_audio_binary_property_name = {
    displayName: 'Binary Property',
    name: 'audioBinaryPropertyName',
    type: 'string',
    default: 'data',
    description: 'Name of the binary property containing the audio data',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendMessageAudio'],
            resource: ['message'],
            audioSource: ['binaryData'],
        },
    },
};
exports.variable_file_path = {
    displayName: 'File Path',
    name: 'filePath',
    type: 'string',
    default: '',
    description: 'Path to local file',
    required: true,
    displayOptions: {
        show: {
            operation: ['sendMessageFile'],
            resource: ['message'],
        },
    },
};
exports.variable_audio_caption = {
    displayName: 'Audio Caption',
    name: 'audioCaption',
    type: 'string',
    default: '',
    description: 'Optional caption for the audio file',
    displayOptions: {
        show: {
            operation: ['sendMessageAudio'],
            resource: ['message'],
        },
    },
};
exports.variable_send_as_voice = {
    displayName: 'Send as Voice Message',
    name: 'sendAsVoice',
    type: 'boolean',
    default: false,
    description: 'Whether to send as a voice message with waveform visualization (true) or as a regular audio file (false)',
    displayOptions: {
        show: {
            operation: ['sendMessageAudio'],
            resource: ['message'],
        },
    },
};
exports.variable_file_caption = {
    displayName: 'File Caption',
    name: 'fileCaption',
    type: 'string',
    default: '',
    description: 'Optional caption for the file',
    displayOptions: {
        show: {
            operation: ['sendMessageFile', 'sendMessageVideo'],
            resource: ['message'],
        },
    },
};
exports.variable_json = {
    displayName: 'Request (JSON)',
    name: 'request_json',
    type: 'json',
    displayOptions: {
        show: {
            operation: ['customRequest'],
            resource: ['request'],
        },
    },
    default: '',
};
exports.variable_url = {
    displayName: 'Telegram Message URL',
    name: 'url',
    type: 'string',
    displayOptions: {
        show: {
            operation: ['getMessageLinkInfo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: 'https://t.me/telepilotco/42'
};
exports.variable_video_duration = {
    displayName: 'Duration Of The Video, In Seconds',
    name: 'videoDuration',
    type: 'number',
    displayOptions: {
        show: {
            operation: ['sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '30'
};
exports.variable_video_width = {
    displayName: 'Video Width',
    name: 'videoWidth',
    type: 'number',
    displayOptions: {
        show: {
            operation: ['sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '320'
};
exports.variable_video_height = {
    displayName: 'Video Height',
    name: 'videoHeight',
    type: 'number',
    displayOptions: {
        show: {
            operation: ['sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '320'
};
exports.variable_video_supports_streaming = {
    displayName: 'On, If The Video Is Supposed To Be Streamed',
    name: 'videoSupportsStreaming',
    type: 'boolean',
    displayOptions: {
        show: {
            operation: ['sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: 'true'
};
exports.variable_thumbnail_width = {
    displayName: 'Thumbnail Width',
    name: 'thumbnailWidth',
    type: 'number',
    displayOptions: {
        show: {
            operation: ['sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '320'
};
exports.variable_thumbnail_height = {
    displayName: 'Thumbnail Height',
    name: 'thumbnailHeight',
    type: 'number',
    displayOptions: {
        show: {
            operation: ['sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '320'
};
exports.variable_thumbnail_file_path = {
    displayName: 'JPEG Thumnail Of The Video (Local File Path)',
    name: 'thumbnailFilePath',
    type: 'string',
    displayOptions: {
        show: {
            operation: ['sendMessageVideo'],
            resource: ['message'],
        },
    },
    default: '',
    placeholder: '/home/telepilot/my-video-thumbnail.jpeg'
};
//# sourceMappingURL=common.descriptions.js.map