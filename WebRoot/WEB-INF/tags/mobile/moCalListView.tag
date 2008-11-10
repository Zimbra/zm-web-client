<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="dayFormat" key="MO_CAL_LIST_DOW"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols"/>
    <c:set var="numDays" value="30"/>

    <c:set var="prevDate" value="${zm:addDay(date, -numDays)}"/>
    <c:set var="nextDate" value="${zm:addDay(date,  numDays)}"/>
    <c:set var="dateEnd" value="${zm:addDay(date,numDays-1)}"/>

    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="currentDay" value="${zm:getCalendar(date.timeInMillis,mailbox.prefs.timeZone)}"/>
    <c:set var="checkedCalendars" value="${empty sessionScope.calendar ? zm:getCheckedCalendarFolderIds(mailbox) : sessionScope.calendar.id}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${checkedCalendars}"
                                start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, numDays).timeInMillis}"
                                query="${requestScope.calendarQuery}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <%--
        <mo:status style="Critical">
            <fmt:message key="${error.code}"/>
        </mo:status>
        --%>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
    <fmt:message var="noSubject" key="noSubject"/>
</mo:handleError>
<mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="list" isTop="${true}"/>
<div class="zo_cal_listheader">
        <mo:calendarUrl var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
        <mo:calendarUrl var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>
        <span class='Padding'>
            <a class="cal_prev" href="${fn:escapeXml(prevUrl)}">&nbsp;</a>
        </span>
        <span class="zo_unread Medium">
            <fmt:message var="titleFormat" key="MO_CAL_LIST_DATE_FORMAT"/>
            <fmt:message key="MO_CAL_LIST_TITLE_FORMAT">
                <fmt:param>
                    <fmt:formatDate value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                </fmt:param>
                <fmt:param>
                    <fmt:formatDate value="${dateEnd.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
                </fmt:param>
            </fmt:message>
        </span>
        <span class='Padding'>
            <a class="cal_next" href="${fn:escapeXml(nextUrl)}">&nbsp;</a>
        </span>
</div>
<div class='zo_cal_list'>
    <c:set var="id" value="0"/>
    <c:forEach var="day" begin="1" end="${numDays}">
        <c:set var="count" value="0"/>
        <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
        <c:set var="dayEnd" value="${zm:addDay(currentDay, 1).timeInMillis}"/>
        <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}">
            <c:if test="${count eq 0}">
                <div class='zo_cal_listh'>
                    <span class='zo_cal_listh_dow'>
                        <fmt:formatDate value="${currentDay.time}" pattern="${dayFormat}" timeZone="${timezone}"/>
                    </span>
                    <span class='zo_cal_listh_date'>
                        <fmt:formatDate value="${currentDay.time}" type="date" dateStyle="medium" timeZone="${timezone}"/>
                    </span>
                </div>
            </c:if>
            <div class='zo_cal_listi' onclick='zClickLink("a${id}")'>
                <span class='zo_cal_listi_time'>
                    <c:choose>
                        <c:when test="${appt.allDay}">
                            <fmt:message key="apptAllDay"/>
                        </c:when>
                        <c:when test="${appt.startTime lt dayStart}">
                            <fmt:formatDate value="${appt.startDate}" type="date" dateStyle="short" timeZone="${timezone}"/>
                        </c:when>
                        <c:otherwise>
                            <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short" timeZone="${timezone}"/>
                        </c:otherwise>
                    </c:choose>
                </span>
                <mo:calendarUrl appt="${appt}" var="apptUrl"/>
                <span class='zo_cal_listi_subject'>
                    <c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
                    <a id="a${id}" href="${fn:escapeXml(apptUrl)}">${fn:escapeXml(fn:substring(subject,0,25))}...</a>
                </span>
            </div>
            <c:set var="count" value="${count+1}"/>
            <c:set var="id" value="${id+1}"/>
        </zm:forEachAppoinment>
        ${zm:getNextDay(currentDay)}
    </c:forEach>
</div>
<mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" timezone="${timezone}" view="list" isTop="${false}"/>
