<%@ tag body-content="empty" %>
<%@ attribute name="appt" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZApptSummary" %>
<%@ attribute name="start" rtexprvalue="true" required="true"%>
<%@ attribute name="end" rtexprvalue="true" required="true"%>
<%@ attribute name="width" rtexprvalue="true" required="true"%>
<%@ attribute name="rowspan" rtexprvalue="true" required="true"%>
<%@ attribute name="colspan" rtexprvalue="true" required="true"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="color" value="${zm:getFolder(pageContext,appt.folderId).styleColor}"/>
<c:choose>
    <c:when test="${appt.allDay}">
        <c:if test="${appt.startTime lt start}"><c:set var="bleft" value='border-left:none;'/></c:if>
        <c:if test="${appt.endTime gt end}"><c:set var="bright" value='border-right:none;'/></c:if>
        <div <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright}"</c:if> 
                class='ZhCalMonthAllDayAppt ${color}${appt.partStatusNeedsAction ? 'Dark' : 'Light'}'>
                ${fn:escapeXml(appt.name)}
        </div>
    </c:when>
    <c:otherwise>
        <td class='ZhCalDayAppt ${color}${appt.partStatusNeedsAction ? 'BG' : 'BG'}' valign=top width='${width}%'<c:if test="${colspan ne 1}"> colspan='${colspan}'</c:if><c:if test="${rowspan ne 1}"> rowspan='${rowspan}'</c:if>>
            <fmt:message key="CAL_DAY_APPT">
                <fmt:param value="${appt.startDate}"/>
                <fmt:param value="${fn:escapeXml(appt.name)}"/>
            </fmt:message>
        </td>
    </c:otherwise>
</c:choose>

