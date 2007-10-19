<%@ tag body-content="empty" %>
<%@ attribute name="editmode" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>

<zm:getMailbox var="mailbox"/>
<jsp:useBean id="expanded" scope="session" class="java.util.HashMap" />
<c:set var="expanded" value="${sessionScope.expanded.folders ne 'collapse'}"/>

<div class="Tree">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr class="TreeHeaderRow">
            <c:url var="toggleUrl" value="/h/search">
                   <c:param name="${expanded ? 'collapse' : 'expand'}" value="folders"/>
               </c:url>
               <th style="width:20px"><a href="${toggleUrl}"><app:img altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}" src="${ expanded ? 'startup/ImgNodeExpanded.gif' : 'startup/ImgNodeCollapsed.gif'}"/></a></th>
            <th class="Header"><fmt:message key="folders"/></th>
            <th width="1%" align="right"  class="ZhTreeEdit">
                <c:url value="/h/mfolders" var="mfoldersUrl">
                        <c:if test="${not empty param.sfi}">
                            <c:param name="sfi" value="${param.sfi}"/>
                        </c:if>
                </c:url>
                <a id="MFOLDERS" href="${mfoldersUrl}"><fmt:message key="TREE_EDIT"/> </a>
            </th>
        </tr>
 
        <c:if test="${expanded}">
            <app:overviewFolder folder="${mailbox.inbox}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.inbox.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.sent}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.sent.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.drafts}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.drafts.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.spam}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.spam.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.trash}" keys="${keys}"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.trash.id}" skipsystem="false"/>
        </c:if>
    </table>
    <c:if test="${expanded}">
        <app:doFolderTree skiproot="${true}" skipsystem="${true}" skiptopsearch="${true}" table="true"/>
    </c:if>
</div>
