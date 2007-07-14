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
    <c:set var="currentDay2" value="${zm:getFirstDayOfMonthView(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
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

<mo:view mailbox="${mailbox}" title="${title}" context="${null}" onload="initView()">

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
            <table width=100% cellpadding="0" cellspacing="0" border=0>
                <c:forEach var="week" begin="1" end="6">
                    <tr>
                        <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                            <c:set var="cell" value="${week*7+(dow-1)}"/>
                            <c:set var="T" value="${zm:isSameDate(currentDay, today) ? 'T' : ''}"/>
                            <c:set var="O" value="${not zm:isSameMonth(currentDay, date) ? 'O' : ''}"/>
                            <c:set var="sel" value="${zm:isSameDate(currentDay, date) ? '_select' :''}"/>
                            <c:set var="hasappt" value="${zm:hasAnyAppointments(appts, currentDay.timeInMillis, zm:addDay(currentDay, 1).timeInMillis) ? ' zo_cal_mday_appt' : ''}"/>

                            <td id="cell${cell}" class='zo_cal_mday${sel}' onclick="selectDay(${cell})">
                                <fmt:formatDate var="dayTitle" value="${currentDay.time}" pattern="${dayFormat}"/>
                                <span class='zo_cal_mday_text${O}${hasappt}'>${fn:escapeXml(dayTitle)}</span>
                            </td>
                            ${zm:getNextDay(currentDay)}
                        </c:forEach>
                    </tr>
                </c:forEach>
            </table>
        </td>
    </tr>
    <tr>
        <td>
            <c:forEach var="week" begin="1" end="6">
                <c:forEach var="dow" begin="1" end="7" varStatus="dowStatus">
                    <c:set var="dayStart" value="${currentDay2.timeInMillis}"/>
                    <c:set var="dayEnd" value="${zm:addDay(currentDay2, 1).timeInMillis}"/>
                    <c:set var="cell" value="${week*7+(dow-1)}"/>

                    <div class='zo_cal_mlist' id="list${cell}" <c:if test="${zm:isSameDate(currentDay2, date)}"> style='display:block'<c:set var="curId" value="${cell}"/></c:if>>
                        <table width=100% cellpadding="0" cellspacing="0" class='zo_cal_list'>
                            <c:set var="count" value="${0}"/>
                            <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}">
                                <mo:calendarUrl appt="${appt}" var="apptUrl"/>                                
                                <tr  onclick='window.location="${zm:jsEncode(apptUrl)}"'>
                                    <td class='zo_cal_listi_time'>
                                        <c:choose>
                                            <c:when test="${appt.allDay}">
                                                <fmt:message key="apptAllDay"/>
                                            </c:when>
                                            <c:otherwise>
                                                <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>
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
                            <c:if test="${count eq 0}">
                                <tr><td colspan=2 class="zo_cal_listi_subject">&nbsp;</td></tr>
                                <tr><td colspan=2 class="zo_cal_listi_empty">No Appointments</td></tr>
                            </c:if>
                            <tr><td colspan=2 class="zo_cal_listi_subject">&nbsp;</td></tr>
                                <tr><td colspan=2 class="zo_cal_listi_subject">&nbsp;</td></tr>
                                <tr><td colspan=2 class="zo_cal_listi_subject">&nbsp;</td></tr>
                        </table>
                    </div>
                    ${zm:getNextDay(currentDay2)}
                </c:forEach>
            </c:forEach>
        </td>
    </tr>
</table>
<script type="text/javascript">
    var currentCellId = '${curId}';
  function selectDay(cellId) {
      var cell = document.getElementById("list"+cellId);
      if (cell) {
          if (currentCellId) {
              document.getElementById("list"+currentCellId).style.display = "none";
              document.getElementById("cell"+currentCellId).className = "zo_cal_mday";
          }
          cell.style.display = "block";
          document.getElementById("cell"+cellId).className = 'zo_cal_mday_select';
          currentCellId = cellId;
      }
  }
    
  function initView() {
      window.scrollTo(0, 1);
}
</script>
</mo:view>
