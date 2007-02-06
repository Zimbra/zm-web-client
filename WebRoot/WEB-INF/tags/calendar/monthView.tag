<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Date" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <fmt:message key="noSubject" var="noSubject"/>
    <zm:getMailbox var="mailbox"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="dayFormat" key="CAL_MONTH_DAY_FORMAT"/>
    <fmt:message var="dayMonthChangeFormat" key="CAL_MONTH_DAY_MONTH_CHANGE_FORMAT"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date}" pattern="${titleFormat}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />
    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <c:set var="today" value="${zm:getToday()}"/>
    <c:set var="dateCal" value="${zm:getCalendar(date)}"/>
    <c:set var="prevDate" value="${zm:pageMonth(dateCal, false)}"/>
    <c:set var="nextDate" value="${zm:pageMonth(dateCal,  true)}"/>  
    <c:set var="currentDay" value="${zm:getFirstDayOfMonth(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <zm:getAppointmentSummaries var="appts" start="${currentDay.timeInMillis}" end="${currentDay.timeInMillis+1000*60*60*24*42}"/>
</app:handleError>

<app:view title="${title}" context="${null}" selected='calendar' calendars="true" minical="true" keys="true" date="${date}">
    <table width=100%  cellpadding="0" cellspacing="0" border=0>
        <tr>
            <td class='TbTop'>
                <app:calendarViewToolbar today="${today}" date="${dateCal}" prevDate="${prevDate}" nextDate="${nextDate}" title="${title}" context="${context}" keys="true"/>
            </td>
        </tr>
        <tr>
            <td class='ZhAppContent'>
                <table width=100% class='ZhCalMonthHeaderTable' cellpadding=2 cellspacing=0 border=0>
                    <tr>
                        <td colspan=7 class='ZhCalMonthHeaderMonth'>
                                ${fn:escapeXml(title)}
                        </td>
                    </tr>
                    <tr>
                        <c:forEach var="day"
                                   begin="${mailbox.prefs.calendarFirstDayOfWeek}"
                                   end="${mailbox.prefs.calendarFirstDayOfWeek+6}">
                            <td width=14% class='ZhCalMonthHeaderCellsText'>
                                    ${weekDays[(day mod 7)+1]}
                            </td>
                        </c:forEach>
                    </tr>
                </table>
                <table width=100% cellpadding="0" cellspacing="0" border=0 class='ZhCalMonthTable'>
                    <c:set var="lastMonth" value="-1"/>
                    <c:forEach var="week" begin="1" end="6">
                        <tr>
                            <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                                <td width=14% class='ZhCalMonthDay${currentDay.timeInMillis eq dateCal.timeInMillis ? 'Selected':''}'>
                                    <table width=100% cellspacing=2>
                                        <tr>
                                            <c:choose>
                                                <c:when test="${zm:isSameDate(currentDay,today) and zm:isSameMonth(currentDay,dateCal)}">
                                                    <c:set var="clazz" value='ZhCalDOMT'/>
                                                </c:when>
                                                <c:when test="${zm:isSameDate(currentDay,today) and not zm:isSameMonth(currentDay,dateCal)}">
                                                    <c:set var="clazz" value='ZhCalDOMOT'/>
                                                </c:when>
                                                <c:when test="${not zm:isSameMonth(currentDay,dateCal)}">
                                                    <c:set var="clazz" value='ZhCalDOMO'/>
                                                </c:when>
                                                <c:otherwise>
                                                    <c:set var="clazz" value='ZhCalDOM'/>
                                                </c:otherwise>
                                            </c:choose>
                                            <td align=right class='${clazz}'>
                                                <fmt:formatDate var="dayTitle" value="${currentDay.time}" pattern="${zm:getMonth(currentDay) ne lastMonth ? dayMonthChangeFormat : dayFormat}"/>
                                                <c:set var="lastMonth" value="${zm:getMonth(currentDay)}"/>
                                                    ${fn:escapeXml(dayTitle)}
                                            </td>
                                        </tr>
                                        <c:set var="count" value="${0}"/>
                                        <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
                                        <c:set var="dayEnd" value="${currentDay.timeInMillis+1000*60*60*24}"/>
                                        <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}">
                                            <tr><td><app:monthAppt appt="${appt}" start="${dayStart}" end="${dayEnd}"/></td></tr>
                                            <c:set var="count" value="${count+1}"/>
                                        </zm:forEachAppoinment>
                                        <c:if test="${dowStatus.first and count lt 4}">
                                            <c:forEach begin="1" end="${4-count}"><tr><td>&nbsp;</td></tr></c:forEach>
                                        </c:if>
                                    </table>
                                </td>
                                ${zm:getNextDay(currentDay)}
                            </c:forEach>
                        </tr>
                    </c:forEach>
                </table>
            </td>
        </tr>
    </table>
</app:view>
