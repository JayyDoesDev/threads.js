const EventEmitter = require('node:events');
const { fetch } = require("undici");
const RESTManager = require('./managers/RESTManager');
const UserManager = require('./managers/UserManager');
const PostManager = require('./managers/PostManager');
const FeedManager = require('./managers/FeedManager')

async function getToken(username, password) {
	const id = (Math.random() * 1e24).toString(36);
	const url =
		"https://i.instagram.com/api/v1/bloks/apps/com.bloks.www.bloks.caa.login.async.send_login_request/";

	const params = {
		client_input_params: {
			password: password,
			contact_point: username,
			device_id: `android-${id}`,
		},
		server_params: {
			credential_type: "password",
			device_id: `android-${id}`,
		},
	};

	const bkClientContext = {
		bloks_version:
			"5f56efad68e1edec7801f630b5c122704ec5378adbee6609a448f105f34a9c73",
		styles_id: "instagram",
	};

	const requestBody = {
		params: JSON.stringify(params),
		bk_client_context: JSON.stringify(bkClientContext),
		bloks_versioning_id:
			"5f56efad68e1edec7801f630b5c122704ec5378adbee6609a448f105f34a9c73",
	};

	const requestOptions = {
		method: "POST",
		headers: {
			"User-Agent": "Barcelona 289.0.0.77.109 Android",
			"Sec-Fetch-Site": "same-origin",
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		},
		body: `params=${encodeURIComponent(
			requestBody.params
		)}&bk_client_context=${encodeURIComponent(
			requestBody.bk_client_context
		)}&bloks_versioning_id=${requestBody.bloks_versioning_id}`,
	};

	const response = await fetch(url, requestOptions);
	const text = await response.text();
	const pos = text.search("Bearer IGT:2:");
	const sliced = text.substring(pos);
	const token = sliced.substring(13, sliced.search(/\\\*?/gm));
	return token;
}

class Client extends EventEmitter {
	constructor({ token, userAgent, appId }) {
		super({ captureRejections: true });
		
		if (!token) {
			throw new Error("Token is required.");
		}

		this.token = token;
		this.userAgent = userAgent || "Barcelona 289.0.0.77.109 Android";
		this.appId = appId || "238260118697367";
		this.androidId = (Math.random() * 1e24).toString(36);

		this.rest = new RESTManager(this);

		this.users = new UserManager(this);

		this.posts = new PostManager(this);

		this.feeds = new FeedManager(this);
	}
}

module.exports = {
	getToken,
	Client,
};
