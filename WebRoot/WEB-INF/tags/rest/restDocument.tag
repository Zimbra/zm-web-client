<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>

<zm:getDocument  var="doc" box="${mailbox}" id="${requestScope.zimbra_target_item_id}"/>

<c:set var="contentType" value="${doc.contentType}"/>
<c:choose>
    <c:when test="${(contentType eq 'application/x-zimbra-slides')}">
        <rest:slideView/>
    </c:when>
    <c:when test="${(contentType eq 'application/x-zimbra-xls')}">
        <rest:spreadsheetView/>
    </c:when>
    <c:otherwise>
        <fmt:message key="unsupportedRestView"/>
    </c:otherwise>
</c:choose>