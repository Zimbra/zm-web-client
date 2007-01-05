<%@ tag body-content="empty" %>
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
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
            <c:if test="${mailbox.features.skinChange}">
                <zm:pref name="zimbraPrefSkin" value="${param.zimbraPrefSkin}"/>
            </c:if>
        </c:when>
        <%-- MAIL --%>
        <c:when test="${selected eq 'mail'}">
            <c:if test="${mailbox.features.conversations}">
                <zm:pref name="zimbraPrefGroupMailBy" value="${param.zimbraPrefGroupMailBy}"/>
            </c:if>
            <zm:pref name="zimbraPrefMailItemsPerPage" value="${param.zimbraPrefMailItemsPerPage}"/>
            <zm:pref name="zimbraPrefShowFragments" value="${param.zimbraPrefShowFragments eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <c:if test="${mailbox.features.initialSearchPreference}">
                <zm:pref name="zimbraPrefMailInitialSearch" value="${param.zimbraPrefMailInitialSearch}"/>
            </c:if>

            <zm:pref name="zimbraPrefSaveToSent" value="${param.zimbraPrefSaveToSent eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>

            <c:if test="${mailbox.features.outOfOfficeReply}">
                <zm:pref name="zimbraPrefOutOfOfficeReplyEnabled" value="${param.zimbraPrefOutOfOfficeReplyEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
                <zm:pref name="zimbraPrefOutOfOfficeReply" value="${param.zimbraPrefOutOfOfficeReply}"/>
            </c:if>

            <c:if test="${mailbox.features.newMailNotification}">
                <zm:pref name="zimbraPrefNewMailNotificationEnabled" value="${param.zimbraPrefNewMailNotificationEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
                <zm:pref name="zimbraPrefNewMailNotificationAddress" value="${param.zimbraPrefNewMailNotificationAddress}"/>
            </c:if>

            <c:if test="${mailbox.features.mailForwarding}">
                <zm:pref name="zimbraPrefMailForwardingAddress" value="${param.zimbraPrefMailForwardingAddress}"/>
                <zm:pref name="zimbraPrefMailLocalDeliveryDisabled" value="${param.zimbraPrefMailLocalDeliveryDisabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            </c:if>

            <zm:pref name="zimbraPrefMessageViewHtmlPreferred" value="${param.zimbraPrefMessageViewHtmlPreferred eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefDedupeMessagesSentToSelf" value="${param.zimbraPrefDedupeMessagesSentToSelf}"/>
        </c:when>
        <%-- MAIL IDENTITY --%>
        <c:when test="${selected eq 'identity'}">
            <zm:pref name="zimbraPrefFromDisplay" value="${param.zimbraPrefFromDisplay}"/>
            <zm:pref name="zimbraPrefFromAddress" value="${param.zimbraPrefFromAddress}"/>
            <zm:pref name="zimbraPrefReplyToDisplay" value="${param.zimbraPrefReplyToDisplay}"/>
            <zm:pref name="zimbraPrefReplyToAddress" value="${param.zimbraPrefReplyToAddress}"/>
            <zm:pref name="zimbraPrefReplyToEnabled" value="${param.zimbraPrefReplyToEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefMailSignature" value="${param.zimbraPrefMailSignature}"/>            
            <zm:pref name="zimbraPrefMailSignatureStyle" value="${param.zimbraPrefMailSignatureStyle}"/>
            <zm:pref name="zimbraPrefMailSignatureEnabled" value="${param.zimbraPrefMailSignatureEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefReplyIncludeOriginalText" value="${param.zimbraPrefReplyIncludeOriginalText}"/>
            <zm:pref name="zimbraPrefForwardIncludeOriginalText" value="${param.zimbraPrefForwardIncludeOriginalText}"/>
            <zm:pref name="zimbraPrefForwardReplyPrefixChar" value="${param.zimbraPrefForwardReplyPrefixChar}"/>
        </c:when>
        <%-- ADDRESS BOOK --%>
        <c:when test="${selected eq 'addressbook'}">
            <zm:pref name="zimbraPrefAutoAddAddressEnabled" value="${param.zimbraPrefAutoAddAddressEnabled eq 'TRUE' ? 'TRUE' : 'FALSE'}"/>
            <zm:pref name="zimbraPrefContactsPerPage" value="${param.zimbraPrefContactsPerPage}"/>
        </c:when>
    </c:choose>
</zm:modifyPrefs>

<c:choose>
    <c:when test="${updated}">
        <zm:getMailbox var="mailbox" refreshaccount="${true}"/>
        <app:status><fmt:message key="optionsSaved"/></app:status>
    </c:when>
    <c:otherwise>
        <app:status><fmt:message key="noOptionsChanged"/></app:status>        
    </c:otherwise>
</c:choose>
</app:handleError>