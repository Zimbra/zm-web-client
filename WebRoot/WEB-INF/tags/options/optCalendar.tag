<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<fmt:getLocale var="userLocale"/>
<c:set var="dateSymbols" value="${zm:getDateFormatSymbols(userLocale,pageContext)}"/>
<c:set var="weekDays" value="${dateSymbols.weekdays}"/>
<c:set var="workWeek" value="${mailbox.prefs.calendarWorkingHours}"/>
<c:set var="workDays" value="${fn:split(workWeek, ',')}"/>
                                                   
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
                             <option value="${day-1}" <c:if test="${dow eq (day-1)}"> selected</c:if>>${weekDays[day]}</option>
                         </c:forEach>
                     </select>
                 </td>
             </tr>
             <app:optSeparator/>
            <tr>
                <td class='ZOptionsTableLabel'>&nbsp;</td>
                <td>
                  <app:optCheckbox boxfirst="true" trailingcolon="false" label="enableAppleICalDelegation" pref="zimbraPrefAppleIcalDelegationEnabled"
                                      checked="${mailbox.prefs.appleiCalDelegationEnabled}"/>
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
                     <fmt:message key="calendarWorkHoursHeader"/>
                 </td>
                 <td class="ImgPrefsHeader_R">
                     &nbsp;
                 </td>
             </tr>
         </table>
         <table width="100%" cellpadding="3" class="ZOptionsSectionMain">
             <tr>
                 <td class='ZOptionsTableLabel'>
                     <label for="dayStart"><fmt:message key="calendarWorkWeek"/>
                         :</label>
                 </td>
                 <td class='ZOptionsTableField' name="zimbraPrefCalendarWorkingDays">
                 <table>
                     <tr>
                        <td>
                            <app:optCheckbox boxfirst="true" trailingcolon="false" label="weekdaySunMedium" bundle="true" pref="sun"
                                      checked="${fn:split(workDays[0], ':')[1] eq 'Y' ? 'true' : 'false'}"/>
                        </td>
                        <td>
                            <app:optCheckbox boxfirst="true" trailingcolon="false" label="weekdayMonMedium" bundle="true" pref="mon"
                                      checked="${fn:split(workDays[1], ':')[1] eq 'Y' ? 'true' : 'false'}"/>
                        </td>
                        <td>
                            <app:optCheckbox boxfirst="true" trailingcolon="false" label="weekdayTueMedium" bundle="true" pref="tue"
                                      checked="${fn:split(workDays[2], ':')[1] eq 'Y' ? 'true' : 'false'}"/>
                        </td>
                        <td>
                            <app:optCheckbox boxfirst="true" trailingcolon="false" label="weekdayWedMedium" bundle="true" pref="wed"
                                      checked="${fn:split(workDays[3], ':')[1] eq 'Y' ? 'true' : 'false'}"/>
                        </td>
                        <td>
                            <app:optCheckbox boxfirst="true" trailingcolon="false" label="weekdayThuMedium" bundle="true" pref="thu"
                                      checked="${fn:split(workDays[4], ':')[1] eq 'Y' ? 'true' : 'false'}"/>
                        </td>
                        <td>
                            <app:optCheckbox boxfirst="true" trailingcolon="false" label="weekdayFriMedium" bundle="true" pref="fri"
                                      checked="${fn:split(workDays[5], ':')[1] eq 'Y' ? 'true' : 'false'}"/>
                        </td>
                        <td>
                            <app:optCheckbox boxfirst="true" trailingcolon="false" label="weekdaySatMedium" bundle="true" pref="sat"
                                      checked="${fn:split(workDays[6], ':')[1] eq 'Y' ? 'true' : 'false'}"/>
                        </td>
                     </tr>
                     </table>
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
