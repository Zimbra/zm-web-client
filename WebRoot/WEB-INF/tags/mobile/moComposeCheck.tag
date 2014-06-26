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
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mainx'}"/>
<c:set var="caction" value="${context_url}"/>
<c:choose>
<c:when test="${not empty param.bt}">
    <c:set var="bt" value="${param.bt}"/>
    <c:url var="caction" value='${context_url}?${fn:replace(param.bt,"|","&")}'/>
</c:when>
<c:when test="${empty prevUrl  && empty param.bt && not empty header['referer']}">
    <c:set var="caction" value='${header["referer"]}'/>
    <c:set var="bt"
           value="${fn:replace(fn:replace(fn:substringAfter(header['referer'],'?'),'appmsg=messageSent',''),'&','|')}"/>
</c:when>
</c:choose>
<c:url var="caction" value="${caction}">
	<c:param name="noframe" value="true"/>
</c:url>
<mo:handleError>
    <zm:composeUploader var="uploader"/>
    <%--<c:set var="needComposeView" value="${param.action eq 'compose'}"/>--%>
    <c:if test="${uploader.isUpload}">
        <c:choose>
            <c:when test="${uploader.isContactAdd or uploader.isContactSearch}">
                <%--
                <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                --%>
                <jsp:forward page="/h/addcontacts"/>
            </c:when>
            <c:when test="${uploader.isAttachAdd}">
                <zm:checkCrumb crumb="${uploader.paramValues['crumb'][0]}"/>
                <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                <jsp:forward page="/h/attachments"/>
            </c:when>
            <c:when test="${uploader.isAttachCancel}">
                <c:set var="needComposeView" value="${true}"/>
            </c:when>
            <c:when test="${uploader.isAttachDone}">
                <c:set var="needComposeView" value="${true}"/>
                <c:if test="${uploader.compose.hasFileItems}">
                    <zm:checkCrumb crumb="${uploader.paramValues['crumb'][0]}"/>
                    <zm:saveDraft var="draftResult" compose="${uploader.compose}"
                                  draftid="${uploader.compose.draftId}"/>
                    <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                </c:if>
            </c:when>
            <c:when test="${uploader.isCancel}">
                <c:set var="needComposeView" value="${false}"/>
            </c:when>
            <c:when test="${uploader.isSend and empty uploader.compose.to and empty uploader.compose.cc and empty uploader.compose.bcc}">
            	<c:if test="${ua.isiPad eq true}">
            		<c:set var="compAction" scope="request" value="iPadDraft"/>
            	</c:if>
                <app:status style="Critical">
                    <fmt:message key="noAddresses"/>
                </app:status>
            </c:when>
            <c:when test="${uploader.isSend}">
                <c:set var="contactId" value="${uploader.paramValues['contactId'][0]}" />
                <%-- if there is a contact id, always redirect to that contact page --%>
                <c:if test="${not empty contactId}">
                    <c:set var="caction" value="${'zmain?id='}${contactId}${'&action=view&st=contact'}" />
                    <c:url var="caction" value="${caction}">
                        <c:param name="noframe" value="true"/>
                    </c:url>
                </c:if>
                <zm:checkCrumb crumb="${uploader.paramValues['crumb'][0]}"/>
                <c:set var="needComposeView" value="${true}"/>
                <c:if test="${ua.isiPad eq true}">
                	<c:set var="compAction" scope="request" value="iPadSend"/>
                </c:if>
                <mo:handleError>
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
                    <c:choose>
	                    <c:when test="${ua.isiPad eq true}">
	                    	<app:status><fmt:message key="messageSent"/></app:status>
	                    </c:when>
	                    <c:otherwise>
		                    <c:redirect url="${caction}">
		                        <c:param name="appmsg" value="messageSent"></c:param>
		                    </c:redirect>
	                    </c:otherwise>
                    </c:choose>
                    <c:set var="needComposeView" value="${false}"/>
                </mo:handleError>
           </c:when>
            <c:when test="${uploader.isDraft}">
                <zm:checkCrumb crumb="${uploader.paramValues['crumb'][0]}"/>
                <zm:saveDraft var="draftResult" compose="${uploader.compose}" draftid="${uploader.compose.draftId}"/>
                <c:set scope="request" var="draftid" value="${draftResult.id}"/>
                <%-- TODO: check for errors, etc, set success message var and forward to prev page, or set error message and continue --%>
                <c:if test="${ua.isiPad eq true}">
                	<c:set var="compAction" scope="request" value="iPadDraft"/>
                </c:if>
                <app:status><fmt:message key="draftSavedSuccessfully"/></app:status>
                <c:set var="needComposeView" value="${true}"/>
            </c:when>
        </c:choose>
    </c:if>
</mo:handleError>

<%--<c:if test="${needComposeView}">
    <jsp:forward page="/m/mocompose"/>
</c:if>--%>
