<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table cellpadding="0" cellspacing="0">
    <tr class='Tabs'>
        <td class='TabSpacer'/>
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='general' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/options?selected=general"/>">
                <span><fmt:message key="general"/></span>
            </a>
        </td>
        <c:if test="${mailbox.features.mail}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='mail' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=mail"/>">
                    <span><fmt:message key="mail"/></span></a>
            </td>
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='composing' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=composing"/>">
                    <span><fmt:message key="optionsComposing"/></span></a>
            </td>
        <c:set var="maxSigs" value="${mailbox.accountInfo.attrs.zimbraSignatureMaxNumEntries[0]}"/>
        <c:if test="${maxSigs ne 0}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='signatures' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=signatures"/>">
                    <span><fmt:message key="optionsSignatures"/></span></a>
            </td>
        </c:if>
        </c:if>
        <c:if test="${mailbox.features.voice}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='voice' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=voice"/>">
                    <span><fmt:message key="callManager"/></span></a>
            </td>
        </c:if>
        <c:if test="${mailbox.features.contacts}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='addressbook' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=addressbook"/>">
                    <span><fmt:message key="addressBook"/></span></a>
            </td>
        </c:if>
        <c:if test="${mailbox.features.calendar}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='calendar' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=calendar"/>">
                    <span><fmt:message key="calendar"/></span></a>
            </td>
        </c:if>
        <c:if test="${mailbox.features.mail}">
        <td class='TabSpacer'/>
        <td class='Tab ${selected=='accounts' ? 'TabSelected' :'TabNormal'}'>
            <a href="<c:url value="/h/options?selected=accounts"/>">
                <span><fmt:message key="optionsAccounts"/></span></a>
        </td>
        </c:if>
        <c:if test="${mailbox.features.filters and mailbox.features.mail}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='filter' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=filter"/>">
                    <span><fmt:message key="mailFilters"/></span></a>
            </td>
        </c:if>
        <c:if test="${mailbox.prefs.useKeyboardShortcuts}">
            <td class='TabSpacer'/>
            <td class='Tab ${selected=='shortcuts' ? 'TabSelected' :'TabNormal'}'>
                <a href="<c:url value="/h/options?selected=shortcuts"/>">
                    <span><fmt:message key="shortcuts"/></span></a>
            </td>
        </c:if>
        <td class='TabFiller'>
            &nbsp;
        </td>
    </tr>
</table>