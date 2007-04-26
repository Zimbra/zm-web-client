<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />
<c:set var="weekDays" value="${dateSymbols.weekdays}"/>

<table border="0" cellpadding="0" cellspacing="4" width=100%>
    <tbody>
        <tr>
            <td nowrap align=right width=30%>
                <fmt:message key="calendarInitialView"/>
                :
            </td>
            <td>
                <select name="zimbraPrefCalendarInitialView">
                    <c:set var="view" value="${mailbox.prefs.calendarInitialView}"/>
                    <option value="day" <c:if test="${view eq 'day'}"> selected</c:if>><fmt:message key="calViewDay"/></option>
                    <option value="workWeek" <c:if test="${view eq 'workWeek'}"> selected</c:if>><fmt:message key="calViewWorkWeek"/></option>
                    <option value="week" <c:if test="${view eq 'week'}"> selected</c:if>><fmt:message key="calViewWeek"/></option>
                    <option value="month" <c:if test="${view eq 'month'}"> selected</c:if>><fmt:message key="calViewMonth"/></option>
                    <option value="schedule" <c:if test="${view eq 'schedule'}"> selected</c:if>><fmt:message key="calViewSchedule"/></option>
                </select>
            </td>
        </tr>
        <tr>
            <td nowrap align=right width=30%>
                <fmt:message key="calendarFirstDayOfWeek"/>
                :
            </td>
            <td>
                <c:set var="dow" value="${mailbox.prefs.calendarFirstDayOfWeek}"/>
                <select name="zimbraPrefCalendarFirstdayOfWeek">
                    <c:forEach var="day" begin="1" end="7">
                        <option value="${day-1}" <c:if test="${dow eq (day+1)}"> selected</c:if>>${weekDays[day]}</option>
                    </c:forEach>
                </select>
            </td>
        </tr>
        <app:optCheckbox label="shouldShowTimezone" pref="zimbraPrefUseTimeZoneListInCalendar"
                         checked="${mailbox.prefs.useTimeZoneListInCalendar}"/>
        <app:optSeparator/>
        <tr>
            <td nowrap align=right width=30%>
                <fmt:message key="calendarDayStartsAt"/>
                :
            </td>
            <td>
                <c:set var="hour" value="${mailbox.prefs.calendarDayHourStart}"/>
                <select name="zimbraPrefCalendarDayHourStart">
                    <c:forEach var="h" begin="0" end="23">
                        <option value="${h}" <c:if test="${h eq hour}"> selected</c:if>>
                             <fmt:formatDate value="${zm:getTodayHour(h, null).time}" type="time" timeStyle="short"/>
                        </option>
                    </c:forEach>
                </select>
            </td>
        </tr>
        <tr>
            <td nowrap align=right width=30%>
                <fmt:message key="calendarDayEndsAt"/>
                :
            </td>
            <td>
                <c:set var="hour" value="${mailbox.prefs.calendarDayHourEnd}"/>
                <select name="zimbraPrefCalendarDayHourEnd">
                    <c:forEach var="h" begin="1" end="24">
                        <option value="${h}" <c:if test="${h eq hour}"> selected</c:if>>
                            <fmt:formatDate value="${zm:getTodayHour(h % 24, null).time}" type="time" timeStyle="short"/>
                        </option>
                    </c:forEach>
                </select>
            </td>
        </tr>
        <app:optSeparator/>
    </tbody>
</table>
