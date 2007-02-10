<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Date" %>
<%@ attribute name="numdays" rtexprvalue="true" required="true" %>
<%@ attribute name="schedule" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <fmt:message key="noSubject" var="noSubject"/>
    <zm:getMailbox var="mailbox"/>
    <c:set var="context" value="${null}"/>
    <fmt:message var="yearTitleFormat" key="CAL_DAY_TITLE_YEAR_FORMAT"/>

    <c:set var="currentDay" value="${zm:getFirstDayOfMultiDayView(date, mailbox.prefs.calendarFirstDayOfWeek, numdays)}"/>

    <c:choose>
        <c:when test="${schedule}">
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
                <fmt:param><fmt:formatDate value="${zm:addDay(currentDay, numdays).time}" pattern="${singleDayFormat}"/></fmt:param>
            </fmt:message>
            <c:set var="tbTitle" value="${pageTitle}"/>
        </c:otherwise>
    </c:choose>



    <c:set var="today" value="${zm:getToday()}"/>
    <c:set var="dateCal" value="${zm:getCalendar(date)}"/>
    <c:set var="dayIncr" value="${(numdays eq 5) ? 7 : numdays}"/>
    <c:set var="prevDate" value="${zm:addDay(dateCal, -dayIncr)}"/>
    <c:set var="nextDate" value="${zm:addDay(dateCal,  dayIncr)}"/>

    <c:set var="rangeEnd" value="${currentDay.timeInMillis+1000*60*60*24*numdays}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    <zm:getAppointmentSummaries var="appts" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${rangeEnd}"/>
    <zm:apptMultiDayLayout
            schedule="${schedule ? checkedCalendars : ''}"
            var="layout" appointments="${appts}" start="${currentDay.timeInMillis}" days="${numdays}"
            hourstart="${mailbox.prefs.calendarDayHourStart}" hourend="${mailbox.prefs.calendarDayHourEnd}"/>
</app:handleError>

<app:view title="${pageTitle}" context="${null}" selected='calendar' calendars="true" minical="true" keys="true"
          date="${date}">
    <table width=100% height=100% cellpadding="0" cellspacing="0" border=0>
        <tr>
            <td class='TbTop'>
                <app:calendarViewToolbar today="${today}" date="${dateCal}" prevDate="${prevDate}"
                                         nextDate="${nextDate}" title="${tbTitle}" context="${context}" keys="true"/>
            </td>
        </tr>
        <tr>
            <td class='ZhAppContent'>
                <table class='ZhCalDayGrid' width=100% height=100% border="0" cellpadding=0 cellspacing=0 style='border-collapse:collapse'>

                   <tr class='ZhCalMonthHeaderRow'>
                       <td class='ZhCalDayHeader' nowrap align=center width=1% style='border-left:none'>
                           <fmt:formatDate value="${date}" pattern="${yearTitleFormat}"/>
                       </td>
                       <td class='ZhCalDayHSB' height=100% width=1px>&nbsp;</td>
                       <c:forEach var="day" items="${layout.days}">
                           <td class='ZhCalDaySEP ZhCalDayHeader${(day.startTime eq today.timeInMillis and empty day.folderId) ? 'Today':''}' colspan="${day.maxColumns}" width=${day.width}%>
                               <c:choose>
                                   <c:when test="${not empty day.folderId}">
                                       <fmt:message var="fname" key="FOLDER_LABEL_${day.folderId}"/>
                                       <c:if test="${fn:startsWith(fname,'???')}"><c:set var="fname" value="${zm:getFolderName(pageContext, day.folderId)}"/></c:if>
                                       ${fn:escapeXml(fname)}
                                   </c:when>
                                   <c:otherwise>
                                       <fmt:message var="titleFormat" key="CAL_${numdays > 1 ? 'MDAY_':''}DAY_TITLE_FORMAT"/>
                                       <fmt:formatDate value="${day.date}" pattern="${titleFormat}"/>
                                   </c:otherwise>
                               </c:choose>
                           </td>
                       </c:forEach>
                   </tr>

                    <c:forEach var="row" items="${layout.allDayRows}">
                        <tr>
                            <td nowrap width=1% style='border-left:none'>
                                &nbsp;
                            </td>
                            <td class='ZhCalDayHS' height=100% width=1px>&nbsp;</td>
                            <c:forEach var="cell" items="${row.cells}">
                                <td class='ZhCalAllDayDS' valign=top height=100% width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if>>
                                    <c:choose>
                                        <c:when test="${not empty cell.appt}">
                                            <div style='padding:1px'>
                                            <app:dayAppt appt="${cell.appt}" start="${currentDay.timeInMillis}" end="${rangeEnd}"/>
                                            </div>
                                        </c:when>
                                        <c:otherwise>
                                            &nbsp;
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                            </c:forEach>
                        </tr>
                    </c:forEach>
                    <tr>
                        <td class='ZhCalDayADB' nowrap width=1% style='border-left:none'>
                            &nbsp;
                        </td>
                        <td class='ZhCalDayADHS' height=100% width=1px>&nbsp;</td>

                        <c:forEach var="day" items="${layout.days}">
                        <td class='ZhCalDaySEP ZhCalDayADB' colspan="${day.maxColumns}" width=${day.width}%>
                            &nbsp;
                        </td>
                        </c:forEach>
                    </tr>

                    <c:forEach var="row" items="${layout.rows}">
                        <tr height="100%">
                            <c:if test="${row.rowNum % 4 eq 0}">
                                <td valign=top class='ZhCalDayHour' nowrap width=1% rowspan=4 style='border-left:none'>
                                    <fmt:message key="CAL_DAY_HOUR_FORMAT">
                                     <fmt:param value="${row.date}"/>
                                    </fmt:message>
                                </td>
                            </c:if>
                            <td <c:if test="${row.rowNum % 4 ne 3}">class='ZhCalDayHS' </c:if><c:if test="${row.rowNum % 4 eq 3}">class='ZhCalDayHSB' </c:if> height=100% width=1px>&nbsp;</td>
                            <c:set var="prevDay" value="${0}"/>
                            <c:forEach var="cell" items="${row.cells}">
                                <c:set var="diffDay" value="${prevDay ne cell.day.day}"/>
                                <c:if test="${diffDay}">
                                    <c:set var="prevDay" value="${cell.day.day}"/>
                                </c:if>  
                                <c:choose>
                                    <c:when test="${not empty cell.appt and cell.isFirst}">
                                        <td <c:if test="${diffDay}">class='ZhCalDaySEP' </c:if> valign=top height=100% width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if><c:if test="${cell.rowSpan ne 1}"> rowspan='${cell.rowSpan}'</c:if>>
                                            <app:dayAppt appt="${cell.appt}" start="${cell.day.startTime}" end="${cell.day.endTime}"/>
                                        </td>
                                    </c:when>
                                    <c:when test="${empty cell.appt}">
                                        <c:choose>
                                            <c:when test="${row.rowNum % 4 eq 3}"><c:set var="hb" value="ZhCalDayHB "/></c:when>
                                            <c:when test="${row.rowNum % 4 eq 1}"><c:set var="hb" value="ZhCalDayHHB "/></c:when>
                                            <c:otherwise><c:set var="hb" value=""/></c:otherwise>
                                        </c:choose>
                                        <c:set var="dd" value="${diffDay ? 'ZhCalDaySEP' : ''}"/>
                                        <td <c:if test="${not empty hb or not empty dd}">class='${hb}${dd}' </c:if> height=100% width='${cell.width}%'<c:if test="${cell.colSpan ne 1}"> colspan='${cell.colSpan}'</c:if><c:if test="${cell.rowSpan ne 1}"> rowspan='${cell.rowSpan}'</c:if>>&nbsp;</td>
                                    </c:when>
                                </c:choose>
                            </c:forEach>
                        </tr>
                    </c:forEach>
                </table>
            </td>
        </tr>
        <tr>
            <td class='TbBottom'>
                <app:calendarViewBottomToolbar/>
            </td>
        </tr>
    </table>
</app:view>
