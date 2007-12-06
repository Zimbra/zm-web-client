<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<jsp:useBean id="dateSymbols" scope="request" class="java.text.DateFormatSymbols" />
<c:set var="weekDays" value="${dateSymbols.weekdays}"/>

<table border="0" cellpadding="0" cellspacing="10" width="100%">
     <tr>
         <td>
         <table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
             <tr class="ZOptionsHeaderRow">
                 <td class="ImgPrefsHeader_L">
                     &nbsp;
                 </td>
                 <td class='ZOptionsHeader ImgPrefsHeader' >
                     <fmt:message key="optionsGeneral"/>
                 </td>
                 <td class="ImgPrefsHeader_R">
                     &nbsp;
                 </td>
             </tr>
          </table>
         <table width="100%" cellpadding="3" class="ZOptionsSectionMain">
             <tr>
                 <td class='ZOptionsTableLabel'>
                     <label for="initView"><fmt:message key="calendarInitialView"/>
                         :</label>
                 </td>
                 <td>
                     <select name="zimbraPrefCalendarInitialView" id="initView">
                         <c:set var="view" value="${mailbox.prefs.calendarInitialView}"/>
                         <option value="day" <c:if test="${view eq 'day'}"> selected</c:if>><fmt:message key="calViewDay"/></option>
                         <option value="workWeek" <c:if test="${view eq 'workWeek'}"> selected</c:if>><fmt:message key="calViewWorkWeek"/></option>
                         <option value="week" <c:if test="${view eq 'week'}"> selected</c:if>><fmt:message key="calViewWeek"/></option>
                         <option value="month" <c:if test="${view eq 'month'}"> selected</c:if>><fmt:message key="calViewMonth"/></option>
                         <option value="schedule" <c:if test="${view eq 'schedule'}"> selected</c:if>><fmt:message key="calViewSchedule"/></option>
                     </select>
                 </td>
             </tr>
             <app:optSeparator/>
             <tr>
                 <td class='ZOptionsTableLabel'>
                     <label for="fdow"><fmt:message key="calendarFirstDayOfWeek"/>
                         :</label>
                 </td>
                 <td>
                     <c:set var="dow" value="${mailbox.prefs.calendarFirstDayOfWeek}"/>
                     <select name="zimbraPrefCalendarFirstdayOfWeek" id="fdow">
                         <c:forEach var="day" begin="1" end="7">
                             <option value="${day-1}" <c:if test="${dow eq (day+1)}"> selected</c:if>>${weekDays[day]}</option>
                         </c:forEach>
                     </select>
                 </td>
             </tr>
             <tr>
                 <td colspan="2">
                     &nbsp;
                 </td>
             </tr>
         </table>
         <br/>
         <table  class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
             <tr class="ZOptionsHeaderRow">
                 <td class="ImgPrefsHeader_L">
                     &nbsp;
                 </td>
                 <td class='ZOptionsHeader ImgPrefsHeader' >
                     <fmt:message key="optionsDayWeekView"/>
                 </td>
                 <td class="ImgPrefsHeader_R">
                     &nbsp;
                 </td>
             </tr>
         </table>
         <table width="100%" cellpadding="3" class="ZOptionsSectionMain">
             <tr>
                 <td class='ZOptionsTableLabel'>
                     <label for="dayStart"><fmt:message key="calendarDayStartsAt"/>
                         :</label>
                 </td>
                 <td>
                     <c:set var="hour" value="${mailbox.prefs.calendarDayHourStart}"/>
                     <select name="zimbraPrefCalendarDayHourStart" id="dayStart">
                         <c:forEach var="h" begin="0" end="23">
                             <option value="${h}" <c:if test="${h eq hour}"> selected</c:if>>
                                 <fmt:formatDate value="${zm:getTodayHour(h, null).time}" type="time" timeStyle="short"/>
                             </option>
                         </c:forEach>
                     </select>
                 </td>
             </tr>
             <tr>
                 <td class='ZOptionsTableLabel'>
                     <label for="dayEnd"><fmt:message key="calendarDayEndsAt"/>
                         :</label>
                 </td>
                 <td>
                     <c:set var="hour" value="${mailbox.prefs.calendarDayHourEnd}"/>
                     <select name="zimbraPrefCalendarDayHourEnd" id="dayEnd">
                         <c:forEach var="h" begin="1" end="24">
                             <option value="${h}" <c:if test="${h eq hour}"> selected</c:if>>
                                 <fmt:formatDate value="${zm:getTodayHour(h % 24, null).time}" type="time" timeStyle="short"/>
                             </option>
                         </c:forEach>
                     </select>
                 </td>
             </tr>
             <tr>
                 <td colspan="2">
                     &nbsp;
                 </td>
             </tr>
         </table>
         <br/>
         <table  class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
             <tr class="ZOptionsHeaderRow">
                 <td class="ImgPrefsHeader_L">
                     &nbsp;
                 </td>
                 <td class='ZOptionsHeader ImgPrefsHeader' >
                     <fmt:message key="optionsCreatingAppointments"/>
                 </td>
                 <td class="ImgPrefsHeader_R">
                     &nbsp;
                 </td>
             </tr>
         </table>
         <table width="100%" cellpadding="3" class="ZOptionsSectionMain">
             <tr>
                 <td class='ZOptionsTableLabel'>
                  <app:optCheckbox boxfirst="true" trailingcolon="false" label="shouldShowTimezone" pref="zimbraPrefUseTimeZoneListInCalendar"
                                      checked="${mailbox.prefs.useTimeZoneListInCalendar}"/>
                 </td>
             </tr>
             <app:optSeparator/>
             <tr>
                 <td class='ZOptionsTableLabel'  style='width:100%;text-align:left;font-weight:bold;'>
                     <fmt:message key="optionsManageCalendars">
                         <fmt:param><fmt:message key="optionsManageCalendarsPre"/></fmt:param>
                         <fmt:param><a href="mcalendars"><fmt:message key="optionsManageCalendarsLink"/></a></fmt:param>
                         <fmt:param><fmt:message key="optionsManageCalendarsPost"/></fmt:param>
                     </fmt:message>
                 </td>
             </tr>
             <tr>
                 <td>
                     &nbsp;
                 </td>
             </tr>
         </table>
    </td>
    </tr>
</table>
