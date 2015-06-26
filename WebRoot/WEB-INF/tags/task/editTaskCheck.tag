<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2013, 2014 Zimbra, Inc.
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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:composeUploader var="uploader"/>
    <c:set var="needEditView" value="${param.action eq 'edittask' or param.action eq 'newtask'}"/>
    <c:set var="needNonEditView" value="${param.action eq 'viewtask'}"/>
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
                            <fmt:message key="${actionOp eq 'flag' ? 'actionTaskFlag' : 'actionTaskUnflag'}">
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
                                    <fmt:message key="${'actionTaskUntagAll'}" >
                                        <fmt:param value="${result.idCount}"/>
                                    </fmt:message>
                                </app:status>
                            </c:when>
                            <c:otherwise>
                                <c:set var="tag" value="${fn:startsWith(actionOp, 't')}"/>
                                <c:set var="tagid" value="${fn:substring(actionOp, 2, -1)}"/>
                                <zm:tagItem tagid="${tagid}" var="result" id="${id}" tag="${tag}"/>
                                <app:status>
                                    <fmt:message key="${tag ? 'actionTaskTag' : 'actionTaskUntag'}">
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
            <c:when test="${uploader.isCancel}">
                <c:set var="needEditView" value="${false}"/>
            </c:when>
            <c:when test="${uploader.isCancelConfirm}">
            <c:set var="needEditView" value="${false}"/>
            <c:if test="${! empty uploader && not empty uploader.compose && (not empty uploader.compose.subject || not empty uploader.compose.location || not empty uploader.compose.content)}">
                <c:set var="needEditView" value="${true}"/>
                <fmt:message key="yes" var="yes"/>
                <c:url var="cancelUrl" value="/h/search?st=task">
                    <c:if test="${not empty param.sfi}">
                        <c:param name="sfi" value="${param.sfi}"/>
                    </c:if>
                </c:url>
                <app:status html="true" style="Warning">
                    <fmt:message key="confirmUnsavedChanges">
                        <fmt:param value="<a style='margin:10px;font-weight:bold;' href='${cancelUrl}'>${yes}</a>"/>
                    </fmt:message>
                </app:status>
            </c:if>
        </c:when>
            <c:when test="${uploader.isSave and empty uploader.compose.endDate and not empty uploader.compose.startDate}">
                <app:status style="Critical">
                    <fmt:message key="errorEmptyTaskDueDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and not empty uploader.compose.startDate and not uploader.compose.isValidStartTime}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptStartDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and not empty uploader.compose.endDate and not uploader.compose.isValidEndTime}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptEndDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and not empty uploader.compose.startDate and not empty uploader.compose.endDate and uploader.compose.isValidEndTime and uploader.compose.isValidStartTime and (uploader.compose.apptEndTime lt uploader.compose.apptStartTime)}">
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptEndBeforeStart"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and empty uploader.compose.subject}">
                <app:status style="Critical">
                    <fmt:message key="errorMissingSubject"/>
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
                    <zm:cancelTask compose="${uploader.compose}" message="${message}"/>
                    <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                    <app:status><fmt:message key="${uploader.isApptCancel ? 'actionTaskCancelled' : 'actionTaskSingleDeleted'}"/></app:status>
                    <c:set var="needEditView" value="${false}"/>
                </app:handleError>
            </c:when>
            <c:when test="${uploader.isSave}">
                <c:set var="needEditView" value="${true}"/>
                <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
                <%--<app:handleError>--%>
                    <c:set var="apptId" value="${uploader.compose.useInstance and not empty uploader.compose.exceptionInviteId ? uploader.compose.exceptionInviteId : uploader.compose.inviteId}"/>
                    <c:choose>
                        <c:when test="${not empty apptId}">
                            <zm:getMessage var="message" id="${apptId}" markread="true" neuterimages="${empty param.xim}" wanthtml="false"/>
                        </c:when>
                        <c:otherwise>
                            <c:set var="message" value="${null}"/>
                        </c:otherwise>
                    </c:choose>
                    <zm:saveTask var="createResult" compose="${uploader.compose}" message="${message}"/>
                    <c:if test="${not empty message and uploader.compose.apptFolderId ne message.folderId}">
                        <zm:moveItem var="moveResult" id="${apptId}" folderid="${uploader.compose.apptFolderId}"/>
                    </c:if>
                    <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                    <app:status><fmt:message key="${empty message ? 'actionTaskCreated' : 'actionTaskSaved'}"/></app:status>
                    <c:set var="needEditView" value="${false}"/>
                     <zm:clearSearchCache/>
                <%-- </app:handleError>--%>
            </c:when>
        </c:choose>
    </c:if>

     <c:if test="${needNonEditView}">
        <jsp:forward page="/h/task"/>
    </c:if>
    <c:if test="${needEditView}">
        <jsp:forward page="/h/etask"/>
    </c:if>

</app:handleError>
