<!DOCTYPE html>
<html>
	<head>
		<title>ZombieBox</title>
		<meta charset="utf-8">
		<!-- styles -->
		<% if (styles.length) {
		print('<link rel="stylesheet" href="' + styles.join('">\n\t<link rel="stylesheet" href="') + '">');
		} %>

		<!-- inlineStyles -->
		<% if (inlineStyles.length) {
		print('<style>' + inlineStyles.join('</style>\n\t<style>') + '</style>');
		} %>

		<!-- modules -->
		<% if (modules.length) {
		print('<script type="module" src="' + modules.join('"></script>\n\t<script type="module" src="') + '"></script>');
		} %>

		<!-- scripts -->
		<% if (scripts.length) {
		print('<script src="' + scripts.join('"></script>\n\t<script src="') + '"></script>');
		} %>

		<!-- inlineScripts -->
		<% if (inlineScripts.length) {
		print('<script>' + inlineScripts.join('</script>\n\t<script>') + '</script>');
		} %>
	</head>
	<body></body>
</html>
