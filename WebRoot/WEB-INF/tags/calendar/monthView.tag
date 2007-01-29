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
    <zm:currentResultUrl var="currentUrl" value="" action="view" context="${context}"/>
    <fmt:message var="dayFormat" key="CAL_MONTH_DAY_FORMAT"/>
    <fmt:message var="dayMonthChangeFormat" key="CAL_MONTH_DAY_MONTH_CHANGE_FORMAT"/>    
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date}" pattern="${titleFormat}"/>
    <jsp:useBean id="dateSmbols" scope="request" class="java.text.DateFormatSymbols" />
    <c:set var="weekDays" value="${dateSmbols.weekdays}"/>
    <c:set var="today" value="${zm:getToday()}"/>
    <c:set var="dateCal" value="${zm:getCalendar(date)}"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMonth(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
</app:handleError>

<app:view title="${title}" context="${null}" selected='calendar' calendars="true" keys="true">
    <form action="${currentUrl}" method="post">

        <table width=100%  cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:calendarViewToolbar context="${context}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td class='ZhAppContent'>
                    <table width=100% class='ZhCalMonthHeaderTable'>
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
                    <table width=100% cellpadding="0" cellspacing="0">
                        <c:forEach var="week" begin="1" end="6">
                            <tr>
                                <c:forEach var="dow" begin="1" end="7">
                                    <td width=14% class='ZhCalMonthCellsTd'>
                                        <table width=100% cellpadding=0 cellspacing=0>
                                            <tr>
                                                <c:choose>
                                                    <c:when test="${zm:isSameDate(currentDay,today) and zm:isSameMonth(currentDay,dateCal)}">
                                                        <c:set var="clazz" value='ZhCalMonthDayLabelToday'/>
                                                    </c:when>
                                                    <c:when test="${zm:isSameDate(currentDay,today) and not zm:isSameMonth(currentDay,dateCal)}">
                                                        <c:set var="clazz" value='ZhCalMonthDayLabelOffMonthToday'/>
                                                    </c:when>
                                                    <c:when test="${not zm:isSameMonth(currentDay,dateCal)}">
                                                        <c:set var="clazz" value='ZhCalMonthDayLabelOffMonth'/>
                                                    </c:when>
                                                    <c:otherwise>
                                                        <c:set var="clazz" value='ZhCalMonthDayLabel'/>
                                                    </c:otherwise>
                                                </c:choose>
                                                <td align=right class='${clazz}'>
                                                    <fmt:formatDate var="dayTitle" value="${currentDay.time}" pattern="${dayMonthChangeFormat}"/>
                                                    ${fn:escapeXml(dayTitle)}
                                                        ${zm:getNextDay(currentDay)}
                                                </td>
                                            </tr>
                                            <tr><td>&nbsp;</td></tr>
                                            <tr><td>&nbsp;</td></tr>
                                            <tr><td>&nbsp;</td></tr>
                                            <tr><td>&nbsp;</td></tr>
                                            <tr><td>&nbsp;</td></tr>
                                            <tr><td>&nbsp;</td></tr>
                                            <tr><td>&nbsp;</td></tr>                                            
                                        </table>
                                    </td>
                                </c:forEach>
                            </tr>
                        </c:forEach>
                    </table>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    <app:calendarViewToolbar context="${context}" keys="false"/>
                </td>
            </tr>
        </table>

        <input type="hidden" name="doCalendarAction" value="1"/>
    </form>
</app:view>
