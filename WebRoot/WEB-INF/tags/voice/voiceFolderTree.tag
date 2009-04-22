<%@ tag body-content="empty" %>
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<zm:getMailbox var="mailbox"/>

<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.contacts ne 'collapse'}"/>

<div class=Tree>
    <table width=100% cellpadding=0 cellspacing=0>
        <c:set var="firstAccount" value="true"/>
        <zm:forEachPhoneAccount var="account">
            <c:set var="query" value="phone:${account.phone.name}"/>
            <tr>
                <c:url var="toggleUrl" value="/h/search">
                    <c:param name="st" value="voicemail"/>
                    <c:param name="sq" value="${query}"/>
                </c:url>
                <th class='Header'><a href="${toggleUrl}">${account.phone.display}</a></th>
            </tr>
            <c:set var="expanded" value="${(fn:indexOf(param.sq, query) ne -1) or ((fn:indexOf(param.sq, 'phone:') eq -1) and firstAccount eq 'true')}"/>
            <c:if test="${expanded}">
                <app:doVoiceFolderTree parentfolder="${account.rootFolder}" skiproot="${true}" skipsystem="true" />
            </c:if>
            <c:set var="firstAccount" value="false"/>
        </zm:forEachPhoneAccount>
    </table>

</div>
