<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="query" rtexprvalue="true" required="false" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ attribute name="selectedId" rtexprvalue="true" required="false" %>
<%@ attribute name="checkedCalendars" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>    
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="yearTitleFormat" key="CAL_DAY_TITLE_YEAR_FORMAT"/>

    <c:set var="currentDay" value="${zm:getFirstDayOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, view)}"/>
    <c:set var="scheduleView" value="${view eq 'schedule'}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="rangeEnd" value="${zm:addDay(currentDay,numdays).timeInMillis}"/>
    <c:if test="${empty checkedCalendars}">
        <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    </c:if>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${rangeEnd}" query="${query}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <mo:status style="Critical">
            <fmt:message key="${error.code}"/>
        </mo:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <zm:apptMultiDayLayout timezone="${timezone}"
            schedule="${scheduleView ? checkedCalendars : ''}"
            var="layout" appointments="${appts}" start="${currentDay.timeInMillis}" days="${numdays}"
            hourstart="${mailbox.prefs.calendarDayHourStart}" hourend="${mailbox.prefs.calendarDayHourEnd}"/>
</mo:handleError>


<table width="100%" border="0" cellpadding="0" cellspacing="0" style='height:100%'>

<c:forEach var="row" items="${layout.allDayRows}">
    <tr>
        <td class='zo_cal_allday' align='center' valign="middle" nowrap="nowrap" width="1%" style='border-left:none'>
            <fmt:message key="apptAllDay"/>
        </td>
        <c:choose>
            <c:when test="${scheduleView}">
                <c:set var="overlap" value="${layout.scheduleAlldayOverlapCount}"/>
                <c:set var ="oc" value="${overlap gt 0 ? ' ZhCalSchedUnion ' :''}"/>
                <c:set var="opacity" value="${20 + 60 * (overlap / layout.numDays)}"/>
                <td valign='top' class='${oc}zo_cal_hs zo_cal_dsep' height=100% <c:if test="${overlap gt 0}"> style='opacity:${opacity/100};filter:alpha(opacity=${opacity})'</c:if>>
                    &nbsp;
                </td>
            </c:when>
            <c:otherwise>
                <td class='zo_cal_hs' height="100%" width="1px">&nbsp;</td>
            </c:otherwise>
        </c:choose>
        <c:forEach var="cell" items="${row.cells}">
            <td style='padding: 1px'  valign="middle" height="100%" width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if>>
                <c:choose>
                    <c:when test="${not empty cell.appt}">
                        <c:set var="testId" value="${cell.appt.id}-${selectedId}"/>
                            <mo:dayAppt appt="${cell.appt}" selected="${testId eq cell.appt.inviteId}" start="${currentDay.timeInMillis}" end="${rangeEnd}" timezone="${timezone}"/>
                    </c:when>
                    <c:otherwise>
                        &nbsp;
                    </c:otherwise>
                </c:choose>
            </td>
        </c:forEach>
        <td style='width:10px'>&nbsp;</td>
    </tr>
</c:forEach>
<tr>
    <td class='zo_cal_adb' nowrap="nowrap" width="1%" style='border-left:none'>
        &nbsp;
    </td>
    <c:choose>
        <c:when test="${scheduleView}">
            <c:set var="overlap" value="${layout.scheduleAlldayOverlapCount}"/>
            <c:set var ="oc" value="${overlap gt 0 ? ' ZhCalSchedUnion ' :''}"/>
            <c:set var="opacity" value="${20 + 60 * (overlap / layout.numDays)}"/>
            <td valign='top' class='${oc}zo_cal_adhs zo_cal_dsep' height="100%" <c:if test="${overlap gt 0}"> style='opacity:${opacity/100};filter:alpha(opacity=${opacity})'</c:if>>
                &nbsp;
            </td>
        </c:when>
        <c:otherwise>
            <td class='zo_cal_adhs' height="100%" width="1px">&nbsp;</td>
        </c:otherwise>
    </c:choose>
    <c:forEach var="day" items="${layout.days}">
        <td class='zo_cal_adb' colspan="${day.maxColumns}" width="${day.width}%">
            &nbsp;
        </td>
    </c:forEach>
    <td class='zo_cal_adb' style='width:10px'>&nbsp;</td>
</tr>
<c:forEach var="row" items="${layout.rows}">
    <tr style='height:100%'>
        <c:if test="${row.rowNum % 4 eq 0}">
            <td class='zo_cal_dayhour' nowrap="nowrap" width="1%" rowspan="4" style='border-left:none'>
                <fmt:formatDate value="${row.date}" type="time" timeStyle="short"/>
            </td>
        </c:if>
        <c:choose>
            <c:when test="${scheduleView}">
                <c:set var="hs" value="${row.rowNum mod 4 eq 3 ? 'zo_cal_dhb ' : (row.rowNum mod 4 eq 1 ? 'zo_Cal_dhhb ' : '')}"/>
                <c:set var="overlap" value="${row.scheduleOverlapCount}"/>
                <c:set var ="oc" value="${overlap gt 0 ? ' ZhCalSchedUnion ' :''}"/>
                <c:set var="opacity" value="${20 + 60 * (overlap / layout.numDays)}"/>
                <td valign='top' class='${hs}${oc}ZhCalDayUnionSEP' height="100%" <c:if test="${overlap gt 0}"> style='opacity:${opacity/100};filter:alpha(opacity=${opacity})'</c:if>>
                    &nbsp;
                </td>
            </c:when>
            <c:otherwise>
                <td <c:if test="${row.rowNum % 4 ne 3}">class='zo_cal_hs' </c:if><c:if test="${row.rowNum % 4 eq 3}">class='zo_cal_hsb' </c:if> height="100%" width="1px">&nbsp;</td>
            </c:otherwise>
        </c:choose>
        <c:set var="prevDay" value="${0}"/>
        <c:forEach var="cell" items="${row.cells}">
            <c:set var="diffDay" value="${prevDay ne cell.day.day}"/>
            <c:if test="${diffDay}">
                <c:set var="prevDay" value="${cell.day.day}"/>
            </c:if>
            <c:choose>
                <c:when test="${not empty cell.appt and cell.isFirst}">

                    <td <c:if test="${diffDay}">class='zo_cal_dsep' </c:if> valign="top" height="100%" width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if><c:if test="${cell.rowSpan ne 1}"> rowspan='${cell.rowSpan}'</c:if>>
                        <c:set var="testId" value="${cell.appt.id}-${selectedId}"/>
                        <mo:dayAppt appt="${cell.appt}" selected="${testId eq cell.appt.inviteId}" start="${cell.day.startTime}" end="${cell.day.endTime}" timezone="${timezone}"/>
                    </td>
                </c:when>
                <c:when test="${empty cell.appt}">
                    <c:set var="hb" value="${row.rowNum mod 4 eq 3 ? 'zo_cal_dhb ' : (row.rowNum mod 4 eq 1 ? 'zo_cal_dhhb ' : '')}"/>
                    <c:set var="dd" value="${diffDay ? 'zo_cal_dsep' : ''}"/>
                    <td <c:if test="${not empty hb or not empty dd}">class='${hb}${dd}' </c:if> height="100%" width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if><c:if test="${cell.rowSpan ne 1}"> rowspan='${cell.rowSpan}'</c:if>>&nbsp;</td>
                </c:when>
            </c:choose>
        </c:forEach>
        <td style='width:10px'>&nbsp;</td>
    </tr>
</c:forEach>
</table>
