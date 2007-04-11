<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="yearTitleFormat" key="CAL_DAY_TITLE_YEAR_FORMAT"/>

    <c:set var="currentDay" value="${zm:getFirstDayOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, view)}"/>
    <c:set var="scheduleView" value="${view eq 'schedule'}"/>
    <c:choose>
        <c:when test="${scheduleView}">
            <fmt:message var="titleFormat" key="CAL_SCHEDULE_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}"/>
            <fmt:message var="tbTitleFormat" key="CAL_SCHEDULE_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}"/>
        </c:when>
        <c:when test="${numdays eq 1}">
            <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}"/>
            <fmt:message var="tbTitleFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}"/>
        </c:when>
        <c:otherwise>
            <fmt:message var="singleDayFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:message var="pageTitle" key="CAL_MDAY_TITLE_FORMAT">
                <fmt:param><fmt:formatDate value="${currentDay.time}" pattern="${singleDayFormat}"/></fmt:param>
                <fmt:param><fmt:formatDate value="${zm:addDay(currentDay, numdays-1).time}" pattern="${singleDayFormat}"/></fmt:param>
            </fmt:message>
            <c:set var="tbTitle" value="${pageTitle}"/>
        </c:otherwise>
    </c:choose>

    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="dayIncr" value="${(view eq 'workWeek') ? 7 : numdays}"/>
    <c:set var="prevDate" value="${zm:addDay(date, -dayIncr)}"/>
    <c:set var="nextDate" value="${zm:addDay(date,  dayIncr)}"/>

    <c:set var="rangeEnd" value="${zm:addDay(currentDay,numdays).timeInMillis}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>

    <%-- fetch mini cal appts first, so they are in cache, as well as any data neded by this view --%>
    <c:set var="startOfMonth" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="minicalappts" folderid="${checkedCalendars}" start="${startOfMonth.timeInMillis}" end="${zm:addDay(startOfMonth, 42).timeInMillis}" query="${requestScope.calendarQuery}"/>

    <c:set var="multiDay">
        <app:multiDay date="${date}" numdays="${numdays}" view="${view}" timezone="${timezone}" checkedCalendars="${checkedCalendars}" query="${requestScope.calendarQuery}"/>
    </c:set>

</app:handleError>

<app:view mailbox="${mailbox}" title="${pageTitle}" context="${null}" selected='calendar' calendars="true" minical="true" keys="true"
          date="${date}">
    <table width=100% height=100% cellpadding="0" cellspacing="0" border=0>
        <tr>
            <td class='TbTop'>
                <app:calendarViewToolbar timezone="${timezone}" today="${today}" date="${date}" prevDate="${prevDate}"
                                         nextDate="${nextDate}" title="${tbTitle}" context="${context}" keys="true"/>
            </td>
        </tr>
        <tr>
            <td class='ZhAppContent'>
                ${multiDay}
            </td>
        </tr>
        <tr>
            <td class='TbBottom'>
                <app:calendarViewBottomToolbar timezone="${timezone}"/>
            </td>
        </tr>
    </table>
</app:view>
