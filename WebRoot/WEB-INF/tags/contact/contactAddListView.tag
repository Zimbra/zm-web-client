<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
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
<c:if test="${zm:boolean(attendeeMode)}">
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
<c:set var="detailedSearchEnabled" value="${mailbox.features.contactsDetailedSearch}"/>
<table width=100% cellpadding=2 cellspacing=0 class="topborder">
    <tr valign='top'>
        <th width=1%>&nbsp;
            <c:choose>
                <c:when test="${zm:boolean(attendeeMode)}">
                    <c:if test="${uploader.contactLocation eq 'resources'}">
                    <th width=2%><fmt:message key="resource"/>:
                    </c:if>
                    <c:if test="${uploader.contactLocation ne 'resources'}">
                    <th width=2%><fmt:message key="attendee"/>:
                    </c:if>
                </c:when>
                <c:when test="${zm:boolean(groupMode)}">
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
                <c:if test="${detailedSearchEnabled}">
                    <th nowrap><fmt:message key="department"/>
                </c:if>
            </c:when>
            <c:otherwise>
                <th width=20% nowrap><fmt:message key="name"/>
                <th ><fmt:message key="email"/>
           </c:otherwise>
        </c:choose>
        <c:if test="${zm:boolean(attendeeMode)}">
        <th width="10%">
            <fmt:message key="freeBusy"/>
        </th>
        </c:if>
    </tr>
    <c:forEach items="${searchResult.hits}" var="hit" varStatus="status">
    <c:if test="${
                groupMode or hit.contactHit.isGroup or (!fn:contains(uploader.pendingAttendees,hit.contactHit.displayEmail)
                and !fn:contains(uploader.compose.attendees,hit.contactHit.displayEmail)
                and !fn:contains(uploader.pendingResources,hit.contactHit.displayEmail)
                and !fn:contains(uploader.compose.resources,hit.contactHit.displayEmail))
    }">   <%-- This condition is for not to list the contact/resource which has been already added --%>
    
    <c:if test="${not empty hit.contactHit.displayEmail or hit.contactHit.isGroup}">
        <fmt:message var="noNameStr" key="noName"/>
        <c:set var="noName" value="${noNameStr} ${not empty hit.contactHit.email ? hit.contactHit.email : hit.contactHit.email2 }" />
        <c:choose>
            <c:when test="${not empty hit.contactHit.fileAsStr}">
                <c:set var="contactFileAsText">
                <app:contactFileAs
                   fileAs="${hit.contactHit.fileAs}"
                   firstName="${hit.contactHit.firstName}" lastName="${hit.contactHit.lastName}"
                   company="${hit.contactHit.company}" fullName="${hit.contactHit.fullName}"
                   nickname="${hit.contactHit.nickname}"
                />
              </c:set>
              <c:set var="contactUrlText" value="${fn:escapeXml(contactFileAsText)}"/>
            </c:when>
            <c:when test="${empty hit.contactHit.fileAsStr and (context.isGALSearch or hit.contactHit.isGroup)}">
                <c:set var="contactUrlText" value="${fn:escapeXml(hit.contactHit.fullName)}" />
            </c:when>
            <c:otherwise>
                <c:set var="contactUrlText" value="${fn:escapeXml(noName)}" />
            </c:otherwise>
        </c:choose>

        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${zm:boolean(attendeeMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="${fn:escapeXml(hit.contactHit.fullAddress)}"></td>
                </c:when>
                <c:when test="${zm:boolean(groupMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="${fn:escapeXml(hit.contactHit.fullAddress)};${fn:escapeXml(hit.contactHit.id)};C">
                    </td>
                </c:when>
                <c:otherwise>
                    <c:set var="addresses" value='&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.email)}&gt;' />
                    <c:if test="${hit.contactHit.isGroup}">
                        <zm:getContact var="contactGroup" id="${hit.contactHit.id}"/>
                        <c:set var="addresses" value=""/>
                        <c:forEach items="${contactGroup.groupMemberList}" var="gmember" varStatus="status">
                            <c:set var="contactFileAsText">
                                <app:contactFileAs
                                     fileAs="${gmember.fileAs}"
                                     firstName="${gmember.firstName}"
                                     lastName="${gmember.lastName}"
                                     company="${gmember.company}"
	                             fullName="${gmember.fullName}"
                                     nickname="${gmember.nickname}"
                                />
                            </c:set>
                            <c:set var="addr" value="&#034;${fn:escapeXml(contactFileAsText)}&#034; &lt;${fn:escapeXml(gmember.email)}&gt;"/>
                            <c:choose>
                                <c:when test="${status.index > 0}">
                                    <c:set var="addresses" value="${addresses},${addr}"/>
                                </c:when>
                                <c:otherwise>
                                    <c:set var="addresses" value="${addr}"/>
                                </c:otherwise>
                            </c:choose>
                        </c:forEach>
                    </c:if>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="${addresses}"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="${addresses}"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="${addresses}"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${contactUrlText}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.displayEmail)}</td>
            <c:if test="${zm:boolean(attendeeMode)}">
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
                groupMode or  !fn:contains(uploader.pendingAttendees,hit.contactHit.email2)
                and !fn:contains(uploader.compose.attendees,hit.contactHit.email2)
                and !fn:contains(uploader.pendingResources,hit.contactHit.email2)
                and !fn:contains(uploader.compose.resources,hit.contactHit.email2)
    }">

    <c:if test="${not empty hit.contactHit.email2}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${zm:boolean(attendeeMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                </c:when>
                <c:when test="${zm:boolean(groupMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.email2)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${contactUrlText}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.email2)}</td>
            <c:if test="${zm:boolean(attendeeMode)}">
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
                    groupMode or !fn:contains(uploader.pendingAttendees,hit.contactHit.email3)
                    and !fn:contains(uploader.compose.attendees,hit.contactHit.email3)
                    and !fn:contains(uploader.pendingResources,hit.contactHit.email3)
                    and !fn:contains(uploader.compose.resources,hit.contactHit.email3)
        }">

    <c:if test="${not empty hit.contactHit.email3}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${zm:boolean(attendeeMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                </c:when>
                <c:when test="${zm:boolean(groupMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.email3)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${contactUrlText}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.email3)}</td>
            <c:if test="${zm:boolean(attendeeMode)}">
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
                    groupMode or !fn:contains(uploader.pendingAttendees,hit.contactHit.workEmail1)
                    and !fn:contains(uploader.compose.attendees,hit.contactHit.workEmail1)
                    and !fn:contains(uploader.pendingResources,hit.contactHit.workEmail1)
                    and !fn:contains(uploader.compose.resources,hit.contactHit.workEmail1)
        }">

    <c:if test="${not empty hit.contactHit.workEmail1}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${zm:boolean(attendeeMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                </c:when>
                <c:when test="${zm:boolean(groupMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail1)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${contactUrlText}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.workEmail1)}</td>
            <c:if test="${zm:boolean(attendeeMode)}">
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
                        groupMode or !fn:contains(uploader.pendingAttendees,hit.contactHit.workEmail2)
                        and !fn:contains(uploader.compose.attendees,hit.contactHit.workEmail2)
                        and !fn:contains(uploader.pendingResources,hit.contactHit.workEmail2)
                        and !fn:contains(uploader.compose.resources,hit.contactHit.workEmail2)
            }">

    <c:if test="${not empty hit.contactHit.workEmail2}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${zm:boolean(attendeeMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                </c:when>
                <c:when test="${zm:boolean(groupMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail2)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${contactUrlText}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.workEmail2)}</td>
            <c:if test="${zm:boolean(attendeeMode)}">
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
                        groupMode or !fn:contains(uploader.pendingAttendees,hit.contactHit.workEmail3)
                        and !fn:contains(uploader.compose.attendees,hit.contactHit.workEmail3)
                        and !fn:contains(uploader.pendingResources,hit.contactHit.workEmail3)
                        and !fn:contains(uploader.compose.resources,hit.contactHit.workEmail3)
            }">

    <c:if test="${not empty hit.contactHit.workEmail3}">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${zm:boolean(attendeeMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addAttendees" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                </c:when>
                <c:when test="${zm:boolean(groupMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="&#034;${fn:escapeXml(hit.contactHit.fullName)}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                </c:when>
                <c:otherwise>
                    <td width=2% nowrap><input type=checkbox  name="addTo" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox name="addCc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                    <td width=2% nowrap><input type=checkbox  name="addBcc" value="&#034;${contactUrlText}&#034; &lt;${fn:escapeXml(hit.contactHit.workEmail3)}&gt;"></td>
                </c:otherwise>
            </c:choose>
            <td width=1%><app:miniTagImage ids="${hit.contactHit.tagIds}"/></td>
            <td width=1%><app:img src="${hit.contactHit.image}" altkey="${hit.contactHit.imageAltKey}"/></td>
            <td width=1%>&nbsp;</td>
            <td width=20%>
                    ${contactUrlText}
            </td>
            <td >&nbsp;${fn:escapeXml(hit.contactHit.workEmail3)}</td>
            <c:if test="${zm:boolean(attendeeMode)}">
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
                    groupMode or !fn:contains(uploader.pendingAttendees,contact.galFullAddress)
                    and !fn:contains(uploader.compose.attendees,contact.galFullAddress)
                    and !fn:contains(uploader.pendingResources,contact.galFullAddress)
                    and !fn:contains(uploader.compose.resources,contact.galFullAddress)
        }">
        <tr>
            <td width=1%>&nbsp;</td>
            <c:choose>
                <c:when test="${zm:boolean(attendeeMode)}">
                    <c:choose>
                        <c:when test="${uploader.contactLocation eq 'resources'}">
                            <td width=2% nowrap><input type=checkbox  name="addResources" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                        </c:when>
                    <c:otherwise>
                        <td width=2% nowrap><input type=checkbox  name="addAttendees" value="${fn:escapeXml(contact.galFullAddress)}"></td>
                    </c:otherwise>
                    </c:choose>

                </c:when>
                <c:when test="${zm:boolean(groupMode)}">
                    <td width=2% nowrap><input type=checkbox  name="addToGroup" value="${fn:escapeXml(contact.galFullAddress)};${contact.refId != null ? fn:escapeXml(contact.refId) : fn:escapeXml(contact.id)};G">
                    </td>
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
            <td>
                    ${fn:escapeXml(contact.galFullAddress)}
            </td>
            <c:if test="${detailedSearchEnabled}">
                <td >
                 ${fn:escapeXml(contact.department)}
                </td>
            </c:if>

            <c:if test="${attendeeMode and uploader.contactLocation eq 'resources'}">
            <td>
                    ${fn:escapeXml(contact.attrs.zimbraCalResType)}
            </td>
            </c:if>
            <c:if test="${zm:boolean(attendeeMode)}">
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


