<%@ tag body-content="scriptless" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:set var="emptyStatus" value="${empty requestScope.statusMessage}"/>
<c:if test="${param.dmsg == null && not emptyStatus}">
<div id="app_st_msg_div" style="display:block;">
    <table  class='${requestScope.statusClass}' cellpadding=2 cellspacing=2 align="center">
    <tr>
        <td class="Status">
            &nbsp;${requestScope.statusHtml ? requestScope.statusMessage : fn:escapeXml(requestScope.statusMessage)}
        </td>
        <td width="20%" align="right"><a onclick="return dismissMsg();" href='?dmsg&${zm:cook(pageContext.request.queryString)}'><fmt:message key="close"/></a>&nbsp;&nbsp;</td>
    </tr>
    </table>
</div>
</c:if>
<script>var dismissMsg = function(){try{document.getElementById("app_st_msg_div").style.display='none';return false;}catch(ex){return true;}}</script>