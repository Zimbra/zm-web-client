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
    <fmt:message var="dayFormat" key="CAL_MONTH_DAY_FORMAT"/>
    <fmt:message var="dayMonthChangeFormat" key="CAL_MONTH_DAY_MONTH_CHANGE_FORMAT"/>
    <fmt:message var="titleFormat" key="CAL_MONTH_TITLE_FORMAT"/>
    <fmt:formatDate var="title" value="${date}" pattern="${titleFormat}"/>
    <jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols"/>
    <c:set var="weekDays" value="${dateSymbols.weekdays}"/>
    <c:set var="today" value="${zm:getToday()}"/>
    <c:set var="dateCal" value="${zm:getCalendar(date)}"/>
    <c:set var="prevDate" value="${zm:pageMonth(dateCal, false)}"/>
    <c:set var="nextDate" value="${zm:pageMonth(dateCal,  true)}"/>
    <c:set var="currentDay" value="${zm:getFirstDayOfMonth(date, mailbox.prefs.calendarFirstDayOfWeek)}"/>
    <zm:getAppointmentSummaries var="appts" start="${currentDay.timeInMillis}"
                                end="${currentDay.timeInMillis+1000*60*60*24*42}"/>
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

                <TABLE width=100% border="1" cellpadding=0 cellspacing=0 style='border-collapse:collapse'>

                     <tr>
                        <td width=1px style='border-right:none'>&nbsp;</td>
                        <td nowrap width=1% rowspan=4 style='border-left:none'>9:00 AM</td>
                        <td width=33% rowspan=2 valign=top colspan=1 style='background:red'>9:00 AM breakfast at foo bar and grill</td>
                       <td width=66% colspan=2>&nbsp;</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                       <!-- td prev row -->
                       <td width=66% colspan=2 style='background:green'>9:15 AM shut it</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                       <td style='background:blue' valign='top' width=33% rowspan=2>9:30 AM whateva</td>
                      <td width=66% colspan=2>&nbsp;</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                       <!-- td prev row -->
                       <td style='background:red' width=66% colspan=2>9:45 AM and eva</td>
                    </tr>
                    <tr>
                        <td width=1px style='border-right:none'>&nbsp;</td>
                        <td nowrap width=1% rowspan=4 style='border-left:none'>10:00 AM</td>
                       <td valign=top rowspan=4 width=33% style='background:yellow'>10:15 AM shut it</td>
                       <td width=66% colspan=2>&nbsp;</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                       <!-- td prev row -->
                       <td width=66% colspan=2>&nbsp;</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                       <!-- td prev row -->
                      <td valign='top' width=33% rowspan=6 style='background:red'>10:30 AM dork</td>
                      <td width=33% style='background:purple'>10:30 AM azzholio qwerty abcd 12345 this is a long name</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                       <!-- td prev row -->
                      <td colspan=2 width=66%>&nbsp;</td>
                    </tr>
                    <tr>
                        <td width=1px style='border-right:none'>&nbsp;</td>
                        <td nowrap width=1% rowspan=4 style='border-left:none'>11:00 AM</td>
                       <td  width=33%>&nbsp;</td>
                       <!-- td prev row -->
                       <td width=33%>&nbsp;</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                       <td  width=33%>&nbsp;</td>
                       <!-- td prev row -->
                       <td width=33%>&nbsp;</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                      <td width=33% rowspan=2 style='background:purple'>11:30 AM lunchola</td>
                       <!-- td prev row -->
                       <td width=33%>&nbsp;</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                       <!-- td prev row -->
                       <!-- td prev row -->
                       <td width=33%>&nbsp;</td>
                    </tr>

                     <tr>
                        <td width=1px style='border-right:none'>&nbsp;</td>
                        <td nowrap width=1% rowspan=4 style='border-left:none'>12:00 PM</td>
                       <td valign=top rowspan=4 colspan=3 width=100% style='background:orange'>12:00 PM blah blah group meeting</td>
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->

                    </tr>
                    <tr>
                       <td style='border-right:none;'>&nbsp;</td>
                       <!-- td time  -->
                    </tr>
                    
                </TABLE>

            </td>
        </tr>
    </table>
</app:view>
