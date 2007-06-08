<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <app:searchTitle var="title" context="${context}"/>
    <c:set var="useTo" value="${context.folder.isSent or context.folder.isDrafts}"/>
</app:handleError>
<app:view mailbox="${mailbox}" title="${title}" selected='voice' voice="true" folders="false" tags="false" searches="false" context="${context}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="/h/search" context="${context}"/>
    <table width=100% cellpadding="0" cellspacing="0">
        <tr>
            <td class='TbTop'>
                <app:callListViewToolbar context="${context}" keys="true"/>
            </td>
        </tr>
        <tr>
            <td class='List'>
                    <table width=100% cellpadding=2 cellspacing=0>
                        <tr class='Header'>
                            <th width=20% nowrap><fmt:message key="${useTo ? 'to' : 'from'}"/>
                            <th width=20% nowrap><fmt:message key="duration"/></th>
                            <th nowrap>
                                <zm:newSortUrl var="dateSortUrl" value="/h/search" context="${context}" sort="${(context.ss eq 'dateDesc' or empty context.ss) ? 'dateAsc' : 'dateDesc'}"/>
                                <a href="${dateSortUrl}">
                                    <fmt:message key="received"/>
                                </a>
                            </th>
                        </tr>

                        <c:forEach items="${context.searchResult.hits}" var="hit" varStatus="status">
                        <tr>
                            <td nowrap>${hit.callHit.displayCaller}</td>
                            <td nowrap>${fn:escapeXml(zm:displayDuration(pageContext, hit.callHit.duration))}</td>
                            <td nowrap>${fn:escapeXml(zm:displayMsgDate(pageContext, hit.callHit.date))}</td>
                        </tr>
                        </c:forEach>
                    </table>
                    <c:if test="${context.searchResult.size == 0}">
                        <div class='NoResults'><fmt:message key="noResultsFound"/></div>
                    </c:if>
            </td>
        </tr>
        <tr>
            <td class='TbBottom'>
                <app:callListViewToolbar context="${context}" keys="false"/>
            </td>
        </tr>
    </table>
</app:view>
