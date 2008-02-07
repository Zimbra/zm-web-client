<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ attribute name="base" rtexprvalue="true" required="false" %>
<%@ attribute name="types" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="label" value="${zm:getFolderName(pageContext, folder.id)}"/>
<c:url var="url" value="${empty base ? 'mosearch' : base}">
    <c:param name="sfi" value="${folder.id}"/>
    <c:if test="${!empty types}"><c:param name="st" value="${types}"/></c:if>
</c:url>
<tr onclick='zClickLink("FLDR${folder.id}")'>
    <td class='zo_fldr${folder.hasUnread ? ' zo_unread':''}' style='padding-left: ${8+folder.depth*8}px'>
        <a id="FLDR${folder.id}" href="${fn:escapeXml(url)}">
            <mo:img src="${folder.image}" alt="${fn:escapeXml(folder.name)}"/>
            <span>${fn:escapeXml(label)}
            <c:if test="${folder.hasUnread}">&nbsp;(${folder.unreadCount})</c:if></span>
        </a>
    </td>
</tr>
