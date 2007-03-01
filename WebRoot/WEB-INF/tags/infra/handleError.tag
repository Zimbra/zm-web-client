<%@ tag body-content="scriptless" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<c:catch var="actionException">
    <jsp:doBody/>
</c:catch>
<c:if test="${!empty actionException}">
    <zm:getException var="error" exception="${actionException}"/>
    <c:choose>
        <c:when test="${error.code eq 'ztaglib.SERVER_REDIRECT'}">
            <c:redirect url="${not empty requestScope.SERVIER_REDIRECT_URL ? requestScope.SERVIER_REDIRECT_URL : '/h/login'}"/>
        </c:when>
        <c:when test="${error.code eq 'service.AUTH_EXPIRED' or error.code eq 'service.AUTH_REQUIRED'}">
            <c:redirect url="/h/login?loginOp=relogin&loginErrorCode=${error.code}"/>
        </c:when>
        <c:otherwise>
            <app:status style="Critical">
                <fmt:message key="${error.code}"/>
            </app:status>
            <!-- ${fn:escapeXml(error.stackStrace)} -->
        </c:otherwise>
    </c:choose>
</c:if>
