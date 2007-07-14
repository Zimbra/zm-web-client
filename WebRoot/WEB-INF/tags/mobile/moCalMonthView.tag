<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="dayFormat" key="CAL_MONTH_DAY_FORMAT"/>
    <fmt:message var="dayMonthChangeFormat" key="CAL_MONTH_DAY_MONTH_CHANGE_FORMAT"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />
    <c:set var="weekDays" value="${dateSymbols.shortWeekdays}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="prevDate" value="${zm:addMonth(date, -1)}"/>
    <c:set var="nextDate" value="${zm:addMonth(date,  1)}"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, 42).timeInMillis}" query="${requestScope.calendarQuery}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <mo:status style="Critical">
            <fmt:message key="${error.code}"/>
        </mo:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
</mo:handleError>

<mo:view mailbox="${mailbox}" title="${title}" context="${null}">

<table width=100% cellspacing="0" cellpadding="0">
    <tr>
        <td>
            <mo:calendarViewToolbar date="${date}"/>
        </td>
    </tr>
    <tr>
        <td>
            <table width=100% cellpadding=0 cellspacing=0 border=0>
                    <tr>
                        <td colspan=7>
                            <table width=100% height=100% border="0" cellpadding=0 cellspacing=0>
                                <tr>
                                    <mo:calendarUrl var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
                                    <mo:calendarUrl var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>
                                    <td width=1% class='zo_cal_mpage'>
                                        <a href="${prevUrl}"><img src="/zimbra/images/arrows/PreviousPage.gif"></a>
                                    </td>
                                    <td nowrap class='zo_cal_mpage${(date.timeInMillis eq today.timeInMillis) ? '':''}'>
                                         ${fn:escapeXml(title)}
                                    </td>
                                    <td width=1% class='zo_cal_mpage'>
                                        <a href="${nextUrl}"><img src="/zimbra/images/arrows/NextPage.gif"></a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <c:forEach var="day"
                                   begin="${mailbox.prefs.calendarFirstDayOfWeek}"
                                   end="${mailbox.prefs.calendarFirstDayOfWeek+6}">
                            <td width=14% class='zo_cal_mdow'>
                                    ${weekDays[(day mod 7)+1]}
                            </td>
                        </c:forEach>
                    </tr>
                </table>
        </td>
    </tr>
    <tr>
        <td>
            <table width=100% cellpadding="0" cellspacing="0" border=0 class='ZhCalMonthTable'>
                    <c:forEach var="week" begin="1" end="6">
                        <tr>
                            <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                                <td width=14% class='ZhCalMonthDay${currentDay.timeInMillis eq date.timeInMillis ? 'Selected':''}'>
                                    <table width=100% cellspacing=0 cellpadding="0">
                                        <tr>
                                            <c:set var="T" value="${zm:isSameDate(currentDay, today) ? 'T' : ''}"/>
                                            <c:set var="O" value="${not zm:isSameMonth(currentDay, date) ? 'O' : ''}"/>
                                            <td align=right class='zo_cal_mday${O}'>
                                                <fmt:formatDate var="dayTitle" value="${currentDay.time}" pattern="${dayFormat}"/>
                                                ${fn:escapeXml(dayTitle)}
                                            </td>
                                        </tr>
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
</mo:view>
