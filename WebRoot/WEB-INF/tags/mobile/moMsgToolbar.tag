<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="mid" rtexprvalue="true" required="true" %>
<%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ attribute name="msg" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:currentResultUrl var="closeUrl" value="${urlTarget}" context="${context}"/>
<zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>

<%--
<c:if test="${!isTop}">
<div style="padding:5px;background:#efefef;font-size:small;">

    <a href="${fn:escapeXml(closeUrl)}#msg${mid}" class='zo_leftbutton'>
            ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
    </a>
</div>
</c:if>
--%>

<table class="ToolbarBg" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
        <td  align="left" class="Padding">
            <table>
                <tr>
                      <td class="Padding">
                        <c:choose>
                            <c:when test="${cursor.hasPrev}">
                                <zm:prevItemUrl var="prevMsgUrl" value="${urlTarget}" action='view'
                                                cursor="${cursor}" context="${context}"/>
                                <a class='zo_button' href="${fn:escapeXml(prevMsgUrl)}">
                                    <fmt:message key="MO_PREV"/>
                                </a>
                            </c:when>
                            <c:otherwise>
                                <a class='zo_button_disabled'>
                                    <fmt:message key="MO_PREV"/>
                                </a>
                            </c:otherwise>
                        </c:choose>
                    </td>
                    <td class="Padding">
                        <c:choose>
                            <c:when test="${cursor.hasNext}">
                                <zm:nextItemUrl var="nextMsgUrl" value="${urlTarget}" action='view'
                                                cursor="${cursor}" context="${context}"/>
                                <a class='zo_button' href="${fn:escapeXml(nextMsgUrl)}">
                                    <fmt:message key="MO_NEXT"/>
                                </a>
                            </c:when>
                            <c:otherwise>
                                <a class='zo_button_disabled'>
                                    <fmt:message key="MO_NEXT"/>
                                </a>
                            </c:otherwise>
                        </c:choose>
                    </td>
                </tr>
            </table>
        </td>

           <td>

                        <c:set var="inTrash" value="${zm:getFolder(pageContext, msg.folderId).isInTrash}"/>

                            <select name="anAction" onchange="document.getElementById('actions').submit();">
                               <option value="" selected="selected"><fmt:message key="moreActions"/></option>
                                <c:choose>
                                    <c:when test="${inTrash}">
                                        <option name="actionHardDelete"><fmt:message key="delete"/></option>
                                    </c:when>
                                    <c:otherwise>
                                        <option name="actionDelete"><fmt:message key="delete"/></option>
                                    </c:otherwise>
                                </c:choose>
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
        
        <td class="Padding" align="right">
            <%--<c:if test="${uiv != '1' && isTop != null && isTop}">
                <a href="#action" class='zo_button'>
                    <fmt:message key="MO_actions"/>
                </a>
            </c:if>--%>
    <c:if test="${uiv == '1'}">
            <c:if test="${context.st=='message' || context.st=='conversation'}">
                <c:url var="composeUrl" value="${urlTarget}?st=newmail"/>
                <a href="${composeUrl}" class="zo_button">
                    <fmt:message key="compose"/>
                </a>
            </c:if>
            <c:if test="${context.st=='contact'}">
                <c:url var="composeUrl" value="${urlTarget}?action=add"/>
                <a href="${composeUrl}" class="zo_button">
                    <fmt:message key="add"/>
                </a>
            </c:if>
       </c:if> 
        </td>
    </tr>
</table>

<c:if test="${isTop}">
<div class="SubToolbar">
    <a href="${context_url}?st=folders"><fmt:message key="folders"/></a> &#171; <a href="${fn:escapeXml(closeUrl)}#msg${cid}" class='zo_leftbutton'>
                ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
    </a>
     &#171; ${fn:escapeXml(fn:substring(msg.subject,0,8))}...
</div>
</c:if>
