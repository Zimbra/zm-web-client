<%@ tag body-content="empty" %>
<%@ attribute name="date" rtexprvalue="true" required="true" type="java.util.Calendar" %>
<%@ attribute name="timezone" rtexprvalue="true" required="true" type="java.util.TimeZone"%>
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
    <fmt:formatDate var="title" value="${date.time}" pattern="${titleFormat}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />
    <c:set var="numDays" value="30"/>

    <c:set var="prevDate" value="${zm:addDay(date, -numDays)}"/>
    <c:set var="nextDate" value="${zm:addDay(date,  numDays)}"/>
    <c:set var="dateEnd" value="${zm:addDay(date,numDays-1)}"/>

    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <c:set var="today" value="${zm:getToday(timezone)}"/>
    <c:set var="currentDay" value="${zm:getCalendar(date.timeInMillis,mailbox.prefs.timeZone)}"/>
    <c:set var="checkedCalendars" value="${zm:getCheckedCalendarFolderIds(mailbox)}"/>
    <zm:getAppointmentSummaries timezone="${timezone}" var="appts" folderid="${checkedCalendars}" start="${currentDay.timeInMillis}" end="${zm:addDay(currentDay, numDays).timeInMillis}" query="${requestScope.calendarQuery}" varexception="gasException"/>
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


<table width=100% cellspacing="0" cellpadding="5" border="0">
    <tr>
        <td  align="left">
            <h2 style="margin: 0px; padding-bottom: 2px;border-bottom: 2px solid #CCCCCC; font-size: 16px;"><fmt:message key="calendar" />&nbsp;
            <span style="font: 11px arial,verdana,sans-serif; color: #666666;"><fmt:message var="titleFormat" key="MO_CAL_LIST_DATE_FORMAT"/>
            <fmt:message key="MO_CAL_LIST_TITLE_FORMAT">
                <fmt:param>
                    <fmt:formatDate value="${date.time}" pattern="${titleFormat}"/>
                </fmt:param>
                <fmt:param>
                    <fmt:formatDate value="${dateEnd.time}" pattern="${titleFormat}"/>
                </fmt:param>
            </fmt:message></span></h2>
        </td>
    </tr>
                <c:set var="id" value="0"/>
                <c:forEach var="day" begin="1" end="${numDays}">
                    <c:set var="count" value="0"/>
                    <c:set var="dayStart" value="${currentDay.timeInMillis}"/>
                    <c:set var="dayEnd" value="${zm:addDay(currentDay, 1).timeInMillis}"/>
                    <zm:forEachAppoinment var="appt" appointments="${appts}" start="${dayStart}" end="${dayEnd}">
                        <tr onclick='zClickLink("a${id}")'>
                        <c:if test="${count eq 0}">
                                 <td style="border-bottom:1px solid #ccc;padding:5px;" >
                                   <p><b><fmt:formatDate value="${appt.startDate}" type="date" dateStyle="medium"/> &nbsp;<fmt:formatDate value="${appt.startDate}" pattern="${dayFormat}"/>&nbsp;

                               </c:if>

                                <c:choose>
                                    <c:when test="${appt.allDay}">
                                        <fmt:message key="apptAllDay"/>
                                    </c:when>
                                    <c:when test="${appt.startTime lt dayStart}">
                                        <fmt:formatDate value="${appt.startDate}" type="date" dateStyle="short"/>
                                    </c:when>
                                    <c:otherwise>
                                        <fmt:formatDate value="${appt.startDate}" type="time" timeStyle="short"/>
                                    </c:otherwise>
                                </c:choose></b><br>

                            <mo:calendarUrl appt="${appt}" var="apptUrl"/>

                                <c:set var="subject" value="${empty appt.name ? noSubject : appt.name}"/>
                                    <a id="a${id}" href="${apptUrl}">${fn:escapeXml(subject)}</a>
                            </td>
                        </tr>
                        <c:set var="count" value="${count+1}"/>
                        <c:set var="id" value="${id+1}"/>
                    </zm:forEachAppoinment>
                    ${zm:getNextDay(currentDay)}
                </c:forEach></p>
            </table>
        </td>
    </tr>
</table>
