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

<c:set var="showMovedTrash" value="${param.action eq 'actionMessageMovedTrash'}"/>
<app:handleError>
	<c:if test="${not showMovedTrash}">
		<zm:requirePost/>
		<zm:checkCrumb crumb="${param.crumb}"/>
		<zm:getMailbox var="mailbox"/>
		<c:set var="ids" value="${zm:deserializeVoiceMailItemIds(paramValues.voiceId, paramValues.phone)}"/>
		<c:set var="phone" value="${fn:join(paramValues.phone, ',')}"/>
		<c:set var="folderId" value="${not empty paramValues.folderId[0] ? paramValues.folderId[0] : paramValues.folderId[1]}"/>
		<c:set var="actionOp" value="${not empty paramValues.actionOp[0] ? paramValues.actionOp[0] :  paramValues.actionOp[1]}"/>
	</c:if>

	<fmt:message var="faqlink" key="errorPhoneFAQLink"/>
	<fmt:message var="faqurl" key="errorPhoneFAQURL"/>
	<c:set var="faqlink" value="&nbsp;${fn:replace(faqlink, '{1}', faqurl)}"/>

<c:choose>
	<c:when test="${showMovedTrash}">
		<app:status>	
			<fmt:message key="actionVoiceMailMovedTrash1"/>
		</app:status>
	</c:when>
    <c:when test="${zm:actionSet(param, 'actionDelete')}">
        <zm:trashVoiceMail var="result" phone="${phone}" id="${ids}"/>
        <app:status>
            <fmt:message key="actionVoiceMailMovedTrash">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionUndelete')}">
        <zm:untrashVoiceMail var="result" phone="${phone}" id="${ids}"/>
        <app:status>
            <fmt:message key="actionVoiceMailMovedInbox">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionHardDelete')}">
        <zm:emptyVoiceMailTrash var="result" phone="${phone}" folderId="${folderId}"/>
        <app:status>
			<fmt:message key="folderEmptied">
				<fmt:param><fmt:message key="trash"/></fmt:param>
			</fmt:message>
        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMarkHeard')}">
        <zm:markVoiceMailHeard var="result" phone="${phone}" id="${ids}" heard="true"/>
        <app:status>
            <fmt:message key="actionVoiceMailMarkedHeard">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>

        </app:status>
    </c:when>
    <c:when test="${zm:actionSet(param, 'actionMarkUnheard')}">
        <zm:markVoiceMailHeard var="result" phone="${phone}" id="${ids}" heard="false"/>
        <app:status>
            <fmt:message key="actionVoiceMailMarkedUnheard">
                <fmt:param value="${result.idCount}"/>
            </fmt:message>
        </app:status>
    </c:when>

<%--

    <c:when test="${zm:actionSet(param, 'actionAddToForward')}">
	<zm:addToForwardFeature var="result" phone="${phone}" voiceId="${paramValues.voiceId}" error="error" max="12"/>
	<c:set var="selectiveCallForwardingFrom" scope="session" value="${null}"/>
	<c:set var="selectiveCallForwardingFetched" scope="session" value="${false}"/>
	<c:choose>
		<c:when test="${result==1}">
		    <app:status><fmt:message key="actionCallerAddedToForwardSi"/></app:status>
		</c:when>
		<c:when test="${result>1}">
        	    <app:status><fmt:message key="actionCallerAddedToForwardPl">
        		<fmt:param value="${result}"/>
    		    </fmt:message></app:status>
		</c:when>
		<c:when test="${error=='voice.SELECTIVE_CALL_FORWARD_ALREADY_IN_LIST'}">
		    <app:status><fmt:message key="actionCallerAlreadyInForward"/></app:status>
		</c:when>
		<c:otherwise>
		    <app:status style="Error" html="true">
		    <fmt:message key="${error}"/>&nbsp;${faqlink}
		    </app:status>
		</c:otherwise>
	</c:choose>
    </c:when>
    
    <c:when test="${zm:actionSet(param, 'actionAddToReject')}">
	<zm:addToRejectFeature var="result" phone="${phone}" voiceId="${paramValues.voiceId}" error="error"/>
	<c:choose>
		<c:when test="${result==1}">
		    <app:status><fmt:message key="actionCallerAddedToRejectSi"/></app:status>
		</c:when>
		<c:when test="${result>1}">
        	    <app:status><fmt:message key="actionCallerAddedToRejectPl">
        		<fmt:param value="${result}"/>
    		    </fmt:message></app:status>
		</c:when>
		<c:when test="${error=='voice.SELECTIVE_CALL_REJECT_ALREADY_IN_LIST'}">
		    <app:status><fmt:message key="actionCallerAlreadyInReject"/></app:status>
		</c:when>
		<c:otherwise>
		    <app:status style="Error" html="true">
		    <fmt:message key="${error}"/>&nbsp;${faqlink}
		    </app:status>
		</c:otherwise>
	</c:choose>
    </c:when>
--%>
    
	<c:otherwise>
		<app:status style="Warning"><fmt:message key="actionNoActionSelected"/></app:status>
	</c:otherwise>
</c:choose>

</app:handleError>
