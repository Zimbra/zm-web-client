<%@ tag body-content="scriptless" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:set var="emptyStatus" value="${empty requestScope.statusMessage}"/>
<table cellpadding=0 cellspacing=0>
    <tr>
        <td class="${emptyStatus ? 'StatusEmpty' : 'Status'}">
            <c:choose>
                <c:when test="${emptyStatus}">
                    <div>&nbsp;</div>
                </c:when>
                <c:otherwise>
                    <div class='${requestScope.statusClass}'>${requestScope.statusHtml ? requestScope.statusMessage : fn:escapeXml(requestScope.statusMessage)}</div>
                </c:otherwise>
            </c:choose>
        </td>
    </tr>
</table>
