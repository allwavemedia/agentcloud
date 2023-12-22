'use strict';

import { CredentialPlatform } from 'struct/credential';

export const ModelList = {
	[CredentialPlatform.OPENAI]: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-1106-preview'],
	[CredentialPlatform.AZURE]: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-1106-preview'],
	[CredentialPlatform.LMSTUDIO]: null,
};
