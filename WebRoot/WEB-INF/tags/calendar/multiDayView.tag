<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Date" %>
<%@ attribute name="days" rtexprvalue="true" required="true" %>
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
    <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
    <fmt:message var="tbTitleFormat" key="CAL_DAY_TB_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date}" pattern="${titleFormat}"/>
    <fmt:formatDate var="tbTitle" value="${date}" pattern="${tbTitleFormat}"/>
    <c:set var="today" value="${zm:getToday()}"/>
    <c:set var="dateCal" value="${zm:getCalendar(date)}"/>
    <c:set var="prevDate" value="${zm:addDay(dateCal, -1)}"/>
    <c:set var="nextDate" value="${zm:addDay(dateCal,  1)}"/>

    <zm:getAppointmentSummaries var="appts" start="${date.time}" end="${date.time+1000*60*60*24*days}"/>
    <zm:apptMultiDayLayout var="layout" appointments="${appts}" start="${date.time}" days="${days}"
            hourstart="${mailbox.prefs.calendarDayHourStart}" hourend="${mailbox.prefs.calendarDayHourEnd}"/>
    <!-- ROWS ${layout.rows}-->
</app:handleError>

<app:view title="${title}" context="${null}" selected='calendar' calendars="true" minical="true" keys="true"
          date="${date}">
    <table width=100% cellpadding="0" cellspacing="0" border=0>
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
                           <td class='ZhCalDayHeader${date.time eq today.timeInMillis ? 'Today':''}' colspan="${day.maxColumns}" width=${day.width}%>
                               <fmt:message var="titleFormat" key="CAL_${days > 1 ? 'M':''}DAY_TITLE_FORMAT"/>
                               <fmt:formatDate value="${day.date}" pattern="${titleFormat}"/>
                           </td>
                       </c:forEach>
                   </tr>
                    <%--
                    <tr>
                        <td nowrap width=1% style='border-left:none'>
                            &nbsp;
                        </td>
                        <td class='ZhCalDayHS' height=100% width=1px>&nbsp;</td>
                        <td colspan="${layout.maxColumns}" width=100%>
                            <table class='ZhCalDayGrid' width=100% height=100% border="0" cellpadding=2 cellspacing=0 style='border-collapse:collapse'>
                                <c:forEach var="allday" items="${layout.days[0].allDayAppts}">
                                    <tr>
                                        <td>
                                            <app:dayAppt appt="${allday}" start="${day.timeDateBegin}" end="${day.timeDateEnd}"/>
                                        </td>
                                    </tr>
                                </c:forEach>
                            </table>
                        </td>
                    </tr>
                    --%>
                    <tr>
                        <td class='ZhCalDayADB' nowrap width=1% style='border-left:none'>
                            &nbsp;
                        </td>
                        <td class='ZhCalDayADHS' height=100% width=1px>&nbsp;</td>
                        <td class='ZhCalDayADB' colspan="${layout.maxColumns}">
                            &nbsp;
                        </td>
                    </tr>

                    <c:forEach var="row" items="${layout.rows}">
                        <tr>
                            <c:if test="${row.rowNum % 4 eq 0}">
                                <td valign=top class='ZhCalDayHour' nowrap width=1% rowspan=4 style='border-left:none'>
                                    <fmt:message key="CAL_DAY_HOUR_FORMAT">
                                     <fmt:param value="${row.date}"/>
                                    </fmt:message>
                                </td>
                            </c:if>
                            <td <c:if test="${row.rowNum % 4 ne 3}">class='ZhCalDayHS' </c:if><c:if test="${row.rowNum % 4 eq 3}">class='ZhCalDayHSB' </c:if> height=100% width=1px>&nbsp;</td>
                            <c:set var="prevDay" value="${0}"/>
                            <c:forEach var="column" items="${row.columns}">
                                <c:set var="diffDay" value="${prevDay ne column.day.day}"/>
                                <c:if test="${diffDay}">
                                    <c:set var="prevDay" value="${column.day.day}"/>
                                </c:if>  
                                <c:choose>
                                    <c:when test="${not empty column.appt and column.isFirst}">
                                        <td <c:if test="${diffDay}">class='ZhCalDaySEP' </c:if> valign=top height=100% width='${column.width}%'<c:if test="${column.colSpan ne 1}"> colspan='${column.colSpan}'</c:if><c:if test="${column.rowSpan ne 1}"> rowspan='${column.rowSpan}'</c:if>>
                                            <app:dayAppt appt="${column.appt}" start="${column.day.startTime}" end="${column.day.endTime}"/>
                                        </td>
                                    </c:when>
                                    <c:when test="${empty column.appt}">
                                        <c:choose>
                                            <c:when test="${row.rowNum % 4 eq 3}"><c:set var="hb" value="ZhCalDayHB "/></c:when>
                                            <c:when test="${row.rowNum % 4 eq 1}"><c:set var="hb" value="ZhCalDayHHB "/></c:when>
                                            <c:otherwise><c:set var="hb" value=""/></c:otherwise>
                                        </c:choose>
                                        <c:set var="dd" value="${diffDay ? 'ZhCalDaySEP' : ''}"/>
                                        <td <c:if test="${not empty hb or not empty dd}">class='${hb}${dd}' </c:if> height=100% width='${column.width}%'<c:if test="${column.colSpan ne 1}"> colspan='${column.colSpan}'</c:if><c:if test="${column.rowSpan ne 1}"> rowspan='${column.rowSpan}'</c:if>>&nbsp;</td>
                                    </c:when>
                                </c:choose>
                            </c:forEach>
                        </tr>
                    </c:forEach>
                </table>
            </td>
        </tr>
    </table>
</app:view>
