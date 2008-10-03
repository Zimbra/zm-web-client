<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:currentResultUrl var="closeUrl" value="${urlTarget}" context="${context}"/>

<table class="ToolbarBg" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td align="left" class="Padding">
    <table cellpadding="0" cellspacing="0" border="0">
        <tr>
            <c:url var="editUrl" value="${closeUrl}">
                <c:param name="action" value="edit"/>
                <c:param name="id" value="${contact.id}"/>
                <c:param name="pid" value="${contact.id}"/>
            </c:url>
            <a href="${editUrl}" id="_edit_link" style="display:none;visibility:hidden;">
                <fmt:message key="edit"/>
            </a>
            <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}"
                                    index="${context.currentItemIndex}"/>
            <td class="Padding">
                <c:choose>
                    <c:when test="${cursor.hasPrev}">
                        <zm:prevItemUrl var="prevMsgUrl" value="${urlTarget}" action='view'
                                        cursor="${cursor}" context="${context}"/>
                        <a href="${fn:escapeXml(prevMsgUrl)}" class='zo_button'>
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
                        <a href="${fn:escapeXml(nextMsgUrl)}" class='zo_button'>
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
    <select name="anAction" onchange="document.getElementById('actions').submit();">
        <option value="" selected="selected"><fmt:message key="moreActions"/></option>
        <c:choose>
            <c:when test="${not context.folder.isInTrash}">
                <option name="actionDelete"><fmt:message key="delete"/></option>
            </c:when>
            <c:otherwise>
                <option name="actionHardDelete"><fmt:message key="delete"/></option>
            </c:otherwise>
        </c:choose>
        <optgroup label="Flag">
            <c:if test="${not contact.isFlagged}">
                <option value="actionFlag"><fmt:message key="add"/></option>
            </c:if>
            <c:if test="${contact.isFlagged}">
                <option value="actionUnflag"><fmt:message key="remove"/></option>
            </c:if>
        </optgroup>
        <optgroup label="<fmt:message key="moveAction"/>">
            <zm:forEachFolder var="folder">
                <c:if test="${folder.id != context.folder.id and folder.isContactMoveTarget and !folder.isTrash and !folder.isSpam}">
                    <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                </c:if>
            </zm:forEachFolder>
        </optgroup>
        <%-- <zm:forEachFolder var="folder">
            <input type="hidden" name="folderId" value="${folder.id}"/>
        </zm:forEachFolder>--%>
        <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
            <c:set var="tagsToAdd"
                   value="${zm:getAvailableTags(pageContext,contact.tagIds,true)}"/>
            <c:set var="tagsToRemove"
                   value="${zm:getAvailableTags(pageContext,contact.tagIds,false)}"/>

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
    <noscript><input name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/>
    </noscript>
</td>

<td align="right" class="Padding">
       <c:url var="addUrl" value="${closeUrl}">
            <c:param name="action" value="edit"/>
            <c:param name="pid" value="${contact.id}"/>
            <c:param name="folderid" value="${context.folder.id}"/>
        </c:url>
        <a href="${addUrl}" class='zo_button'>
            <fmt:message key="add"/>
        </a>
</td>
</tr>
</table>
<c:if test="${isTop}">
    <div style="padding:5px;background:#efefef;font-size:small;">
        <a href="${fn:escapeXml(closeUrl)}#cn${contact.id}" class='zo_leftbutton'>
             ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
        </a>
    </div>
</c:if>  
