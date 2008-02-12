<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<rest:handleError>
    <fmt:message key="noSubject" var="noSubject"/>
    <fmt:setTimeZone value="${timezone}"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="dayFormat" key="CAL_MONTH_DAY_FORMAT"/>
    <fmt:message var="dayMonthChangeFormat" key="CAL_MONTH_DAY_MONTH_CHANGE_FORMAT"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols"/>
    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="prevDate" value="${zm:addMonth(date, -1)}"/>
    <c:set var="nextDate" value="${zm:addMonth(date,  1)}"/>
    <c:set var="firstDOW" value="${requestScope.zimbra_target_account_prefCalendarFirstDayOfWeek}"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMonthView(date, firstDOW)}"/>

    <c:choose>
        <c:when test="${requestScope.zimbra_freebusy}">
            <zm:getFreeBusyAppointments box="${mailbox}"
                                        email="${requestScope.zimbra_target_account_name}"
                                        var="appts"
                                        start="${currentDay.timeInMillis}"
                                        end="${zm:addDay(currentDay, 42).timeInMillis}"
                                        varexception="gasException"/>
        </c:when>
        <c:otherwise>
            <zm:getAppointmentSummaries box="${mailbox}" timezone="${timezone}" var="appts"
                                        folderid="${not empty param.folderIds ? param.folderIds : requestScope.zimbra_target_item_id}" start="${currentDay.timeInMillis}"
                                        end="${zm:addDay(currentDay, 42).timeInMillis}" query="${requestScope.calendarQuery}"
                                        varexception="gasException"/>
        </c:otherwise>
    </c:choose>

    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <rest:status style="Critical">
            <fmt:message key="${error.code}"/>
        </rest:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
</rest:handleError>

<rest:view title="${not empty requestScope.zimbra_target_item_name ? requestScope.zimbra_target_item_name : requestScope.zimbra_target_account_name}: ${title}" rssfeed="${true}">
<!-- tz=timezone  date=YYYYMMDD   view=day|workWeek|week|month  notoolbar=1 folderIds=[...]
skin=skin-name color=defaultColor(0)|blue(1)|cyan(2)|green(3)|purple(4)|red(5)|yellow(6)|pink(7)|gray(8)|orange(9) -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td style='padding:20px'>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <c:if test="${param.notoolbar ne '1'}">
                    <tr>
                        <td class='TbTop'>
                            <rest:calendarViewToolbar today="${today}" date="${date}" timezone="${timezone}"
                                                      prevDate="${prevDate}" nextDate="${nextDate}" title="${title}"
                                                      context="${context}" keys="true"/>
                        </td>
                    </tr>
                    </c:if>
                    <tr>
                        <td class='ZhAppContent'>
                            <table width="100%" class='ZhCalMonthHeaderTable' cellpadding="2" cellspacing="0" border="0">
                                <tr>
                                    <td colspan="7" class='ZhCalMonthHeaderMonth'>
                                            ${fn:escapeXml(title)}
                                    </td>
                                </tr>
                                <tr>
                                    <c:forEach var="day"
                                               begin="${firstDOW}"
                                               end="${firstDOW+6}">
                                        <td width="14%" class='ZhCalMonthHeaderCellsText'>
                                                ${weekDays[(day mod 7)+1]}
                                        </td>
                                    </c:forEach>
                                </tr>
                            </table>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" class='ZhCalMonthTable'>
                                <c:set var="lastMonth" value="-1"/>
                                <c:forEach var="week" begin="1" end="6">
                                    <tr>
                                        <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                                            <td width="14%"
                                                class='ZhCalMonthDay${currentDay.timeInMillis eq date.timeInMillis ? 'Selected':''}'>
                                                <table width="100%" cellspacing="2">
                                                    <tr>
                                                        <c:set var="T"
                                                               value="${zm:isSameDate(currentDay, today) ? 'T' : ''}"/>
                                                        <c:set var="O"
                                                               value="${not zm:isSameMonth(currentDay, date) ? 'O' : ''}"/>
                                                        <td align="right" class='ZhCalDOM${O}${T}'>
                                                            <fmt:formatDate var="dayTitle" value="${currentDay.time}"
                                                                            pattern="${zm:getMonth(currentDay) ne lastMonth ? dayMonthChangeFormat : dayFormat}"/>
                                                            <c:set var="lastMonth" value="${zm:getMonth(currentDay)}"/>

                                                            <rest:calendarUrl var="dayUrl" view="day"
                                                                              timezone="${timezone}"
                                                                              rawdate="${currentDay}"/>

                                                            <a href="${fn:escapeXml(dayUrl)}">${fn:escapeXml(dayTitle)}</a>
                                                        </td>
                                                    </tr>
                                                    <c:set var="count" value="${0}"/>
                                                    <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
                                                    <c:set var="dayEnd"
                                                           value="${zm:addDay(currentDay, 1).timeInMillis}"/>
                                                    <zm:forEachAppoinment var="appt" appointments="${appts}"
                                                                          start="${dayStart}" end="${dayEnd}">
                                                        <tr>
                                                            <td>
                                                                <rest:monthAppt
                                                                        color="${zm:getFolderStyleColor(not empty requestScope.itemColor ? requestScope.itemColor : 'blue', 'appointment')}"
                                                                        appt="${appt}" start="${dayStart}"
                                                                        end="${dayEnd}" timezone="${timezone}"/>
                                                            </td>
                                                        </tr>
                                                        <c:set var="count" value="${count+1}"/>
                                                    </zm:forEachAppoinment>
                                                    <c:if test="${dowStatus.first and count lt 4}">
                                                        <c:forEach begin="1" end="${4-count}">
                                                            <tr>
                                                                <td>&nbsp;</td>
                                                            </tr>
                                                        </c:forEach>
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
                    <tr>
                        <td class='TbBottom'>
                            <rest:calendarViewBottomToolbar timezone="${timezone}"/>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</rest:view>
