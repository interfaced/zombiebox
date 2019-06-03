{{+ import Greeting from "<%=name%>/widgets/greeting/greeting"; }}

<h1>Empty "<%=name%>" project!</h1>
{{% Greeting, {}, greeting }}
