<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<mo:handleError>
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
</mo:handleError>

<mo:view mailbox="${mailbox}" title="${msg.subject}" context="${null}" scale="true">

    <table width=100% cellpadding="0" cellspacing="0" border=0>
        <tr>
            <td>
                <table width=100% cellspacing="0" cellpadding="0">
                    <tr class='zo_toolbar'>
                        <td><a href="${closeUrl}" class='zo_button'>
                            <fmt:message key="close"/>
                        </a></td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class='zo_appt_view'>
                <c:set var="extImageUrl" value=""/>
                <c:if test="${empty param.xim}">
                    <zm:currentResultUrl var="extImageUrl" id="${msg.id}" value="mosearch" action="view" context="${context}" xim="1"/>
                </c:if>
                <zm:currentResultUrl var="composeUrl" value="search" context="${context}"
                                     action="compose" paction="view" id="${msg.id}"/>
                <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
                <mo:displayMessage mailbox="${mailbox}" message="${msg}"externalImageUrl="${extImageUrl}" showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
            </td>
        </tr>
    </table>

</mo:view>
