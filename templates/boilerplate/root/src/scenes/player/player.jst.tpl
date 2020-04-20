{{+ import Button from "<%=name%>/widgets/button/button"; }}

<div class="row scenes">
	{{% Button, 'Home', homeButton }}
</div>
<div class="row history">
	{{% Button, 'Back in history', backButton }}
	{{% Button, 'Forward in history', forwardButton }}
</div>
