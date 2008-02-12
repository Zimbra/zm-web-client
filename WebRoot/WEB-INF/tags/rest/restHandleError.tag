<%@ tag body-content="scriptless" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:catch var="actionException">
    <jsp:doBody/>
</c:catch>
<c:if test="${!empty actionException}">
    <zm:getException var="error" exception="${actionException}"/>
    <rest:status style="Critical">
        <fmt:message key="${error.code}"/>
    </rest:status>
    <!-- ${fn:escapeXml(error.stackStrace)} -->
</c:if>
