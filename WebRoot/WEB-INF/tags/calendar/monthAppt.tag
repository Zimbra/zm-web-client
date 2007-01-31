<%@ tag body-content="empty" %>
<%@ attribute name="appt" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZApptSummary" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="color" value="${zm:getFolder(pageContext,appt.folderId).styleColor}"/>
<c:choose>
    <c:when test="${appt.allDay}">
        <div class='ZhCalMonthAllDayAppt ${color}${appt.partStatusNeedsAction ? 'Dark' : 'Light'}'>
                ${fn:escapeXml(appt.name)}
        </div>
    </c:when>
    <c:otherwise>
        <div class='ZhCalMonthAppt ${color}${appt.partStatusNeedsAction ? 'DarkC' : 'C'}'>
            <fmt:message key="CAL_MONTH_APPT">
                <fmt:param value="${appt.startDate}"/>
                <fmt:param value="${fn:escapeXml(appt.name)}"/>
            </fmt:message>
        </div>
    </c:otherwise>
</c:choose>

