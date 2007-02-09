<%@ tag body-content="empty" %>
<%@ attribute name="appt" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZApptSummary" %>
<%@ attribute name="start" rtexprvalue="true" required="true"%>
<%@ attribute name="end" rtexprvalue="true" required="true"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<%-- TODO: take into account start/end and adjust appt start/end for rendering --%>
<c:set var="color" value="${zm:getFolder(pageContext,appt.folderId).styleColor}"/>
<c:choose>
    <c:when test="${appt.allDay}">
        <c:if test="${appt.startTime lt start}"><c:set var="bleft" value='border-left:none;'/></c:if>
        <c:if test="${appt.endTime gt end}"><c:set var="bright" value='border-right:none;'/></c:if>
        <div <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright}"</c:if> 
                class='ZhCalDayAllDayAppt ${color}${appt.partStatusNeedsAction ? 'Dark' : 'Light'}'>
                ${fn:escapeXml(appt.name)}
        </div>
    </c:when>
    <c:when test="${appt.duration gt 1000*60*15}">
        <table class='ZhCalDayAppt' width=100% height=100% border=0 cellspacing=0 cellpadding="2">
            <tr>
                <td class='${color}${appt.partStatusNeedsAction ? 'Light' : 'Light'}' valign=top>
                    <c:set var="startDate" value="${appt.startDate.time lt start ? 'L' : ''}"/>
                     <fmt:message key="CAL_DAY_APPT_TOP${startDate}">
                        <fmt:param value="${appt.startDate}"/>
                    </fmt:message>
                </td>
            </tr>
            <tr>
                <td height=100% class='${color}${appt.partStatusNeedsAction ? 'BG' : 'BG'}' valign=top>
                    <fmt:message key="CAL_DAY_APPT_BODY">
                        <fmt:param value="${fn:escapeXml(appt.name)}"/>
                    </fmt:message>
                </td
            </tr>
            <c:if test="${appt.duration gt 1000*60*60}">
            <tr>
                <td align=left valign=bottom height=1% class='ZhCalDayApptEnd ${color}${appt.partStatusNeedsAction ? 'BG' : 'BG'}'>
                    <c:set var="endDate" value="${appt.endDate.time gt end ? 'L' : ''}"/>
                    <fmt:message key="CAL_DAY_APPT_BOT${endDate}">
                        <fmt:param value="${appt.endDate}"/>
                    </fmt:message>
                </td>
            </tr>
            </c:if>
        </table>
    </c:when>
    <c:otherwise>
        <table class='ZhCalDayAppt' width=100% height=100% border=0 cellspacing=0 cellpadding="2">
            <tr>
                <td class='${color}${appt.partStatusNeedsAction ? 'Light' : 'Light'}' valign=top>
                    <fmt:message key="CAL_DAY_APPT30">
                        <fmt:param value="${appt.startDate}"/>
                        <fmt:param value="${fn:escapeXml(appt.name)}"/>
                    </fmt:message>
                </td>
            </tr>
        </table>
    </c:otherwise>
</c:choose>

