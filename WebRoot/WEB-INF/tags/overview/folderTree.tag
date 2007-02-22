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

<div class=Tree>
    <table width=100% cellpadding=0 cellspacing=0>
        <tr>
            <c:url var="toggleUrl" value="/h/search">
                   <c:param name="${expanded ? 'collapse' : 'expand'}" value="folders"/>
               </c:url>
               <th style='width:20px'><a href="${toggleUrl}"><app:img altkey="${ expanded ? 'ALT_TREE_EXPANDED' : 'ALT_TREE_COLLAPSED'}" src="${ expanded ? 'dwt/NodeExpanded.gif' : 'dwt/NodeCollapsed.gif'}"/></a></th>
            <th class='Header'><fmt:message key="folders"/></th>
            <th width='1%' align='right'  class='ZhTreeEdit'>
                <c:choose>
                    <c:when test="${empty editmode}">
                        <c:url value="/h/mfolders" var="mfoldersUrl"/>
                        <a href="${mfoldersUrl}"><fmt:message key="TREE_EDIT"/> </a>
                    </c:when>
                    <c:otherwise>
                        &nbsp;
                    </c:otherwise>
                </c:choose>
            </th>
        </tr>

        <c:if test="${expanded}">
            <app:overviewFolder folder="${mailbox.inbox}" keys="${keys}" key="i"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.inbox.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.sent}" keys="${keys}" key="s"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.sent.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.drafts}" keys="${keys}" key="d"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.drafts.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.spam}" keys="${keys}" key="u"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.spam.id}" skipsystem="false"/>

            <app:overviewFolder folder="${mailbox.trash}" keys="${keys}" key="t"/>
            <app:doFolderTree skiproot="${true}" parentid="${mailbox.trash.id}" skipsystem="false"/>
        </c:if>
    </table>
    <c:if test="${expanded}">
        <table width=100% cellpadding=0 cellspacing=0 style='padding-top:5px'>
            <app:doFolderTree skiproot="${true}" skipsystem="${true}" skiptopsearch="${true}"/>
        </table>
    </c:if>
</div>
