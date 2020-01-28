<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%
	
    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
    pageContext.setAttribute("csrfToken", authResult.getCsrfToken());
%>
<script TYPE="text/javascript">
    localStorage.setItem("csrfToken" , "${csrfToken}");
    var url = window.location.origin + "/modern/"
    window.location.href = url;
</script>
