<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getMessage var="msg" id="${not empty param.id ? param.id : context.currentItem.id}" markread="true"
                   neuterimages="${empty param.xim}"/>
    <%--zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/--%>
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

    <zm:currentResultUrl var="closeUrl" value="${context_url}" context="${context}"/>
</mo:handleError>

<mo:view mailbox="${mailbox}" title="${msg.subject}" context="${null}" scale="true">

<table width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
    <td>
            <%--<table width="100%" cellspacing="0" cellpadding="0">
                <tr class='zo_toolbar<c:out value="${pageContext.request.servletPath=='/m/main'?'1':''}"/>'>
                    <td>
                        <table cellspacing="0" cellpadding="0">
                            <tr>
                                <td>
                                    <a href="${fn:escapeXml(closeUrl)}#msg${msg.id}" class='zo_leftbutton'>
                                        ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
                                    </a>
                                </td>
                                <td>
                                    <c:choose>
                                        <c:when test="${cursor.hasPrev}">
                                            <zm:prevItemUrl var="prevMsgUrl" value="${context_url}" action='view'
                                                            cursor="${cursor}" context="${context}"/>
                                            <a class='zo_button' href="${fn:escapeXml(prevMsgUrl)}">
                                                <fmt:message key="MO_PREV"/>
                                            </a>
                                        </c:when>
                                        <c:otherwise>
                                            <a class='zo_button' style='color:gray'>
                                                <fmt:message key="MO_PREV"/>
                                            </a>
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                                <td>
                                    <c:choose>
                                        <c:when test="${cursor.hasNext}">
                                            <zm:nextItemUrl var="nextMsgUrl" value="${context_url}" action='view'
                                                            cursor="${cursor}" context="${context}"/>
                                            <a class='zo_button' href="${fn:escapeXml(nextMsgUrl)}">
                                                <fmt:message key="MO_NEXT"/>
                                            </a>
                                        </c:when>
                                        <c:otherwise>
                                            <a class='zo_button' style='color:gray'>
                                                <fmt:message key="MO_NEXT"/>
                                            </a>
                                        </c:otherwise>
                                    </c:choose>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>--%>
        <mo:msgToolbar mid="${msg.id}" urlTarget="${context_url}" context="${context}" keys="false"/>
    </td>
</tr>
<tr>
    <td class='zo_appt_view'>
        <c:set var="extImageUrl" value=""/>
        <c:if test="${empty param.xim}">
            <zm:currentResultUrl var="extImageUrl" id="${msg.id}" value="${context_url}" action="view"
                                 context="${context}" xim="1"/>
        </c:if>
        <zm:currentResultUrl var="composeUrl" value="${context_url}" context="${context}"
                             action="compose" paction="view" id="${msg.id}"/>
        <zm:currentResultUrl var="newWindowUrl" value="message" context="${context}" id="${msg.id}"/>
        <mo:displayMessage mailbox="${mailbox}" message="${msg}" externalImageUrl="${extImageUrl}"
                           showconvlink="true" composeUrl="${composeUrl}" newWindowUrl="${newWindowUrl}"/>
    </td>
</tr>
<tr>
<td>
<zm:currentResultUrl var="actionUrl" value="mosearch" context="${context}" mview="1"
                     action="view" id="${msg.id}"/>
<form id="action" action="${fn:escapeXml(actionUrl)}" method="post">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input type="hidden" name="doMessageAction" value="1"/>
<table width="100%" cellspacing="0" cellpadding="2">
<tr>
    <td colspan="2">
        <hr size='1'/>
    </td>
</tr>
<tr class='zo_action'>
    <td colspan="2">
        <table cellspacing="0" cellpadding="0">
            <tr>
                <td>
                    <c:choose>
                        <c:when test="${not msg.isUnread}">
                            <input name="actionMarkUnread" type="submit" value="<fmt:message key="actionMarkUnread"/>"/>
                        </c:when>
                        <c:otherwise>
                            <input name="actionMarkRead" type="submit" value="<fmt:message key="actionMarkRead"/>"/>
                        </c:otherwise>
                    </c:choose>
                </td>
                <td style='padding-left:5px'>
                    <c:choose>
                        <c:when test="${not msg.isFlagged}">
                            <input name="actionFlag" type="submit" value="<fmt:message key="actionAddFlag"/>"/>
                        </c:when>
                        <c:otherwise>
                            <input name="actionUnflag" type="submit" value="<fmt:message key="actionRemoveFlag"/>"/>
                        </c:otherwise>
                    </c:choose>
                </td>
            </tr>
        </table>
    </td>
</tr>
<tr>
    <td colspan="2">
        <hr size='1'/>
    </td>
</tr>
<tr class='zo_action'>
    <td colspan="2">
        <table cellspacing="0" cellpadding="0">
            <tr>
                <td>
                    <input name="actionMove" type="submit" value="<fmt:message key="actionMove"/>"/>
                </td>
                <td style='padding-left:5px'>
                    <select name="folderId">
                        <option value="" selected="selected"><fmt:message key="moveAction"/></option>
                        <zm:forEachFolder var="folder">
                            <c:if test="${folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                <option value="${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                            </c:if>
                        </zm:forEachFolder>
                    </select>
                </td>
            </tr>
        </table>
    </td>
</tr>
<c:if test="${mailbox.features.tagging and mailbox.hasTags}">
    <c:set var="tagsToAdd" value="${zm:getAvailableTags(pageContext,msg.tagIds,true)}"/>
    <c:set var="tagsToRemove" value="${zm:getAvailableTags(pageContext,msg.tagIds,false)}"/>
    <c:if test="${not empty tagsToAdd}">
        <tr>
            <td colspan="2">
                <hr size='1'/>
            </td>
        </tr>
        <tr class='zo_action'>
            <td colspan="2">
                <table cellspacing="0" cellpadding="0">
                    <tr>
                        <td>
                            <input name="actionAddTag" type="submit" value="<fmt:message key="MO_actionAddTag"/>"/>
                        </td>
                        <td style='padding-left:5px'>
                            <select name="tagId">
                                <c:forEach var="tag" items="${tagsToAdd}">
                                    <option value="${tag.id}">${fn:escapeXml(tag.name)}</option>
                                </c:forEach>
                            </select>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </c:if>
    <c:if test="${not empty tagsToRemove}">
        <tr>
            <td colspan="2">
                <hr size='1'/>
            </td>
        </tr>
        <tr class='zo_action'>
            <td colspan="2">
                <table cellspacing="0" cellpadding="0">
                    <tr>
                        <td>
                            <input name="actionRemoveTag" type="submit"
                                   value="<fmt:message key="MO_actionRemoveTag"/>"/>
                        </td>
                        <td style='padding-left:5px'>
                            <select name="tagRemoveId">
                                <c:forEach var="tag" items="${tagsToRemove}">
                                    <option value="${tag.id}">${fn:escapeXml(tag.name)}</option>
                                </c:forEach>
                            </select>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </c:if>
</c:if>
<tr>
    <td colspan="2">
        <hr size='1'/>
    </td>
</tr>
<tr class='zo_action'>
    <td colspan="2">
        <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>
    </td>
</tr>
<c:if test="${uiv!='1'}">
    <tr>
        <td colspan="2">
            <hr size='1'/>
        </td>
    </tr>
</c:if>
</table>
</form>
</td>
</tr>
</table>

</mo:view>
