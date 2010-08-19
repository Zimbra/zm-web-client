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
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>
<zm:getMailbox var="mailbox"/>
<zm:modifyPrefs var="updated">

    <c:choose>
        <%-- GENERAL --%>
        <c:when test="${selected eq 'general'}">
            <zm:pref name="zimbraPrefIncludeSpamInSearch" value="${param.zimbraPrefIncludeSpamInSearch eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefIncludeTrashInSearch" value="${param.zimbraPrefIncludeTrashInSearch eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefShowSearchString" value="${param.zimbraPrefShowSearchString eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefClientType" value="${param.zimbraPrefClientType}"/>
            <c:if test="${mailbox.features.skinChange}">
                <zm:pref name="zimbraPrefSkin" value="${param.zimbraPrefSkin}"/>
            </c:if>
            <zm:pref name="zimbraPrefTimeZoneId" value="${param.zimbraPrefTimeZoneId}"/>
            <zm:pref name="zimbraPrefDefaultPrintFontSize" value="${param.zimbraPrefDefaultPrintFontSize}"/>
        </c:when>
        <%-- MAIL --%>
        <c:when test="${selected eq 'mail'}">
            <c:if test="${mailbox.features.conversations and not empty param.zimbraPrefGroupMailBy}">
                <zm:pref name="zimbraPrefGroupMailBy" value="${param.zimbraPrefGroupMailBy}"/>
            </c:if>
            <zm:pref name="zimbraPrefMailItemsPerPage" value="${param.zimbraPrefMailItemsPerPage}"/>
            <zm:pref name="zimbraPrefShowFragments" value="${param.zimbraPrefShowFragments eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefReadingPaneEnabled" value="${param.zimbraPrefReadingPaneEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <c:if test="${mailbox.features.initialSearchPreference}">
                <zm:pref name="zimbraPrefMailInitialSearch" value="${param.zimbraPrefMailInitialSearch}"/>
            </c:if>

            <c:if test="${mailbox.features.outOfOfficeReply}">
                <zm:pref name="zimbraPrefOutOfOfficeReplyEnabled" value="${param.zimbraPrefOutOfOfficeReplyEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
                <zm:pref name="zimbraPrefOutOfOfficeReply" value="${param.zimbraPrefOutOfOfficeReply}"/>
	            <fmt:message key="CAL_APPT_EDIT_DATE_FORMAT" var="editDateFmt"/>
                <c:choose>
		            <c:when test="${param.zimbraPrefOutOfOfficeReplyEnabled eq 'TRUE'}">
			            <c:set var="fromDate" value="${param.zimbraPrefOutOfOfficeFromDate}" />
			            <c:set var="untilDate" value="${param.zimbraPrefOutOfOfficeUntilDate}" />
			            <c:if test="${not empty fromDate}">
				            <c:catch var="parseError">
					            <fmt:parseDate pattern="${editDateFmt}" value="${fromDate}" var="parsedDate"  />
					            <fmt:formatDate value="${parsedDate}" pattern="yyyyMMddHHmmss'Z'" var="fmtDate" />
				            </c:catch>
				            <c:if test="${not empty parseError}">
					            <c:set var="fmtDate" value=""/>
				            </c:if>
				            <zm:pref name="zimbraPrefOutOfOfficeFromDate" value="${fmtDate}"/>
			            </c:if>
			            <c:if test="${not empty untilDate}">
				            <c:catch var="parseError">
					            <fmt:parseDate pattern="${editDateFmt}" value="${untilDate}" var="parsedDate"  />
					            <fmt:formatDate value="${parsedDate}" pattern="yyyyMMddHHmmss'Z'" var="fmtDate" />
				            </c:catch>
				            <c:if test="${not empty parseError}">
					            <c:set var="fmtDate" value=""/>
				            </c:if>
				            <zm:pref name="zimbraPrefOutOfOfficeUntilDate" value="${fmtDate}"/>
			            </c:if>
		            </c:when>
		            <c:otherwise>
			            <zm:pref name="zimbraPrefOutOfOfficeFromDate" value=""/>
			            <zm:pref name="zimbraPrefOutOfOfficeUntilDate" value=""/>
		            </c:otherwise>
	            </c:choose>
            </c:if>

            <c:if test="${mailbox.features.newMailNotification}">
                <zm:pref name="zimbraPrefNewMailNotificationEnabled" value="${param.zimbraPrefNewMailNotificationEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
                <zm:pref name="zimbraPrefNewMailNotificationAddress" value="${param.zimbraPrefNewMailNotificationAddress}"/>
            </c:if>

            <c:if test="${mailbox.features.mailForwarding}">
                <zm:pref name="zimbraPrefMailForwardingAddress" value="${param.FORWARDCHECKED eq 'TRUE' ? param.zimbraPrefMailForwardingAddress : ''}"/>
                <zm:pref name="zimbraPrefMailLocalDeliveryDisabled" value="${param.zimbraPrefMailLocalDeliveryDisabled eq 'TRUE' and param.FORWARDCHECKED eq 'TRUE' and not empty param.zimbraPrefMailForwardingAddress ? 'TRUE' : 'FALSE'}"/>
            </c:if>

            <zm:pref name="zimbraPrefMessageViewHtmlPreferred" value="${param.zimbraPrefMessageViewHtmlPreferred eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefDedupeMessagesSentToSelf" value="${param.zimbraPrefDedupeMessagesSentToSelf}"/>
			<c:if test="${mailbox.features.pop3Enabled}">
				<zm:pref name="zimbraPrefPop3DownloadSince" value="${param.zimbraPrefPop3DownloadSince}" />
			</c:if>
            <%-- for velodrome --%>
            <zm:pref name="zimbraPrefInboxUnreadLifetime" value="${param.zimbraPrefInboxUnreadLifetime}"/>
            <zm:pref name="zimbraPrefInboxReadLifetime" value="${param.zimbraPrefInboxReadLifetime}"/>
            <zm:pref name="zimbraPrefSentLifetime" value="${param.zimbraPrefSentLifetime}"/>
            <zm:pref name="zimbraPrefJunkLifetime" value="${param.zimbraPrefSpamLifetime}"/>
            <zm:pref name="zimbraPrefTrashLifetime" value="${param.zimbraPrefTrashLifetime}"/>
        </c:when>
        <%-- COMPOSING --%>
        <c:when test="${selected eq 'composing'}">
            <zm:pref name="zimbraPrefHtmlEditorDefaultFontFamily" value="${param.zimbraPrefHtmlEditorDefaultFontFamily}"/>
            <zm:pref name="zimbraPrefHtmlEditorDefaultFontSize" value="${param.zimbraPrefHtmlEditorDefaultFontSize}"/>
            <zm:pref name="zimbraPrefHtmlEditorDefaultFontColor" value="${param.zimbraPrefHtmlEditorDefaultFontColor}"/>
            <zm:pref name="zimbraPrefComposeFormat" value="${param.zimbraPrefComposeFormat}"/>
            <zm:pref name="zimbraPrefForwardReplyInOriginalFormat" value="${param.zimbraPrefForwardReplyInOriginalFormat eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefReplyIncludeOriginalText" value="${param.zimbraPrefReplyIncludeOriginalText}"/>
            <zm:pref name="zimbraPrefForwardIncludeOriginalText" value="${param.zimbraPrefForwardIncludeOriginalText}"/>
            <zm:pref name="zimbraPrefForwardReplyPrefixChar" value="${param.zimbraPrefForwardReplyPrefixChar}"/>
            <zm:pref name="zimbraPrefSaveToSent" value="${param.zimbraPrefSaveToSent eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
        </c:when>
        <%-- SIGNATURES --%>
        <c:when test="${selected eq 'signatures'}">
            <zm:pref name="zimbraPrefMailSignatureStyle" value="${param.zimbraPrefMailSignatureStyle}"/>
            <zm:pref name="zimbraPrefMailSignatureEnabled" value="${param.zimbraPrefMailSignatureEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
        </c:when>
        <%-- ACCOUNTS --%>
        <c:when test="${selected eq 'accounts'}">
            <zm:pref name="zimbraPrefIdentityName" value="${param.zimbraPrefIdentityName}"/>
            <zm:pref name="zimbraPrefFromDisplay" value="${param.zimbraPrefFromDisplay}"/>
            <zm:pref name="zimbraPrefFromAddress" value="${param.zimbraPrefFromAddress}"/>
            <zm:pref name="zimbraPrefReplyToDisplay" value="${param.zimbraPrefReplyToDisplay}"/>
            <zm:pref name="zimbraPrefReplyToAddress" value="${param.zimbraPrefReplyToAddress}"/>
            <zm:pref name="zimbraPrefReplyToEnabled" value="${param.zimbraPrefReplyToEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefDefaultSignatureId" value="${param.zimbraPrefDefaultSignatureId}"/>            
        </c:when>
        <%-- ADDRESS BOOK --%>
        <c:when test="${selected eq 'addressbook'}">
            <zm:pref name="zimbraPrefAutoAddAddressEnabled" value="${param.zimbraPrefAutoAddAddressEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefContactsPerPage" value="${param.zimbraPrefContactsPerPage}"/>
        </c:when>
        <%-- CALENDAR --%>
        <c:when test="${selected eq 'calendar'}">
            <zm:pref name="zimbraPrefUseTimeZoneListInCalendar" value="${param.zimbraPrefUseTimeZoneListInCalendar eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefCalendarInitialView" value="${param.zimbraPrefCalendarInitialView}"/>
            <zm:pref name="zimbraPrefCalendarFirstdayOfWeek" value="${param.zimbraPrefCalendarFirstdayOfWeek}"/>
            <zm:pref name="zimbraPrefCalendarDayHourStart" value="${param.zimbraPrefCalendarDayHourStart}"/>
            <zm:pref name="zimbraPrefCalendarDayHourEnd" value="${param.zimbraPrefCalendarDayHourEnd}"/>
            <zm:pref name="zimbraPrefAppleIcalDelegationEnabled" value="${param.zimbraPrefAppleIcalDelegationEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
        </c:when>
    </c:choose>
</zm:modifyPrefs>

<c:if test="${selected eq 'signatures'}">
    <c:forEach var="i" begin="0" end="${param.numSignatures}">
        <c:set var="origSignatureNameKey" value="origSignatureName${i}"/>
        <c:set var="signatureNameKey" value="signatureName${i}"/>
        <c:set var="origSignatureValueKey" value="origSignatureValue${i}"/>
        <c:set var="signatureValueKey" value="signatureValue${i}"/>
        <c:set var="signatureTypeKey" value="signatureType${i}"/>
        <c:if test="${(param[origSignatureNameKey] ne param[signatureNameKey]) or
                (param[origSignatureValueKey] ne param[signtureValueKey])}">
            <c:set var="modSignatureWarning" value="${true}" scope="request"/>
            <c:choose>
                <c:when test="${empty param[signatureNameKey]}">
                    <app:status style="Warning"><fmt:message key="optionsNoSignatureName"/></app:status>
                </c:when>
                <c:when test="${empty param[signatureValueKey]}">
                    <app:status style="Warning"><fmt:message key="optionsNoSignatureValue"/></app:status>
                </c:when>
                <c:otherwise>
                    <c:set var="signatureIdKey" value="signatureId${i}"/>
                    <zm:modifySiganture id="${param[signatureIdKey]}"
                                        name="${param[signatureNameKey]}" value="${param[signatureValueKey]}" type="${param[signatureTypeKey]}"/>
                    <c:set var="signatureUpdated" value="${true}"/>
                    <c:set var="modSignatureWarning" value="${false}" scope="request"/>
                </c:otherwise>
            </c:choose>
        </c:if>
    </c:forEach>
</c:if>

<c:if test="${selected eq 'signatures' and not empty param.newSignature}">
    <c:set var="newSignatureWarning" value="${true}" scope="request"/>
    <c:choose>
        <c:when test="${empty param.newSignatureName}">
            <app:status style="Warning"><fmt:message key="optionsNoSignatureName"/></app:status>
        </c:when>
        <c:when test="${empty param.newSignatureValue}">
            <app:status style="Warning"><fmt:message key="optionsNoSignatureValue"/></app:status>
        </c:when>
        <c:otherwise>
            <zm:createSiganture var="sigId" name="${param.newSignatureName}" value="${param.newSignatureValue}" type="${param.newSignatureType}"/>
            <c:set var="updated" value="${true}"/>
            <c:set var="newSignatureWarning" value="${false}" scope="request"/>
        </c:otherwise>
    </c:choose>
</c:if>
<c:if test="${mailbox.features.skinChange and updated}">
    <c:remove var="skin" scope="session"/> <%-- remove old var so that new skin gets applied using skin.tag --%>    
</c:if>
<c:choose>
    <c:when test="${newSignatureWarning or modSignatureWarning}">
        <%-- do nothing --%>
    </c:when>
    <c:when test="${updated or signatureUpdated}">
        <zm:getMailbox var="mailbox" refreshaccount="${true}"/>
        <app:status><fmt:message key="optionsSaved"/></app:status>
    </c:when>
    <c:otherwise>
        <app:status><fmt:message key="noOptionsChanged"/></app:status>        
    </c:otherwise>
</c:choose>
</app:handleError>