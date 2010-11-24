<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<%@ attribute name="uploader" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZComposeUploaderBean"%>
<%@ attribute name="searchResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchResultBean"%>
<%@ attribute name="searchGalResult" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZSearchGalResultBean"%>
<%@ attribute name="attendeeMode" rtexprvalue="true" required="false"%>
<%@ attribute name="groupMode" rtexprvalue="true" required="false"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:if test="${attendeeMode}">
<c:set var="tz" value="${zm:getTimeZone(uploader.compose.timeZone)}"/>
<c:set var="today" value="${zm:getCalendarMidnight(uploader.compose.apptStartCalendar.timeInMillis,tz)}"/>
<c:set var="endDay" value="${zm:getCalendarMidnight(uploader.compose.apptEndCalendar.timeInMillis,tz)}"/>
<c:choose>
    <c:when test="${uploader.compose.allDay}">
        <c:set var="apptStartLong" value="${today.timeInMillis}"/>
        <c:set var="apptEndLong" value="${zm:addDay(today, 1).timeInMillis}"/>
    </c:when>
    <c:otherwise>
        <c:set var="apptStartLong" value="${today.timeInMillis + 1000*60*(uploader.compose.startHour * 60 + uploader.compose.startMinute )}"/>
        <c:set var="apptEndLong" value="${endDay.timeInMillis + 1000*60*(uploader.compose.endHour * 60 + uploader.compose.endMinute )}"/>
    </c:otherwise>
</c:choose>
</c:if>

<c:if test="${empty mailbox}">
    <zm:getMailbox var="mailbox"/>
</c:if>

<table width=100% cellpadding=2 cellspacing=0 class="topborder">
    <tr valign='top'>
        <th width=1%>&nbsp;
            <c:choose>
                <c:when test="${attendeeMode}">
                    <c:if test="${uploader.contactLocation eq 'resources'}">
                    <th width=2%><fmt:message key="resource"/>:
                    </c:if>
                    <c:if test="${uploader.contactLocation ne 'resources'}">
                    <th width=2%><fmt:message key="attendee"/>:
                    </c:if>
                </c:when>
                <c:when test="${groupMode}">
                    <th width=2%><fmt:message key="contact"/>:
                </c:when>
                <c:otherwise>
                    <th width=2%><fmt:message key="to"/>:
                    <th width=2%><fmt:message key="cc"/>:
                    <th width=2%><fmt:message key="bcc"/>:
                </c:otherwise>
            </c:choose>
        <th width=1%>&nbsp;
        <th width=1%>&nbsp;
        <th width=1%>&nbsp;
        <c:choose>
            <c:when test="${not empty searchGalResult}">
                <th nowrap><fmt:message key="email"/>
                <c:if test="${attendeeMode and uploader.contactLocation eq 'resources'}">
                <th width=20% nowrap><fmt:message key="type"/>
                </c:if>
            </c:when>
            <c:otherwise>
                <th width=20% nowrap><fmt:message key="name"/>
                <th ><fmt:message key="email"/>
           </c:otherwise>
        </c:choose>
        <c:if test="${attendeeMode}">
        <th width="10%">
            <fmt:message key="freeBusy"/>
        </th>
        </c:if>
    </tr>
    <c:forEach items="${searchResult.hits}" var="hit" varStatus="status">
    <c:if test="${
                groupMode or !fn:contains(mailbox.defaultIdentity.fromEmailAddress.fullAddress,hit.contactHit.displayEmail)
                and !fn:contains(uploader.pendingAttendees,hit.contactHit.displayEmail)
                and !fn:contains(uploader.compose.attendees,hit.contactHit.displayEmail)
                and !fn:contains(uploader.pendingResources,hit.contactHit.displayEmail)
                and !fn:contains(uploader.compose.resources,hit.contactHit.displayEmail)
    }">   <%-- This condition is for not to list the contact/resource which has been already added --%>
    
    <c:if test="${not empty hit.contactHit.displayEmail or hit.contactHit.isGroup}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${attendeeMode}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="${fn:escapeXml(hit.contactHit.fullAddress)}"></td>
                </c:when>
                <c:when test="${groupMode}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="${fn:escapeXml(hit.contactHit.fullAddress)}"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="${fn:escapeXml(hit.contactHit.fullAddress)}"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="${fn:escapeXml(hit.contactHit.fullAddress)}"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="${fn:escapeXml(hit.contactHit.fullAddress)}"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${fn:escapeXml(empty hit.contactHit.fileAsStr ? '' : hit.contactHit.fileAsStr)}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.displayEmail)}</td>
            <c:if test="${attendeeMode}">
            <td>
               <zm:getFreeBusyAppointments varexception="exp" var="freeBusyAppts" start="${apptStartLong}" end="${apptEndLong}" email="${hit.contactHit.email}"/>
               <c:if test="${empty exp or exp eq null}">
                    <c:set var="freeBusyStatusKey" value="free"/>
                    <c:forEach items="${freeBusyAppts.appointments}" var="appt" >
                        <c:if test="${freeBusyStatusKey eq 'free'}">
                            <c:set var="freeBusyStatusKey" value="busy"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualTentative}">
                            <c:set var="freeBusyStatusKey" value="tentative"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualFree}">
                            <c:set var="freeBusyStatusKey" value="free"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualUnavailable}">
                            <c:set var="freeBusyStatusKey" value="outOfOffice"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualNoData}">
                            <c:set var="freeBusyStatusKey" value="unknown"/>
                        </c:if>
                    </c:forEach>
                   <fmt:message key="${freeBusyStatusKey}"/>
                </c:if>
            </td>
            </c:if>    
        </tr>
    </c:if>
    </c:if>
    <c:if test="${
                groupMode or !fn:contains(mailbox.defaultIdentity.fromEmailAddress.fullAddress,hit.contactHit.email2)
                and !fn:contains(uploader.pendingAttendees,hit.contactHit.email2)
                and !fn:contains(uploader.compose.attendees,hit.contactHit.email2)
                and !fn:contains(uploader.pendingResources,hit.contactHit.email2)
                and !fn:contains(uploader.compose.resources,hit.contactHit.email2)
    }">

    <c:if test="${not empty hit.contactHit.email2}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${attendeeMode}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                </c:when>
                <c:when test="${groupMode}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${fn:escapeXml(empty hit.contactHit.fileAsStr ? '' : hit.contactHit.fileAsStr)}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.email2)}</td>
            <c:if test="${attendeeMode}">
            <td>
               <zm:getFreeBusyAppointments varexception="exp" var="freeBusyAppts" start="${apptStartLong}" end="${apptEndLong}" email="${hit.contactHit.email2}"/>
               <c:if test="${empty exp or exp eq null}">
                    <c:set var="freeBusyStatusKey" value="free"/>
                    <c:forEach items="${freeBusyAppts.appointments}" var="appt" >
                        <c:if test="${appt.freeBusyActualBusy}">
                            <c:set var="freeBusyStatusKey" value="busy"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualTentative}">
                            <c:set var="freeBusyStatusKey" value="tentative"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualFree}">
                            <c:set var="freeBusyStatusKey" value="free"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualUnavailable}">
                            <c:set var="freeBusyStatusKey" value="outOfOffice"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualNoData}">
                            <c:set var="freeBusyStatusKey" value="unknown"/>
                        </c:if>
                    </c:forEach>
                   <fmt:message key="${freeBusyStatusKey}"/>
                </c:if>
            </td>
            </c:if>    
        </tr>
    </c:if>
    </c:if>
    <c:if test="${
                    groupMode or !fn:contains(mailbox.defaultIdentity.fromEmailAddress.fullAddress,hit.contactHit.email3)
                    and !fn:contains(uploader.pendingAttendees,hit.contactHit.email3)
                    and !fn:contains(uploader.compose.attendees,hit.contactHit.email3)
                    and !fn:contains(uploader.pendingResources,hit.contactHit.email3)
                    and !fn:contains(uploader.compose.resources,hit.contactHit.email3)
        }">

    <c:if test="${not empty hit.contactHit.email3}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${attendeeMode}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                </c:when>
                <c:when test="${groupMode}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${fn:escapeXml(empty hit.contactHit.fileAsStr ? '' : hit.contactHit.fileAsStr)}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.email3)}</td>
            <c:if test="${attendeeMode}">
            <td>
               <zm:getFreeBusyAppointments varexception="exp" var="freeBusyAppts" start="${apptStartLong}" end="${apptEndLong}" email="${hit.contactHit.email3}"/>
               <c:if test="${empty exp or exp eq null}">
                    <c:set var="freeBusyStatusKey" value="free"/>
                    <c:forEach items="${freeBusyAppts.appointments}" var="appt" >
                        <c:if test="${appt.freeBusyActualBusy}">
                            <c:set var="freeBusyStatusKey" value="busy"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualTentative}">
                            <c:set var="freeBusyStatusKey" value="tentative"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualFree}">
                            <c:set var="freeBusyStatusKey" value="free"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualUnavailable}">
                            <c:set var="freeBusyStatusKey" value="outOfOffice"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualNoData}">
                            <c:set var="freeBusyStatusKey" value="unknown"/>
                        </c:if>
                    </c:forEach>
                   <fmt:message key="${freeBusyStatusKey}"/>
                </c:if>
            </td>
            </c:if>    
        </tr>
    </c:if>
    </c:if>
    <c:if test="${
                    groupMode or !fn:contains(mailbox.defaultIdentity.fromEmailAddress.fullAddress,hit.contactHit.workEmail1)
                    and !fn:contains(uploader.pendingAttendees,hit.contactHit.workEmail1)
                    and !fn:contains(uploader.compose.attendees,hit.contactHit.workEmail1)
                    and !fn:contains(uploader.pendingResources,hit.contactHit.workEmail1)
                    and !fn:contains(uploader.compose.resources,hit.contactHit.workEmail1)
        }">

    <c:if test="${not empty hit.contactHit.workEmail1}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${attendeeMode}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                </c:when>
                <c:when test="${groupMode}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${fn:escapeXml(empty hit.contactHit.fileAsStr ? '' : hit.contactHit.fileAsStr)}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.workEmail1)}</td>
            <c:if test="${attendeeMode}">
            <td>
               <zm:getFreeBusyAppointments varexception="exp" var="freeBusyAppts" start="${apptStartLong}" end="${apptEndLong}" email="${hit.contactHit.workEmail1}"/>
               <c:if test="${empty exp or exp eq null}">
                    <c:set var="freeBusyStatusKey" value="free"/>
                    <c:forEach items="${freeBusyAppts.appointments}" var="appt" >
                        <c:if test="${appt.freeBusyActualBusy}">
                            <c:set var="freeBusyStatusKey" value="busy"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualTentative}">
                            <c:set var="freeBusyStatusKey" value="tentative"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualFree}">
                            <c:set var="freeBusyStatusKey" value="free"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualUnavailable}">
                            <c:set var="freeBusyStatusKey" value="outOfOffice"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualNoData}">
                            <c:set var="freeBusyStatusKey" value="unknown"/>
                        </c:if>
                    </c:forEach>
                   <fmt:message key="${freeBusyStatusKey}"/>
                </c:if>
            </td>
            </c:if>
        </tr>
    </c:if>
    </c:if>
    <c:if test="${
                        groupMode or !fn:contains(mailbox.defaultIdentity.fromEmailAddress.fullAddress,hit.contactHit.workEmail2)
                        and !fn:contains(uploader.pendingAttendees,hit.contactHit.workEmail2)
                        and !fn:contains(uploader.compose.attendees,hit.contactHit.workEmail2)
                        and !fn:contains(uploader.pendingResources,hit.contactHit.workEmail2)
                        and !fn:contains(uploader.compose.resources,hit.contactHit.workEmail2)
            }">

    <c:if test="${not empty hit.contactHit.workEmail2}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${attendeeMode}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                </c:when>
                <c:when test="${groupMode}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${fn:escapeXml(empty hit.contactHit.fileAsStr ? '' : hit.contactHit.fileAsStr)}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.workEmail2)}</td>
            <c:if test="${attendeeMode}">
            <td>
               <zm:getFreeBusyAppointments varexception="exp" var="freeBusyAppts" start="${apptStartLong}" end="${apptEndLong}" email="${hit.contactHit.workEmail2}"/>
               <c:if test="${empty exp or exp eq null}">
                    <c:set var="freeBusyStatusKey" value="free"/>
                    <c:forEach items="${freeBusyAppts.appointments}" var="appt" >
                        <c:if test="${appt.freeBusyActualBusy}">
                           <c:set var="freeBusyStatusKey" value="busy"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualTentative}">
                           <c:set var="freeBusyStatusKey" value="tentative"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualFree}">
                            <c:set var="freeBusyStatusKey" value="free"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualUnavailable}">
                            <c:set var="freeBusyStatusKey" value="outOfOffice"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualNoData}">
                            <c:set var="freeBusyStatusKey" value="unknown"/>
                        </c:if>
                      </c:forEach>
                   <fmt:message key="${freeBusyStatusKey}"/>
                </c:if>
            </td>
            </c:if>
        </tr>
    </c:if>
    </c:if>
    <c:if test="${
                        groupMode or !fn:contains(mailbox.defaultIdentity.fromEmailAddress.fullAddress,hit.contactHit.workEmail3)
                        and !fn:contains(uploader.pendingAttendees,hit.contactHit.workEmail3)
                        and !fn:contains(uploader.compose.attendees,hit.contactHit.workEmail3)
                        and !fn:contains(uploader.pendingResources,hit.contactHit.workEmail3)
                        and !fn:contains(uploader.compose.resources,hit.contactHit.workEmail3)
            }">

    <c:if test="${not empty hit.contactHit.workEmail3}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${attendeeMode}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                </c:when>
                <c:when test="${groupMode}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${fn:escapeXml(hit.contactHit.fileAsStr)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${fn:escapeXml(empty hit.contactHit.fileAsStr ? '' : hit.contactHit.fileAsStr)}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.workEmail3)}</td>
            <c:if test="${attendeeMode}">
            <td>
               <zm:getFreeBusyAppointments varexception="exp" var="freeBusyAppts" start="${apptStartLong}" end="${apptEndLong}" email="${hit.contactHit.workEmail3}"/>
               <c:if test="${empty exp or exp eq null}">
                    <c:set var="freeBusyStatusKey" value="free"/>
                    <c:forEach items="${freeBusyAppts.appointments}" var="appt" >
                        <c:if test="${appt.freeBusyActualBusy}">
                            <c:set var="freeBusyStatusKey" value="busy"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualTentative}">
                            <c:set var="freeBusyStatusKey" value="tentative"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualFree}">
                            <c:set var="freeBusyStatusKey" value="free"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualUnavailable}">
                            <c:set var="freeBusyStatusKey" value="outOfOffice"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualNoData}">
                            <c:set var="freeBusyStatusKey" value="unknown"/>
                        </c:if>
                     </c:forEach>
                    <fmt:message key="${freeBusyStatusKey}"/>
                </c:if>
            </td>
            </c:if>
        </tr>
    </c:if>
    </c:if>
    </c:forEach>
    <c:forEach items="${searchGalResult.contacts}" var="contact" varStatus="status">
        <c:if test="${
                    groupMode or !fn:contains(mailbox.defaultIdentity.fromEmailAddress.fullAddress,contact.galFullAddress)
                    and !fn:contains(uploader.pendingAttendees,contact.galFullAddress)
                    and !fn:contains(uploader.compose.attendees,contact.galFullAddress)
                    and !fn:contains(uploader.pendingResources,contact.galFullAddress)
                    and !fn:contains(uploader.compose.resources,contact.galFullAddress)
        }">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${attendeeMode}">
                    <c:choose>
                        <c:when test="${uploader.contactLocation eq 'resources'}">
                            <td width=2% nowrap><input type=checkbox  name="addResources" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                        </c:when>
                    <c:otherwise>
                        <td width=2% nowrap><input type=checkbox  name="addAttendees" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                    </c:otherwise>
                    </c:choose>

                </c:when>
                <c:when test="${groupMode}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${contact.tagIds}"/></td>
            <td width=1%><app:img src="${contact.image}" altkey="${contact.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td >
                    ${fn:escapeXml(contact.galFullAddress)}
            </td>
            <c:if test="${attendeeMode and uploader.contactLocation eq 'resources'}">
            <td>
                    ${fn:escapeXml(contact.attrs.zimbraCalResType)}
            </td>
            </c:if>
            <c:if test="${attendeeMode}">
            <td>
                <zm:getFreeBusyAppointments varexception="exp" var="freeBusyAppts" start="${apptStartLong}" end="${apptEndLong}" email="${contact.email}"/>
               <c:if test="${empty exp or exp eq null}">
                    <c:set var="freeBusyStatusKey" value="free"/>
                    <c:forEach items="${freeBusyAppts.appointments}" var="appt" >
                        <c:if test="${appt.freeBusyActualBusy}">
                            <c:set var="freeBusyStatusKey" value="busy"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualTentative}">
                            <c:set var="freeBusyStatusKey" value="tentative"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualFree}">
                            <c:set var="freeBusyStatusKey" value="free"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualUnavailable}">
                            <c:set var="freeBusyStatusKey" value="outOfOffice"/>
                        </c:if>
                        <c:if test="${appt.freeBusyActualNoData}">
                            <c:set var="freeBusyStatusKey" value="unknown"/>
                        </c:if>
                    </c:forEach>
                    <fmt:message key="${freeBusyStatusKey}"/>
                </c:if>
            </td>
            </c:if>    

        </tr>
        </c:if>
    </c:forEach>
</table>
<c:choose>
    <c:when test="${searchResult eq null and searchGalResult eq null}">
        <div class='InitialContactSearch'><fmt:message key="enterContactToSearchFor"/></div>
    </c:when>
    <c:when test="${(searchResult ne null and searchResult.size eq 0) or (searchGalResult ne null and searchGalResult.size eq 0)}">
        <div class='NoResults'><fmt:message key="noResultsFound"/></div>
    </c:when>
</c:choose>


