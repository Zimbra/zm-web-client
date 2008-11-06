<%@ taglib prefix="zm" uri="com.zimbra.zm" %><%
	// no cache
	response.addHeader("Vary", "User-Agent");
	response.setHeader("Expires", "Tue, 24 Jan 2000 17:46:50 GMT");
	response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
	response.setHeader("Pragma", "no-cache");

	// content-type
	response.setContentType("text/html");

	// data
	String data = request.getParameter("data");
	if (data != null) {
		// TODO: protecting against script tag in text is making some assumptions
		data = data.replaceAll("(</[Ss][Cc])([Rr][Ii])","$1\"+\"$2");
	}
%>
<script>
var reqId = "${zm:jsEncode(param.reqId)}";
var data = <%=data != null && !data.equals("") ? data : "{}"%>;
</script>
<script>
parent.parent.parent.appCtxt.getRequestMgr().sendRequest({reqId:reqId,response:data});
</script>