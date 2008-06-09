<%@ tag body-content="empty" %>
<%@ attribute name="accountindex" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>
</app:handleError>

<c:if test="${zm:actionSet(param, 'actionSave')}">
    <c:choose>
        <c:when test="${param.callForwardingAllActive and not zm:isValidPhoneNumber(param.callForwardingAllNumber)}">
            <app:status style="Critical"><fmt:message key="invalidForwardNumber"/></app:status>
			<c:set var="badCallForwardingAll" scope="request" value="${param.callForwardingAllNumber}"></c:set>
		</c:when>
        <c:otherwise>
            <zm:modifyCallFeatures var="result" phone="${param.phone}"
                emailnotificationactive="${param.emailNotificationActive}" emailnotificationaddress="${param.emailNotificationAddress}"
                callforwardingactive="${param.callForwardingAllActive}" callforwardingforwardto="${param.callForwardingAllNumber}"
                numberPerPage="${param.numberPerPage}"
            />
            <c:choose>
                <c:when test="${result}">
                    <app:status><fmt:message key="optionsSaved"/></app:status>
                </c:when>
                <c:otherwise>
                    <app:status><fmt:message key="noOptionsChanged"/></app:status>
                </c:otherwise>
            </c:choose>
        </c:otherwise>
    </c:choose>
</c:if>

