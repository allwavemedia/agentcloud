'use strict';

import { getCredentialById, getCredentialsByTeam, addCredential, deleteCredentialById, Credential } from '../db/credential';
import { removeAgentsCredential } from '../db/agent';
import { CredentialPlatform, CredentialPlatforms } from 'struct/credential';
import { dynamicResponse } from '../util';

export async function credentialsData(req, res, _next) {
	const credentials = await getCredentialsByTeam(req.params.resourceSlug);
	return {
		csrf: req.csrfToken(),
		credentials,
	};
}

/**
 * GET /[resourceSlug]/credentials
 * credentials page
 */
export async function credentialsPage(app, req, res, next) {
	const data = await credentialsData(req, res, next);
	res.locals.data = { ...data, account: res.locals.account };
	return app.render(req, res, `/${req.params.resourceSlug}/credentials`);
}

/**
 * GET /[resourceSlug]/credentials.json
 * team credentials json data
 */
export async function credentialsJson(req, res, next) {
	const data = await credentialsData(req, res, next);
	return res.json({ ...data, account: res.locals.account });
}

/**
 * GET /[resourceSlug]/credential/add
 * credential add page
 */
export async function credentialAddPage(app, req, res, next) {
	const data = await credentialsData(req, res, next); //needed?
	res.locals.data = { ...data, account: res.locals.account };
	return app.render(req, res, `/${req.params.resourceSlug}/credential/add`);
}

export async function credentialData(req, res, _next) {
	const credential = await getCredentialById(req.params.resourceSlug, req.params.credentialId);
	return {
		csrf: req.csrfToken(),
		credential,
	};
}

/**
 * GET /[resourceSlug]/credential/[credentialId].json
 * team page html
 */
export async function credentialJson(app, req, res, next) {
	const data = await credentialData(req, res, next);
	return res.json({ ...data, account: res.locals.account });
}

/**
 * @api {post} /forms/credential/add Add a credential
 * @apiName add
 * @apiGroup Credential
 *
 * @apiParam {String} name Credential name
 * TODO
 */
export async function addCredentialApi(req, res, next) {

	const { name, platform, key, endpointURL }  = req.body;

	if (!name || typeof name !== 'string' || name.length === 0
		|| !key || typeof key !== 'string' || key.length === 0
		|| !platform || typeof platform !== 'string' || platform.length === 0 || !CredentialPlatforms.includes(platform as CredentialPlatform)
		/*TODO: endpointUrl*/) {
		return dynamicResponse(req, res, 400, { error: 'Invalid inputs' });
	}

	//TODO: change the org to the one matching the resourceSlug team
	const addedCredential = await addCredential({
		orgId: res.locals.account.currentOrg,
		teamId: req.params.resourceSlug,
	    name,
	    createdDate: new Date(),
	    platform: platform as CredentialPlatform,
	    credentials: {
			key,
		    endpointURL,
	    },
	});

	return dynamicResponse(req, res, 302, { _id: addedCredential.insertedId, redirect: `/${req.params.resourceSlug}/credentials` });

}

/**
 * @api {delete} /forms/credential/[credentialId] Delete a credential
 * @apiName delete
 * @apiGroup Credential
 *
 * @apiParam {String} credentialId Credential id
 */
export async function deleteCredentialApi(req, res, next) {

	const { credentialId }  = req.body;

	if (!credentialId || typeof credentialId !== 'string' || credentialId.length !== 24) {
		return dynamicResponse(req, res, 400, { error: 'Invalid inputs' });
	}

	await Promise.all([
		removeAgentsCredential(req.params.resourceSlug, credentialId),
		deleteCredentialById(req.params.resourceSlug, credentialId),
	]);

	return dynamicResponse(req, res, 302, { /*redirect: `/${req.params.resourceSlug}/credentials`*/ });

}
