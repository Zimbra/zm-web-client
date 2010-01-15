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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:composeUploader var="uploader"/>
    <c:set var="needEditView" value="${param.action eq 'edit' or param.action eq 'new'}"/>
    <c:if test="${uploader.isUpload}">
        <c:choose>
            <c:when test="${not empty uploader.paramValues.actionGo}">
                <c:set var="actionOp" value="${uploader.paramValues.actionOp[0]}"/>
                <c:set var="id" value="${uploader.compose.inviteId}"/>
                <c:choose>
                    <c:when test="${actionOp eq 'flag' or actionOp eq 'unflag'}">
                        <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
                        <zm:flagItem var="result" id="${id}" flag="${actionOp eq 'flag'}"/>
                        <app:status>
                            <fmt:message key="${actionOp eq 'flag' ? 'actionApptFlag' : 'actionApptUnflag'}">
                                <fmt:param value="${result.idCount}"/>
                            </fmt:message>
                        </app:status>
                        ${zm:clearMessageCache(mailbox)}
                    </c:when>
                    <c:when test="${fn:startsWith(actionOp, 't:') or fn:startsWith(actionOp, 'u:')}">
                        <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
                        <c:set var="untagall" value="${fn:startsWith(actionOp, 'u:all')}"/>
                        <c:choose>
                        <c:when test="${untagall}" >
                            <zm:forEachTag var="eachtag">
                                <zm:tagItem tagid="${eachtag.id}" var="result" id="${id}" tag="false"/>
                            </zm:forEachTag>
                            <app:status>
                                <fmt:message key="${'actionApptUntagAll'}" >
                                  <fmt:param value="${result.idCount}"/>
                            </fmt:message>
                            </app:status>
                        </c:when>
                        <c:otherwise>
                        <c:set var="tag" value="${fn:startsWith(actionOp, 't')}"/>
                        <c:set var="tagid" value="${fn:substring(actionOp, 2, -1)}"/>
                        <zm:tagItem tagid="${tagid}"var="result" id="${id}" tag="${tag}"/>
                        <app:status>
                            <fmt:message key="${tag ? 'actionApptTag' : 'actionApptUntag'}">
                                <fmt:param value="${result.idCount}"/>
                                <fmt:param value="${zm:getTagName(pageContext, tagid)}"/>
                            </fmt:message>
                        </app:status>
                        ${zm:clearMessageCache(mailbox)}
                       </c:otherwise>
                    </c:choose>
                    </c:when>
                    <c:otherwise>
                        <app:status style="Warning"><fmt:message key="actionNoActionSelected"/></app:status>
                    </c:otherwise>
                </c:choose>
            </c:when>
            <c:when test="${uploader.isRepeatEdit}">
                <jsp:forward page="/h/repeat"/>
            </c:when>
            <c:when test="${not empty uploader.paramValues.removeAttendee}">
                <c:set property="attendees" target="${uploader.compose}" value="${fn:replace(uploader.compose.attendees,uploader.paramValues.removeAttendee[0],'')}"/>
                <c:set property="pendingAttendees" target="${uploader}" value="${fn:replace(uploader.pendingAttendees,uploader.paramValues.removeAttendee[0],'')}"/>
                <c:set property="resources" target="${uploader.compose}" value="${fn:replace(uploader.compose.resources,uploader.paramValues.removeAttendee[0],'')}"/>
                <c:set property="pendingResources" target="${uploader}" value="${fn:replace(uploader.pendingResources,uploader.paramValues.removeAttendee[0],'')}"/>
                <jsp:forward page="/h/addattendees"/>
            </c:when>
            <c:when test="${not empty uploader.paramValues.schedulePrevDate or not empty uploader.paramValues.scheduleNextDate}">
                <fmt:message key="CAL_APPT_EDIT_DATE_FORMAT" var="calEditDateFmt"/>
                <fmt:parseDate value="${uploader.compose.startDate}" pattern="${calEditDateFmt}" var="apptSDate"/>
                <fmt:parseDate value="${uploader.compose.endDate}" pattern="${calEditDateFmt}" var="apptEDate"/>

                <c:if test="${not empty uploader.paramValues.schedulePrevDate}">
                    <c:set var="newStartDate" value="${zm:addDay(zm:getCalendar(apptSDate.time,null), -1)}"/>
                    <c:set var="newEndDate" value="${zm:addDay(zm:getCalendar(apptEDate.time,null), -1)}"/>
                </c:if>
                <c:if test="${not empty uploader.paramValues.scheduleNextDate}">
                    <c:set var="newStartDate" value="${zm:addDay(zm:getCalendar(apptSDate.time,null), 1)}"/>
                    <c:set var="newEndDate" value="${zm:addDay(zm:getCalendar(apptEDate.time,null), 1)}"/>
                </c:if>

                <fmt:formatDate value="${newStartDate.time}" var="newStartDate" pattern="${calEditDateFmt}"/>
                <fmt:formatDate value="${newEndDate.time}" var="newEndDate" pattern="${calEditDateFmt}"/>
                <c:set property="startDate" target="${uploader.compose}" value="${newStartDate}"/>
                <c:set property="endDate" target="${uploader.compose}" value="${newEndDate}"/>

                <jsp:forward page="/h/addattendees"/>
            </c:when>
            <c:when test="${uploader.isContactAdd or uploader.isContactSearch}">
                <%--
            <zm:saveDraft var="draftResult" compose="${upload,er.compose}" draftid="${uploader.compose.draftId}"/>
            <c:set scope="request" var="draftid" value="${draftResult.id}"/>
            --%>
                <jsp:forward page="/h/addattendees"/>
            </c:when>
            <c:when test="${uploader.isAttachAdd}">
                <%--
            <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
            <c:set scope="request" var="draftid" value="${draftResult.id}"/>
            --%>
                <jsp:forward page="/h/attachments"/>
            </c:when>
            <c:when test="${uploader.isAttachCancel}">
                <c:set var="needEditView" value="${true}"/>
            </c:when>
            <c:when test="${uploader.isAttachDone}">
                <c:set var="needEditView" value="${true}"/>
                <c:if test="${uploader.compose.hasFileItems}">
                    <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                    <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                </c:if>
            </c:when>
            <c:when test="${uploader.isCancel}">
                <c:set var="needEditView" value="${false}"/>
            </c:when>
            <c:when test="${uploader.isCancelConfirm}">
            <c:set var="needEditView" value="${false}"/>
            <c:if test="${! empty uploader && not empty uploader.compose && (not empty uploader.compose.subject || not empty uploader.compose.location || not empty uploader.compose.attendees || not empty uploader.compose.content)}">
                <c:set var="needEditView" value="${true}"/>
                <fmt:message key="yes" var="yes"/>
                <c:url var="cancelUrl" value="/h/calendar"/>
                <app:status html="true" style="Warning">
                    <fmt:message key="confirmUnsavedChanges">
                        <fmt:param value="<a style='margin:10px;font-weight:bold;' href='${cancelUrl}'>${yes}</a>"/>
                    </fmt:message>
                </app:status>
            </c:if>
        </c:when>
            <c:when test="${uploader.isSave and not uploader.compose.isValidStartTime}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptStartDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and not uploader.compose.isValidEndTime}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptEndDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and uploader.compose.isValidEndTime and uploader.compose.isValidStartTime and (uploader.compose.apptEndTime lt uploader.compose.apptStartTime)}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptEndBeforeStart"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and empty uploader.compose.subject}">
                <app:status style="Critical">
                    <fmt:message key="errorMissingSubject"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and not zm:isValidEmailAddresses(uploader.compose.attendees)}">
                <app:status style="Critical">
                    <fmt:message key="invalidAttendees"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and not zm:isValidEmailAddresses(uploader.compose.resources)}">
                <app:status style="Critical">
                    <fmt:message key="invalidResources"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isApptCancel or uploader.isApptDelete}">
                <c:set var="needEditView" value="${true}"/>
                <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
                <app:handleError>
                    <c:set var="apptId" value="${uploader.compose.useInstance and not empty uploader.compose.exceptionInviteId ? uploader.compose.exceptionInviteId : uploader.compose.inviteId}"/>
                    <c:choose>
                        <c:when test="${not empty apptId}">
                            <zm:getMessage var="message" id="${apptId}" markread="true" neuterimages="${empty param.xim}" wanthtml="false"/>
                        </c:when>
                        <c:otherwise>
                            <c:set var="message" value="${null}"/>
                        </c:otherwise>
                    </c:choose>
                    <zm:cancelAppointment compose="${uploader.compose}" message="${message}"/>
                    <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                    <app:status><fmt:message key="${uploader.isApptCancel ? 'actionApptCancelled' : 'actionApptDeleted'}"/></app:status>
                    <c:set var="needEditView" value="${false}"/>
                </app:handleError>
            </c:when>
            <c:when test="${uploader.isSave}">
                <c:set var="needEditView" value="${true}"/>
                <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
                <app:handleError>
                    <c:set var="apptId" value="${uploader.compose.useInstance and not empty uploader.compose.exceptionInviteId ? uploader.compose.exceptionInviteId : uploader.compose.inviteId}"/>
                    <c:choose>
                        <c:when test="${not empty apptId}">
                            <zm:getMessage var="message" id="${apptId}" markread="true" neuterimages="${empty param.xim}" wanthtml="false"/>
                        </c:when>
                        <c:otherwise>
                            <c:set var="message" value="${null}"/>
                        </c:otherwise>
                    </c:choose>
                    <zm:saveAppointment var="createResult" compose="${uploader.compose}" message="${message}"/>
                    <c:if test="${not empty message and uploader.compose.apptFolderId ne message.folderId}">
                        <zm:moveItem var="moveResult" id="${apptId}" folderid="${uploader.compose.apptFolderId}"/>
                    </c:if>
                    <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                    <app:status><fmt:message key="${empty message ? 'actionApptCreated' : 'actionApptSaved'}"/></app:status>
                    <c:set var="needEditView" value="${false}"/>
                </app:handleError>
            </c:when>
        </c:choose>
    </c:if>
    
    <c:if test="${needEditView}">
        <jsp:forward page="/h/eappt"/>
    </c:if>

</app:handleError>
