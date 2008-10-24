<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:currentResultUrl var="closeUrl" value="${urlTarget}" context="${context}"/>
<table class="ToolbarBg" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td align="left" class="Padding">
<table border="0" cellpadding="0" cellspacing="0">
<tr>
<c:if test="${isTop == null || isTop || uiv != '1'}">
    <td class="Padding">
        <c:if test="${uiv != '1'}">
            <a href="main" class='zo_leftbutton'>
                <fmt:message key="MO_MAIN"/>
            </a>
        </c:if>
     </td>
</c:if>
<c:choose>
    <c:when test="${context.searchResult.hasPrevPage}">
        <zm:prevResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
        <td class="Padding">
            <a href="${fn:escapeXml(url)}" class='zo_button'>
                <fmt:message key="MO_PREV"/>
            </a>
        </td>
    </c:when>
    <c:otherwise>
        <td class="Padding">
            <a class='zo_button_disabled'>
                <fmt:message key="MO_PREV"/>
            </a>
        </td>
    </c:otherwise>
</c:choose>
<td class="Padding">
    <c:choose>
        <c:when test="${context.searchResult.hasNextPage}">
            <zm:nextResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
            <a class='zo_button' href="${fn:escapeXml(url)}">
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
<c:if test="${uiv == '1' && context.searchResult.size gt 0}">
    <td>
        <select name="anAction" onchange="document.getElementById('actions').submit();">
            <option value="" selected="selected"><fmt:message key="moreActions"/></option>
            <%--<optgroup label="<fmt:message key="delete"/>">--%>
                <c:choose>
                    <c:when test="${not context.folder.isInTrash}">
                        <option value="actionDelete"><fmt:message key="delete"/></option>
                    </c:when>
                    <c:otherwise>
                        <option value="actionHardDelete"><fmt:message key="delete"/></option>
                    </c:otherwise>
                </c:choose>
            <!--</optgroup>-->
            <c:if test="${!context.isContactSearch}">
                <optgroup label="Mark">
                    <option value="actionMarkRead">Read</option>
                    <option value="actionMarkUnread">Unread</option>
                    <c:choose>
                        <c:when test="${context.folder.isSpam}">
                            <option value="actionMarkUnspam"><fmt:message key="actionNotSpam"/></option>
                        </c:when>
                        <c:otherwise>
                            <option value="actionMarkSpam"><fmt:message key="actionSpam"/></option>
                        </c:otherwise>
                    </c:choose>
                </optgroup>
            </c:if>

            <optgroup label="Flag">
                <option value="actionFlag"> <fmt:message key="add"/></option>
                <option value="actionUnflag"> <fmt:message key="remove"/></option>
            </optgroup>

            <optgroup label="<fmt:message key="moveAction"/>">
                <c:choose>
                    <c:when test="${context.isContactSearch}">
                        <zm:forEachFolder var="folder">
                            <c:if test="${folder.id != context.folder.id and folder.isContactMoveTarget and !folder.isTrash and !folder.isSpam}">
                                <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                            </c:if>
                        </zm:forEachFolder>
                    </c:when>
                    <c:otherwise>
                        <zm:forEachFolder var="folder">
                            <c:if test="${folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                            </c:if>
                        </zm:forEachFolder>
                    </c:otherwise>
                </c:choose>
            </optgroup>
             <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                <c:set var="allTags" value="${mailbox.mailbox.allTags}"/>
                <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                    <c:forEach var="atag" items="${allTags}">
                        <option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                    </c:forEach>
                </optgroup>
                <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                    <c:forEach var="atag" items="${allTags}">
                        <option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                    </c:forEach>
                </optgroup>
            </c:if>
        </select>
        <noscript><input name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
    </td>
</c:if>
</tr>
</table>
</td>
<td class="Padding" align="right">
    <c:if test="${uiv == '1'}">
        <c:if test="${context.st=='message' || context.st=='conversation'}">
            <c:url var="composeUrl" value="${urlTarget}?st=newmail"/>
            <a href="${composeUrl}" class="zo_button">
                <fmt:message key="compose"/>
            </a>
        </c:if>
        <c:if test="${context.st=='contact'}">
            <c:url var="composeUrl" value="${closeUrl}">
                <c:param name="action" value="edit"/>
                <c:param name="folderid" value="${context.folder.id}"/>
            </c:url>
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
        <c:choose>
            <c:when test="${context.isContactSearch}">
                <a href="${context_url}?st=ab"><fmt:message key="addressBooks"/></a> &#171; ${context.shortBackTo}
            </c:when>
            <c:otherwise>
                <a href="${context_url}?st=folders"><fmt:message key="folders"/></a> &#171; ${context.shortBackTo}
            </c:otherwise>
        </c:choose>
    </div>
</c:if>
