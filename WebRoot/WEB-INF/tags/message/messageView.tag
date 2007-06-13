<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true" neuterimages="${empty param.xim}"/>
    <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
    <c:set var="ads" value='${msg.subject} ${msg.fragment}'/>

    <%-- blah, optimize this later --%>
    <c:if test="${not empty requestScope.idsMarkedUnread and not msg.isUnread}">
        <c:forEach var="unreadid" items="${requestScope.idsMarkedUnread}">
            <c:if test="${unreadid eq msg.id}">
                <zm:markMessageRead var="mmrresult" id="${msg.id}" read="${false}"/>
                <c:set var="leaveunread" value="${true}"/>
            </c:if>
        </c:forEach>
    </c:if>
</app:handleError>

<app:view title="${msg.subject}" context="${context}" selected='mail' folders="true" tags="true" searches="true" ads="${initParam.zimbraShowAds != 0 ? ads : ''}" keys="true">
    <zm:currentResultUrl var="currentUrl" value="" action="view" context="${context}"/>
    <form action="${currentUrl}" method="post">

        <table width=100% cellpadding="0" cellspacing="0">
            <tr>
                <td class='TbTop'>
                    <app:messageViewToolbar context="${context}" cursor="${cursor}" keys="true"/>
                </td>
            </tr>
            <tr>
                <td class='ZhAppContent'>
                        <c:set var="extImageUrl" value=""/>
                        <c:if test="${empty param.xim}">
                            <zm:currentResultUrl var="extImageUrl" value="search" action="view" context="${context}" xim="1"/>
                        </c:if>
                        <zm:currentResultUrl var="composeUrl" value="search" context="${context}"
                                             action="compose" paction="view" id="${msg.id}"/>
                        <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
                        <app:displayMessage mailbox="${mailbox}" message="${msg}"externalImageUrl="${extImageUrl}" showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
                </td>
            </tr>
            <tr>
                <td class='TbBottom'>
                    <app:messageViewToolbar context="${context}" cursor="${cursor}" keys="false"/>
                </td>
            </tr>
        </table>
        <input type="hidden" name="id" value="${msg.id}"/>
        <input type="hidden" name="doMessageAction" value="1"/>
    </form>
</app:view>
