<script>
	import { applyAction, enhance } from '$app/forms';
	import { copy_to_cb } from '$lib/actions/copy-to-clipboard.js';

	const { form } = $props();

	let can_submit = $state(false);
	let error_message = $state('');
	let input_url = $state('');
	let is_submitting = $state(false);
	let result_url = $state('');

	/** @param {Event & {currentTarget: EventTarget & HTMLInputElement}} event */
	function handle_change(event) {
		input_url = event.currentTarget.value;
	}

	/** @type {import('@sveltejs/kit').SubmitFunction} */
	function handle_submit({ cancel }) {
		if (!can_submit) {
			cancel();
			return;
		}

		error_message = '';
		is_submitting = true;
		result_url = '';

		try {
			const url = new URL(input_url);
			// TODO: Check hostname for YT hostname variations.
			const list = url.searchParams.get('list');

			if (list) {
				cancel();
				input_url = '';
				is_submitting = false;
				result_url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${list}`;
				return;
			}

			return async ({ result }) => {
				await applyAction(result);
				is_submitting = false;

				if (result_url) {
					input_url = '';
				}
			};
		} catch (error) {
			cancel();
			is_submitting = false;
			// Maybe TODO: Show error.
			console.log(error);
		}
	}

	/** @param {Event & {currentTarget: EventTarget & HTMLInputElement}} event */
	function handle_click_result_url(event) {
		event.currentTarget.select();
	}

	$effect(() => {
		if (!input_url) {
			can_submit = false;
			return;
		}

		try {
			new URL(input_url);
			can_submit = true;
		} catch (error) {
			can_submit = false;
		}
	});

	$effect(() => {
		if (form?.input_url) {
			input_url = form.input_url.toString();
		}

		if (form?.success && form?.result_url) {
			result_url = form.result_url;
		}

		if (form?.error && form?.message) {
			error_message = form.message;
		}
	});
</script>

<svelte:head>
	<title>YouTube RSS URL Extractor</title>
</svelte:head>

<div class="container">
	<header>
		<a href="https://github.com/kucrut/youtube-rss-url-extractor" target="_blank">Fork on GitHub</a>
	</header>

	<main>
		<h1>YouTube RSS URL Extractor</h1>

		<form method="post" use:enhance={handle_submit}>
			<p class="field">
				<label for="yt-url">YouTube URL:</label>
				<input
					disabled={is_submitting}
					id="yt-url"
					name="input_url"
					type="url"
					value={input_url}
					onchange={handle_change}
					oninput={handle_change}
				/>
			</p>
			<p>
				<button disabled={is_submitting || !can_submit} type="submit">Get RSS URL</button>
			</p>
		</form>

		{#if error_message}
			<p class="error">{error_message}</p>
		{/if}

		{#if result_url}
			<div>
				<h3>Success!</h3>
				<p class="result">
					<label for="result-url">RSS URL</label>
					<input readonly id="result-url" value={result_url} onclick={handle_click_result_url} />
					<button type="button" use:copy_to_cb>Copy URL</button>
				</p>
			</div>
		{/if}
	</main>
</div>

<style>
	header {
		display: flex;
		justify-content: end;
		padding: 0.5rem;
		margin-block-end: 1rem;
	}

	header a::after {
		content: '\00a0\1f865';
	}

	h1 {
		text-align: center;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.result {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: center;
	}

	.result label {
		align-self: end;
	}

	.result input {
		border: unset;
		flex-grow: 1;
	}
</style>
