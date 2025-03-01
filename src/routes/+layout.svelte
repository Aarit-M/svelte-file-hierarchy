<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<style>
	:global(body) {
		background-color: rgb(229, 229, 229);
		margin: 0;
		min-height: 100vh;
	}
</style>

{@render children()}
