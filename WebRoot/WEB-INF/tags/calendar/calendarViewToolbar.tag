<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<c:if test="${empty requestScope.calViewToolbarCache}">
    <zm:getMailbox var="mailbox"/>
    <c:set var="calViewToolbarCache" scope="request">
        <input class='tbButton' type="submit" name="actionMonthView" value="<fmt:message key="month"/>">
    </c:set>
</c:if>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td align=left class=TbBt>
            <zm:currentResultUrl var="refreshUrl" value="/h/calendar" context="${context}" refresh="true" />
            <a href="${refreshUrl}" <c:if test="${keys}">accesskey="r"</c:if>><fmt:message key="refresh"/></a>
            ${requestScope.calViewToolbarCache}
        </td>
        <td align=right>
            <app:searchPageLeft keys="${keys}" urlTarget="/h/search" context="${context}"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" urlTarget="/h/search" context="${context}"/>
        </td>
    </tr>
</table>
