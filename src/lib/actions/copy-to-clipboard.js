/**
 * @type {import('svelte/action').Action<HTMLButtonElement, {content: string}>}
 *
 * @param {HTMLButtonElement} node
 * @param {{content: string}} param
 */
export function copy_to_cb(node, param) {
	async function handle_click() {
		try {
			await navigator.clipboard.writeText(param.content);
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
