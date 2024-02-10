import { fail } from '@sveltejs/kit';
import { parse } from 'node-html-parser';

/** @type {import('./$types').Actions} */
export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const input_url = data.get('input_url');

		if (!input_url || typeof input_url !== 'string') {
			return fail(400, { input_url, error: true, code: 'invalid_url', message: 'Invalid URL.' });
		}

		/** @type {URL} */
		let url;

		try {
			url = new URL(input_url);
		} catch (error) {
			return fail(400, { input_url, error: true, code: 'invalid_url', message: 'Invalid URL.' });
		}

		try {
			const response = await fetch(url);
			const raw = await response.text();
			const html = parse(raw);
			const links = html.querySelectorAll('link[rel=alternate][type=application/rss+xml]');

			if (!links.length) {
				return fail(400, {
					input_url,
					code: 'url_not_found',
					error: true,
					message: 'Unable to find RSS URL.'
				});
			}

			return {
				success: true,
				// TODO: Check value.
				result_url: links[0].getAttribute('href')
			};
		} catch (error) {
			console.log(error);
		}
	}
};
