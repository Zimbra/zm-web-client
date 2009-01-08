<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="view" rtexprvalue="true" required="true" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="yearTitleFormat" key="CAL_DAY_TITLE_YEAR_FORMAT"/>

    <c:set var="currentDay" value="${zm:getFirstDayOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, view)}"/>
    <c:set var="scheduleView" value="${view eq 'schedule'}"/>
    <c:choose>
        <c:when test="${scheduleView}">
            <fmt:message var="titleFormat" key="CAL_SCHEDULE_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
            <fmt:message var="tbTitleFormat" key="CAL_SCHEDULE_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}" timeZone="${timezone}"/>
        </c:when>
        <c:when test="${numdays eq 1}">
            <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
            <fmt:formatDate var="pageTitle" value="${currentDay.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
            <fmt:message var="tbTitleFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:formatDate var="tbTitle" value="${currentDay.time}" pattern="${tbTitleFormat}" timeZone="${timezone}"/>
        </c:when>
        <c:otherwise>
            <fmt:message var="singleDayFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
            <fmt:message var="pageTitle" key="CAL_MDAY_TITLE_FORMAT">
                <fmt:param><fmt:formatDate value="${currentDay.time}" pattern="${singleDayFormat}"
                                           timeZone="${timezone}"/></fmt:param>
                <fmt:param><fmt:formatDate value="${zm:addDay(currentDay, numdays-1).time}" pattern="${singleDayFormat}"
                                           timeZone="${timezone}"/></fmt:param>
            </fmt:message>
            <c:set var="tbTitle" value="${pageTitle}"/>
        </c:otherwise>
    </c:choose>

    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="dayIncr" value="${(view eq 'workWeek') ? 7 : numdays}"/>
    <c:set var="prevDate" value="${zm:addDay(date, -dayIncr)}"/>
    <c:set var="nextDate" value="${zm:addDay(date,  dayIncr)}"/>

    <c:set var="rangeEnd" value="${zm:addDay(currentDay,numdays).timeInMillis}"/>
    <c:set var="checkedCalendars" value="${empty sessionScope.calendar ? zm:getCheckedCalendarFolderIds(mailbox) : sessionScope.calendar.id}"/>
        

    <%-- fetch mini cal appts first, so they are in cache, as well as any data neded by this view --%>
    <c:set var="startOfMonth" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="minicalappts" folderid="${checkedCalendars}"
                                start="${startOfMonth.timeInMillis}" end="${zm:addDay(startOfMonth, 42).timeInMillis}"
                                query="${requestScope.calendarQuery}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <mo:status style="Critical">
            <fmt:message key="${error.code}"/>
        </mo:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <c:set var="multiDay">
        <mo:calMultiDay date="${date}" numdays="${numdays}" view="${view}" timezone="${timezone}"
                        checkedCalendars="${checkedCalendars}" query="${requestScope.calendarQuery}"/>
    </c:set>

</mo:handleError>

<div>
    <mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="${view}" isTop="${true}"/>
    <div class="zo_cal_dayheader">
        <mo:calendarUrl var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
        <mo:calendarUrl var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>
                        <span>
                            <a class="cal_prev" href="${fn:escapeXml(prevUrl)}">&nbsp;</a>
                        </span>
                        <span class='zo_unread Medium${(date.timeInMillis eq today.timeInMillis) ? '_today':''}'>
                            <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
                            <fmt:formatDate value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                        </span>
                        <span>
                            <a class="cal_next" href="${fn:escapeXml(nextUrl)}">&nbsp;</a>
                        </span>
    </div>

    <div>
        ${multiDay}
    </div>
    <mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="${view}" isTop="${false}"/>
</div>
