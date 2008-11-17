<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="base" rtexprvalue="true" required="false" %>
<%@ attribute name="types" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="label" value="${zm:getFolderPath(pageContext, folder.id)}"/>
<c:url var="url" value="${empty base ? 'zmain' : base}">
    <c:param name="sfi" value="${folder.id}"/>
    <c:if test="${!empty types}"><c:param name="st" value="${types}"/></c:if>
</c:url>
<div class='Folders list-row${folder.hasUnread ? '-unread' : ''}'>
    <c:if test="${types eq 'cal'}">
    <input type="checkbox" onchange="document.location.href='?${folder.isCheckedInUI ? 'un' : ''}check=${folder.id}&st=cals';" value="${folder.id}" name="calid" ${folder.isCheckedInUI ? 'checked=checked':''}>
    </c:if>
    <span onclick='zClickLink("FLDR${folder.id}")'>
        <a id="FLDR${folder.id}" href="${fn:escapeXml(url)}">
            <span class="SmlIcnHldr Fldr${folder.type}">&nbsp;</span>
            ${fn:escapeXml(label)}
            <c:if test="${folder.hasUnread}">&nbsp;(${folder.unreadCount})</c:if>
        </a>
    </span>
</div>
