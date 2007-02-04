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
    <fmt:message var="hourFormat" key="CAL_DAY_HOUR_FORMAT"/>
    <fmt:message var="titleFormat" key="CAL_DAY_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date}" pattern="${titleFormat}"/>
    <c:set var="today" value="${zm:getToday()}"/>
    <c:set var="dateCal" value="${zm:getCalendar(date)}"/>
    <c:set var="prevDate" value="${zm:addDay(dateCal, -1)}"/>
    <c:set var="nextDate" value="${zm:addDay(dateCal,  1)}"/>

    <zm:getAppointmentSummaries var="appts" start="${date.time}" end="${date.time+1000*60*60*24}"/>
</app:handleError>

<app:view title="${title}" context="${null}" selected='calendar' calendars="true" minical="true" keys="true"
          date="${date}">
    <table width=100% cellpadding="0" cellspacing="0" border=0>
        <tr>
            <td class='TbTop'>
                <app:calendarViewToolbar today="${today}" date="${dateCal}" prevDate="${prevDate}"
                                         nextDate="${nextDate}" title="${title}" context="${context}" keys="true"/>
            </td>
        </tr>
        <tr>
            <td class='ZhAppContent'>
                <table width=100% height=100% class='ZhCalMonthHeaderTable' border=0>
                    <tr>
                        <td class='ZhCalDayHeader'>
                                ${fn:escapeXml(title)}
                        </td>
                    </tr>
                </table>
                <TABLE class='ZhCalDayGrid' width=100% height=100% border="0" cellpadding=0 cellspacing=0 style='border-collapse:collapse'>

                <zm:forEachApptRowLayout var="row" appointments="${appts}" start="${date.time}" end="${date.time+1000*60*60*24}">
                    <tr>
                        <c:if test="${row.rowNum % 4 eq 0}">
                            <td valign=top class='ZhCalDayHour' nowrap width=1% rowspan=4 style='border-left:none'>
                                    <fmt:formatDate value="${row.date}" pattern="${hourFormat}"/>
                            </td>
                        </c:if>
                        <td <c:if test="${row.rowNum % 4 ne 3}">class='ZhCalDayHS' </c:if><c:if test="${row.rowNum % 4 eq 3}">class='ZhCalDayHSB' </c:if> height=100% width=1px>&nbsp;</td>
                        <c:forEach var="column" items="${row.columns}">
                            <c:choose>
                                <c:when test="${not empty column.appt and column.isFirst}">
                                    <td valign=top height=100% width='${column.width}%'<c:if test="${column.colSpan ne 1}"> colspan='${column.colSpan}'</c:if><c:if test="${column.rowSpan ne 1}"> rowspan='${column.rowSpan}'</c:if>>
                                    <app:dayAppt appt="${column.appt}" start="" end=""/>
                                    </td>
                                </c:when>
                                <c:when test="${empty column.appt}">
                                    <td <c:if test="${row.rowNum % 4 eq 3}">class='ZhCalDayHB' </c:if><c:if test="${row.rowNum % 4 eq 1}">class='ZhCalDayHHB' </c:if> height=100% width='${column.width}%'<c:if test="${column.colSpan ne 1}"> colspan='${column.colSpan}'</c:if><c:if test="${column.rowSpan ne 1}"> rowspan='${column.rowSpan}'</c:if>>&nbsp;</td>
                                </c:when>
                            </c:choose>
                        </c:forEach>
                    </tr>

                </zm:forEachApptRowLayout>
                </TABLE>
            </td>
        </tr>
    </table>
</app:view>
