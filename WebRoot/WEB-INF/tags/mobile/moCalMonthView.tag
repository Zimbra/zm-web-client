<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
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
    <fmt:message var="dayFormat" key="CAL_MONTH_DAY_FORMAT"/>
    <fmt:message var="dayMonthChangeFormat" key="CAL_MONTH_DAY_MONTH_CHANGE_FORMAT"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}" timeZone="${timezone}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols"/>
    <c:set var="weekDays" value="${dateSymbols.shortWeekdays}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="prevDate" value="${zm:addMonth(date, -1)}"/>
    <c:set var="nextDate" value="${zm:addMonth(date,  1)}"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="currentDay2" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <c:set var="checkedCalendars" value="${empty sessionScope.calendar ? zm:getCheckedCalendarFolderIds(mailbox) : sessionScope.calendar.id}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, 42).timeInMillis}" query="${requestScope.calendarQuery}" varexception="gasException"/>
    <c:if test="${not empty gasException}">
        <zm:getException var="error" exception="${gasException}"/>
        <mo:status style="Critical">
            <fmt:message key="${error.code}"/>
        </mo:status>
        <!-- ${fn:escapeXml(error.stackStrace)} -->
    </c:if>
</mo:handleError>


<table width="100%" cellspacing="0" cellpadding="0">
<tr>
    <td>
        <mo:calendarViewToolbar urlTarget="${urlTarget}" view="month" date="${date}" openurl="false" timezone="${timezone}" isTop="${true}"/>
    </td>
</tr>
<tr>
    <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td colspan="7">
                    <table width="100%" style='height:100%' border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <mo:calendarUrl view="month" var="prevUrl" rawdate="${prevDate}" timezone="${timezone}"/>
                            <mo:calendarUrl view="month" var="nextUrl" rawdate="${nextDate}" timezone="${timezone}"/>
                            <td width="1%" class='zo_cal_mpage'>
                                        <a class="cal_prev" href="${fn:escapeXml(prevUrl)}">&nbsp;<%--<mo:img src="arrows/ImgPreviousPage.gif" alt="«"/>--%></a>
                            </td>
                                    <td nowrap="nowrap" class='zo_cal_mpage${(date.timeInMillis eq today.timeInMillis) ? '':''}'>
                                    ${fn:escapeXml(title)}
                            </td>
                            <td width="1%" class='zo_cal_mpage'>
                                <a class="cal_next" href="${fn:escapeXml(nextUrl)}">&nbsp;<%--<mo:img src="arrows/ImgNextPage.gif" alt="»"/>--%></a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <c:forEach var="day"
                           begin="${mailbox.prefs.calendarFirstDayOfWeek}"
                           end="${mailbox.prefs.calendarFirstDayOfWeek+6}">
                    <td width="14%" class='zo_cal_mdow'>
                            ${weekDays[(day mod 7)+1]}
                    </td>
                </c:forEach>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <c:forEach var="week" begin="1" end="6">
                <tr>
                    <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                        <c:set var="T" value="${zm:isSameDate(currentDay, today) ? 'T' : ''}"/>
                        <c:set var="O" value="${not zm:isSameMonth(currentDay, date) ? 'O' : ''}"/>
                            <fmt:formatDate var="datef" timeZone="${timezone}" value="${currentDay.time}" pattern="yyyyMMdd"/>
                            <c:set var="hasappt" value="${zm:hasAnyAppointments(appts, currentDay.timeInMillis, zm:addDay(currentDay, 1).timeInMillis)}"/>
                        <c:set var="sel" value="${zm:isSameDate(currentDay, date)}"/>
                        <fmt:formatDate value="${today.time}" pattern="yyyyMMdd" var="_today"/>
                        <c:if test="${sel}">
                            <c:set var="currentHasAppt" value="${hasappt}"/>
                            <c:set var="curId" value="${datef}"/>
                        </c:if>
                        <mo:calendarUrl var="dayUrl" view="day" date="${datef}"/>
                        <td id="cell${datef}" class='zo_cal_mday${sel && !zm:isSameDate(today, currentDay) ? '_select' :''}${zm:isSameDate(today, currentDay) ? ' zo_cal_mday_today' : ''}' onclick="selectDay('${datef}')">
                            <c:if test="${hasappt}"><a href="${dayUrl}" onfocus="selectDay('${datef}')"></c:if>
                            <fmt:formatDate var="dayTitle" value="${currentDay.time}" pattern="${dayFormat}" timeZone="${timezone}"/>
                            <span class='zo_cal_mday_text${O}${hasappt ? ' zo_cal_mday_appt':''}'>${fn:escapeXml(dayTitle)}</span>
                            <c:if test="${hasappt}"></a></c:if>
                        </td>
                        ${zm:getNextDay(currentDay)}
                    </c:forEach>
                </tr>
            </c:forEach>
        </table>
        <div class="cal_bottom_shadow"></div>
    </td>
</tr>

<tr>
    <td>
        <c:forEach var="week" begin="1" end="6">
            <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                <c:set var="dayStart" value="${currentDay2.timeInMillis}"/>
                <c:set var="dayEnd" value="${zm:addDay(currentDay2, 1).timeInMillis}"/>
                <c:set var="count" value="${0}"/>
                <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}">
                    <c:if test="${count eq 0}">
                            <fmt:formatDate var="datef" timeZone="${timezone}" value="${currentDay2.time}" pattern="yyyyMMdd"/>
                            <div class='zo_cal_mlist' id="list${datef}" <c:if test="${datef eq curId}"> style='display:block'</c:if>>
                        <table width="100%" cellpadding="0" cellspacing="0" class='zo_cal_list'>
                    </c:if>
                    <mo:calendarUrl appt="${appt}" var="apptUrl" view="month"/>
                        <tr  onclick='openURL("${fn:escapeXml(zm:jsEncode(apptUrl))}")'>
                        <td class='zo_cal_listi_time'>
                            <c:choose>
                                <c:when test="${appt.allDay}">
                                    <fmt:message key="apptAllDay"/>
                                </c:when>
                                <c:otherwise>
                                    <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short" timeZone="${timezone}"/>
                                </c:otherwise>
                            </c:choose>
                        </td>
                        <td class='zo_cal_listi_subject'>
                            <c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
                                ${fn:escapeXml(subject)}
                        </td>
                    </tr>
                    <c:set var="count" value="${count+1}"/>
                </zm:forEachAppoinment>
                <c:if test="${count gt 0}">
                    </table>
                    </div>
                </c:if>
                ${zm:getNextDay(currentDay2)}
            </c:forEach>
        </c:forEach>

        <div class='zo_cal_mlist' id="listempty" <c:if test="${not currentHasAppt}">style='display:block'</c:if>>
            <table width="100%" cellpadding="0" cellspacing="0" class='zo_cal_list'>
                    <tr><td colspan="2" class="zo_cal_listi_subject">&nbsp;</td></tr>
                    <tr><td colspan="2" class="zo_cal_listi_empty">No Appointments</td></tr>
            </table>
        </div>
        <div class='zo_cal_mlist' style='display:block'>
            <table width="100%" cellpadding="0" cellspacing="0" class='zo_cal_list'>
                    <tr><td colspan="2" class="zo_cal_listi_subject">&nbsp;</td></tr>
                    <tr><td colspan="2" class="zo_cal_listi_subject">&nbsp;</td></tr>
                    <tr><td colspan="2" class="zo_cal_listi_subject">&nbsp;</td></tr>
            </table>
        </div>
    </td>
</tr>
<tr>
    <td>
        <mo:calendarViewToolbar urlTarget="${urlTarget}" date="${date}" view="month" openurl="false" timezone="${timezone}" isTop="${fa}"/>
    </td>
</tr>
</table>
<script type="text/javascript">
    var currentDate = '${curId}';
    function selectDay(datestr) {
        var cell = document.getElementById("cell" + datestr);
        if (cell) {
            if (currentDate) {
                var list = document.getElementById("list" + currentDate);
                if (list == null) list = document.getElementById("listempty");
                list.style.display = "none";
                document.getElementById("cell" + currentDate).className = "zo_cal_mday" + ((currentDate == '${_today}') ? ' zo_cal_mday_today' : '');
            }
            cell.className = 'zo_cal_mday_select';
            var nlist = document.getElementById("list" + datestr);
            if (nlist == null) nlist = document.getElementById("listempty");
            nlist.style.display = "block";
            currentDate = datestr;
        }
    }
    function openURL(url) {
        window.location = url.replace(/date=......../, "date=" + currentDate);
    }
</script>
