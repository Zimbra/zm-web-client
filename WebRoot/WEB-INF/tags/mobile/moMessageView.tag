<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
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
<tr class="Stripes">
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
<zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}" mview="1"
                     action="view" id="${msg.id}"/>
<form id="actions" action="${fn:escapeXml(actionUrl)}" method="post">
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<input type="hidden" name="doMessageAction" value="1"/>
<script>document.write('<input name="moreActions" type="hidden" value="<fmt:message key="actionGo"/>"/>');</script>
<table width="100%" cellspacing="0" cellpadding="2">
<!--<tr>
    <td colspan="2">
        <hr size='1'/>
    </td>
</tr>-->
<tr class='zo_action'>
    <td colspan="2" class="Stripes">
        <div class="View">
        <table cellspacing="2" cellpadding="2" width="100%" border="0">
                    <tr class="zo_m_list_row">
                        <td><c:set var="inTrash" value="${zm:getFolder(pageContext, msg.folderId).isInTrash}"/>
                            <c:choose>
                                <c:when test="${inTrash}">
                                    <input name="actionHardDelete" type="submit" value="<fmt:message key="delete"/>"/>    
                                </c:when>
                                <c:otherwise>
                                    <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>
                                </c:otherwise>
                            </c:choose>
                            <%--<input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>--%>
                           <select name="anAction" onchange="document.getElementById('actions').submit();">
                               <option value="" selected="selected"><fmt:message key="moreActions"/></option>
                               <optgroup label="Mark">
                                   <c:if test="${msg.isUnread}">
                                        <option value="actionMarkRead">Read</option>
                                   </c:if>
                                   <c:if test="${not msg.isUnread}">
                                        <option value="actionMarkUnread">Unread</option>
                                   </c:if>
                               </optgroup>
                               <optgroup label="Flag">
                                   <c:if test="${not msg.isFlagged}">
                                    <option value="actionFlag">Add</option>
                                   </c:if>
                                   <c:if test="${msg.isFlagged}">
                                        <option value="actionUnflag">Remove</option>
                                   </c:if>
                              </optgroup>
                              <optgroup label="<fmt:message key="moveAction"/>">
                                <zm:forEachFolder var="folder">
                                    <c:if test="${folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                        <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                                    </c:if>
                                </zm:forEachFolder>
                              </optgroup>
                               <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                               <c:set var="tagsToAdd" value="${zm:getAvailableTags(pageContext,msg.tagIds,true)}"/>
                               <c:set var="tagsToRemove" value="${zm:getAvailableTags(pageContext,msg.tagIds,false)}"/>
                               <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                                <c:forEach var="atag" items="${tagsToAdd}">
                                <option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                                </c:forEach>
                               </optgroup>
                               <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                                <c:forEach var="atag" items="${tagsToRemove}">
                                <option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                                </c:forEach>
                               </optgroup>
                               </c:if>
                           </select>
                           <noscript><input name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
                        </td>
                    </tr>
                </table>
        </div>    
    </td>
</tr>
</table>
</form>
</td>
</tr>
</table>

</mo:view>
