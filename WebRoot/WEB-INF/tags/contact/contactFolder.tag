<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="icon" value="${folder.isMountPoint ? 'contacts/SharedContactsFolder.gif' : folder.isAutoContacts ? 'contacts/EmailedContacts.gif' : 'contacts/ContactsFolder.gif'}"/>
<fmt:message var="label" key="FOLDER_LABEL_${folder.id}"/>
<c:if test="${fn:startsWith(label,'???')}"><c:set var="label" value="${folder.name}"/></c:if>
<c:set var="padFudge" value="${folder.hasChildren ? 0 : 20}"/>
<tr>
    <td nowrap colspan=3 class='${folder.styleColor}${folder.styleColor ne 'Gray' ? 'Bg' :''} Folder<c:if test="${folder.hasUnread}"> Unread</c:if>'
        style='padding-left: ${padFudge + folder.depth*8}px'>
        <c:url var="url" value="/h/search">
            <c:param name="sfi" value="${folder.id}"/>
            <c:param name="st" value="contact"/>
        </c:url>

        <a href='${url}'>
            <app:img src="${icon}" alt='${fn:escapeXml(label)}'/>
            <span <c:if test="${folder.id eq requestScope.context.selectedId}"> class='ZhTISelected'</c:if>>
            ${fn:escapeXml(label)}
            </span>
        </a>
    </td>
</tr>

