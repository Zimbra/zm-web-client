<%@ tag body-content="empty" %>
<%@ attribute name="email" rtexprvalue="true" required="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:if test="${!empty email}">
        <tr><td class="contactOutput"><a href="/h/search?action=compose&to=${email}">${fn:escapeXml(email)}</a></td></tr>
</c:if>