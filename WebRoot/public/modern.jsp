<%@ page buffer="8kb" autoFlush="true" %>
<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%@ page import="java.util.*,javax.naming.*,com.zimbra.client.ZAuthResult" %>
<%
	
    ZAuthResult authResult = (ZAuthResult) request.getAttribute("authResult");
    pageContext.setAttribute("csrfToken", authResult.getCsrfToken());
%>
<script TYPE="text/javascript">
    localStorage.setItem("csrfToken" , "${csrfToken}");
    
    const currentURL = new URL(window.location.href);
    const redirectToPath = currentURL.searchParams.get("RelayState") || '';

    /**
     * After sucessful login app will redirect to RelayState path if it exist and it start with /modern/ and'
     * if redirectToPath doesn't contains /../ (i.e. parent directory access)
     * i.e. https://<server>/?RelayState=%2Fmodern%2Fcalendar on this case app will 
     * redirect to https://<server>/modern/calendar
     */
    if (redirectToPath.indexOf('/modern/') === 0 && !redirectToPath.includes('/../')) {
        window.location.href = window.location.origin + redirectToPath;
    } else {
        var url = window.location.origin + "/modern/"
        window.location.href = url;
    }
</script>
