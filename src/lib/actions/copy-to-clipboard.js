/**
 * @type {import('svelte/action').Action}
 *
 * @param {HTMLButtonElement} node
 */
export function copy_to_cb(node) {
	async function handle_click() {
		if (!(node.previousElementSibling instanceof HTMLInputElement)) {
			return;
		}

		try {
			await navigator.clipboard.writeText(node.previousElementSibling.value);
		} catch (err) {
			console.error(err);
		}
	}

	node.addEventListener('click', handle_click);

	return {
		destroy() {
			node.removeEventListener('click', handle_click);
		}
	};
}
