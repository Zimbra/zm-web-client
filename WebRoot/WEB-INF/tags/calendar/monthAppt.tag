<%@ tag body-content="empty" %>
<%@ attribute name="appt" rtexprvalue="true" required="true" type="com.zimbra.cs.zclient.ZAppointmentHit" %>
<%@ attribute name="start" rtexprvalue="true" required="true"%>
<%@ attribute name="end" rtexprvalue="true" required="true"%>
<%@ attribute name="color" rtexprvalue="true" required="false"%>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:message var="noSubject" key="noSubject"/>
<c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
<app:calendarUrl appt="${appt}" var="apptUrl"/>

<fmt:setTimeZone value="${timezone}"/>
<c:if test="${empty color}"><c:set var="color" value="${zm:getFolder(pageContext,appt.folderId).styleColor}"/></c:if>
<c:set var="needsAction" value="${appt.partStatusNeedsAction}"/>
<c:choose>
    <c:when test="${appt.allDay}">
        <c:if test="${appt.startTime lt start}"><c:set var="bleft" value='border-left:none;'/></c:if>
        <c:if test="${appt.endTime gt end}"><c:set var="bright" value='border-right:none;'/></c:if>
        <div <c:if test="${not empty bleft or not empty bright}">style="${bleft}${bright}"</c:if>
             class='ZhCalMonthAllDayAppt${needsAction ? 'New ':' '} ${color}${needsAction ? 'Dark' : 'Light'}'>
            <c:if test="${param.action ne 'print'}"> <a href="${fn:escapeXml(apptUrl)}"></c:if>${fn:escapeXml(subject)}<c:if test="${param.action ne 'print'}"></a></c:if>
        </div>
    </c:when>
    <c:otherwise>
        <div class='ZhCalMonthAppt ${color}${needsAction ? 'DarkC' : 'C'}'>
            <c:if test="${param.action ne 'print'}">    <a href="${fn:escapeXml(apptUrl)}">
            <c:choose>
                <c:when test="${appt.startTime lt start}">
                    &laquo;
                </c:when>
                <c:otherwise>
                    &bull;&nbsp;<fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>
                </c:otherwise>
            </c:choose>
            </c:if>&nbsp;${fn:escapeXml(subject)}
            <c:if test="${param.action ne 'print'}">
                <c:if test="${end lt appt.endTime}">
                    &nbsp;&raquo;
                </c:if>
            </c:if>
        </a>
        </div>
    </c:otherwise>
</c:choose>

