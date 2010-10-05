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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
<zm:composeUploader var="uploader"/>
<c:set var="needComposeView" value="${param.action eq 'compose'}"/>
<c:if test="${param.cancelConfirmed }">
    <c:set var="needComposeView" value="${false}"/>
    <c:if test="${not empty sessionScope.temp_draftid}">
        <zm:deleteMessage var="result" id="${sessionScope.temp_draftid}"/>
        <c:remove var="temp_draftid" scope="session"/>
    </c:if>
</c:if>
<c:if test="${uploader.isUpload}">
    <c:set var="composeformat" value="${mailbox.prefs.composeFormat}" />
    <c:if test="${mailbox.prefs.forwardReplyInOriginalFormat && !empty param.rf && (param.rf eq 'html' || param.rf eq 'text')}">
        <c:set var="composeformat" value="${param.rf}"/>
    </c:if>
    <%-- SWAP the inline images src and dfsrc before send, save etc. --%>
    <c:set var="isHtml" value="${composeformat eq 'html'}"/>
    <c:set var="theBody" value="${isHtml ? (empty uploader.compose.htmlContent ?  uploader.compose.content : uploader.compose.htmlContent) : uploader.compose.content}"/>
    <c:set var="theBody" value="${fn:replace(theBody,' dfsrc=',' asrc=')}"/>
    <c:set var="theBody" value="${fn:replace(theBody,' src=',' dfsrc=')}"/>
    <c:set var="theBody" value="${fn:replace(theBody,' asrc=',' src=')}"/>
    <c:set var="contentToSet" value="${isHtml ? (empty uploader.compose.htmlContent ?  'content' : 'htmlContent') : 'content'}"/>
    <c:set property="${contentToSet}" value="${theBody}" target="${uploader.compose}"/>

    <c:choose>
        <c:when test="${uploader.isContactAdd or uploader.isContactSearch}">
           <c:choose>
                <c:when test="${not empty uploader.compose.draftId}">
                    <c:set scope="request" var="draftid" value="${uploader.compose.draftId}"/>
                </c:when>
                <c:otherwise>
                    <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                    <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                    <c:set var="temp_draftid" scope="session" value="${draftResult.id}"/>
                </c:otherwise>
            </c:choose>
            <jsp:forward page="/h/addcontacts"/>
        </c:when>
        <c:when test="${uploader.isAttachAdd}">
            <c:choose>
                <c:when test="${not empty uploader.compose.draftId}">
                    <c:set scope="request" var="draftid" value="${uploader.compose.draftId}"/>
                </c:when>
                <c:otherwise>
                    <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                    <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                    <c:set var="temp_draftid" scope="session" value="${draftResult.id}"/>
                </c:otherwise>
            </c:choose>
            <jsp:forward page="/h/attachments"/>
        </c:when>
        <c:when test="${uploader.isAttachCancel}">
            <c:set var="needComposeView" value="${true}"/>
        </c:when>
        <c:when test="${uploader.isAttachDone}">
            <c:set var="needComposeView" value="${true}"/>
            <c:if test="${uploader.compose.hasFileItems}">
                <c:forEach var="part" items="${uploader.compose.fileItems}" varStatus="status">
                    <c:set var="emptyfile" value="${part.size eq 0 ? true : false}"/> 
                    <c:if test="${emptyfile}">
                       <app:status><fmt:message key="zeroSizedAtts"/></app:status> 
                    </c:if>
                </c:forEach>
                <c:choose>
                    <c:when test="${not empty uploader.compose.draftId}">
                        <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                        <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                    </c:when>
                    <c:otherwise>
                        <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                        <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                        <c:set var="temp_draftid" scope="session" value="${draftResult.id}"/>
                    </c:otherwise>
                </c:choose>
            </c:if>
        </c:when>
        <c:when test="${uploader.isCancel}">
            <c:set var="needComposeView" value="${false}"/>
            <c:set var="noComposeView" scope="session" value="${true}"/>
            <c:if test="${not empty sessionScope.temp_draftid}">
                <zm:deleteMessage var="result" id="${sessionScope.temp_draftid}"/>
                <c:remove var="temp_draftid" scope="session"/>
            </c:if>
        </c:when>
        <c:when test="${uploader.isCancelConfirm}">
            <c:set var="needComposeView" value="${false}"/>
            <c:set var="noComposeView" scope="session" value="${true}"/>
            <c:if test="${! empty uploader && not empty uploader.compose && (not empty uploader.compose.to || not empty uploader.compose.cc || not empty uploader.compose.bcc || not empty uploader.compose.subject || not empty uploader.compose.content || not empty sessionScope.temp_draftid)}">
                <c:set var="needComposeView" value="${true}"/>
                <fmt:message key="yes" var="yes"/>
                 <c:url var="cancelUrl" value="/h/search">
                     <c:if test="${not empty sessionScope.temp_draftid}">
                        <c:param name="action" value="compose"/>
                        <c:param name="cancelConfirmed" value="true"/>
                        <c:param name="temp_draftid" value="${sessionScope.temp_draftid}"/>
                    </c:if>
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
        <c:when test="${uploader.isSend and empty fn:trim(uploader.compose.to) and empty fn:trim(uploader.compose.cc) and empty fn:trim(uploader.compose.bcc)}">
            <app:status>
                <fmt:message key="noAddresses"/>
            </app:status>
        </c:when>
        <c:when test="${uploader.isSend}">
            <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
            <c:set var="needComposeView" value="${true}"/>
            <app:handleError>
                <c:choose>
                    <c:when test="${not empty uploader.compose.inviteReplyVerb}">
                        <zm:sendInviteReply var="sendInviteReplyResult" compose="${uploader.compose}"/>
                    </c:when>
                    <c:otherwise>
                        <zm:sendMessage var="sendResult" compose="${uploader.compose}"/>
                    </c:otherwise>
                </c:choose>
                <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                <app:status><fmt:message key="messageSent"/></app:status>
                <c:if test="${!empty uploader.compose.draftId}">
                    <c:catch>
                        <zm:deleteMessage var="actionResult" id="${uploader.compose.draftId}"/>
                    </c:catch>
                </c:if>
                <c:set var="needComposeView" value="${false}"/>
                <c:set var="noComposeView" scope="session" value="${true}"/>
            </app:handleError>
        </c:when>
        <c:when test="${uploader.isAutoSave}">
            <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
            <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
            <c:set scope="request" var="draftid" value="${draftResult.id}"/>
            <c:remove var="temp_draftid" scope="session"/>
            <app:status><fmt:message key="draftSavedAuto"/></app:status>
            <c:set var="needComposeView" value="${false}"/>
            <c:import url="/h/autoSaveDraft"/>
        </c:when>
        <c:when test="${uploader.isDraft}">
            <zm:checkCrumb crumb="${uploader.paramValues.crumb[0]}"/>
            <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
            <c:set scope="request" var="draftid" value="${draftResult.id}"/>
            <c:remove var="temp_draftid" scope="session"/>
            <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
            <app:status><fmt:message key="draftSavedSuccessfully"/></app:status>
            <c:set var="needComposeView" value="${true}"/>
        </c:when>
    </c:choose>
</c:if>
</app:handleError>

<c:if test="${needComposeView}">
    <c:import url="/h/compose"/>
</c:if>

