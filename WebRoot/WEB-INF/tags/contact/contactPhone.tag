<%@ tag body-content="empty" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="phone" rtexprvalue="true" required="true" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:if test="${!empty phone}">
    <fmt:message key="${label}" var="label"/>
    <tr><td class="contactLabel">${fn:escapeXml(label)}:</td><td class="contactOutput">${fn:escapeXml(phone)}</td></tr>
</c:if>
