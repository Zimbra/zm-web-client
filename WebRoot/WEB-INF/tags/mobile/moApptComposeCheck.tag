<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mainx'}"/>
<c:set var="caction" value="${context_url}"/>
<c:choose>
<c:when test="${not empty param.bt}">
    <c:set var="bt" value="${param.bt}"/>
    <c:url var="caction" value='${context_url}?${fn:replace(param.bt,"|","&")}&bt=${bt}'/>
</c:when>
<c:when test="${empty param.bt && not empty header['referer']}">
    <c:set var="caction" value='${header["referer"]}'/>
    <c:set var="bt"
           value="${fn:replace(fn:replace(fn:substringAfter(header['referer'],'?'),'appmsg=actionApptSaved',''),'&','|')}"/>
</c:when>
</c:choose>
<c:url var="caction" value="${caction}">
	<c:param name="noframe" value="true"/>
</c:url>
<mo:handleError>
    <%--<zm:getMailbox var="mailbox"/>--%>
    <zm:composeUploader var="uploader"/>
    <%--<c:set var="needEditView" value="${param.action eq 'editappt' or param.action eq 'newappt'}"/>--%>
    <c:if test="${uploader.isUpload}">
        <c:choose>
            <c:when test="${uploader.isCancel}">
                <c:set var="needEditView" value="${false}"/>
            </c:when>
            <c:when test="${uploader.isSave and not uploader.compose.isValidStartTime}">
            	<c:if test="${ua.isiPad eq true}">
                	<c:set var="compAction" scope="request" value="iPadApptInvalid"/>
                </c:if>
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptStartDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and not uploader.compose.isValidEndTime}">
            	<c:if test="${ua.isiPad eq true}">
                	<c:set var="compAction" scope="request" value="iPadApptInvalid"/>
                </c:if>
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptEndDate"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and uploader.compose.isValidEndTime and uploader.compose.isValidStartTime and (uploader.compose.apptEndTime lt uploader.compose.apptStartTime)}">
                <c:if test="${ua.isiPad eq true}">
                	<c:set var="compAction" scope="request" value="iPadApptInvalid"/>
                </c:if>
                <app:status style="Critical">
                    <fmt:message key="errorInvalidApptEndBeforeStart"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSave and empty uploader.compose.subject}">
                <c:if test="${ua.isiPad eq true}">
                	<c:set var="compAction" scope="request" value="iPadApptInvalid"/>
                </c:if>
                <app:status style="Critical">
                    <fmt:message key="errorMissingSubject"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isApptCancel or uploader.isApptDelete}">
                <c:set var="needEditView" value="${true}"/>
                <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
                <mo:handleError>
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
                </mo:handleError>
            </c:when>
            <c:when test="${uploader.isSave}">
                <c:set var="needEditView" value="${true}"/>
                <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
                <c:if test="${ua.isiPad eq true}">
                	<c:set var="compAction" scope="request" value="iPadApptSave"/>
                </c:if>
                <mo:handleError>
                    <c:set var="apptId" value="${uploader.compose.useInstance and not empty uploader.compose.exceptionInviteId ? uploader.compose.exceptionInviteId : uploader.compose.inviteId}"/>
                    <c:choose>
                        <c:when test="${not empty apptId}">
                            <zm:getMessage var="message" id="${apptId}" markread="true" neuterimages="${empty param.xim}" wanthtml="false"/>
                        </c:when>
                        <c:otherwise>
                            <c:set var="message" value="${null}"/>
                        </c:otherwise>
                    </c:choose>
                    <c:if test="${param.st ne 'newtask'}">
                    <zm:saveAppointment var="createResult" compose="${uploader.compose}" message="${message}"/>
                    </c:if>
                    <c:if test="${param.st eq 'newtask'}">
                    <zm:saveTask var="createResult" compose="${uploader.compose}" message="${message}"/>
                    </c:if>
                    <c:if test="${not empty message and uploader.compose.apptFolderId ne message.folderId}">
                        <zm:moveItem var="moveResult" id="${apptId}" folderid="${uploader.compose.apptFolderId}"/>
                    </c:if>
                    <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                    <app:status><fmt:message key="${empty message ? 'actionApptCreated' : 'actionApptSaved'}"/></app:status>
		    		
		    		<c:choose>
		    		<c:when test="${ua.isiPad eq true}">
		    			<c:if test="${param.st eq 'newtask'}">
		                        
		                </c:if>
		                <c:if test="${param.st ne 'newtask'}">
		                        
		                </c:if> 
		    		</c:when>
		    		<c:otherwise>
	                    <c:redirect url="${caction}">
		                    <c:if test="${param.st eq 'newtask'}">
		                        <c:param name="appmsg" value="${empty message ? 'actionTaskCreated' : 'actionTaskSaved'}"/>
		                    </c:if>
		                    <c:if test="${param.st ne 'newtask'}">
		                        <c:param name="appmsg" value="${empty message ? 'actionApptCreated' : 'actionApptSaved'}"/>
		                    </c:if> 
							<c:param name="bt" value="${bt}"/>
	                    </c:redirect>
                    </c:otherwise>
                    </c:choose>
		    <c:set var="needEditView" value="${false}"/>
                </mo:handleError>
            </c:when>
        </c:choose>
    </c:if>
</mo:handleError>
<%-- <c:if test="${needEditView}">
        <jsp:forward page="/m/moapptcompose"/>
</c:if>--%>
