<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="cid" rtexprvalue="true" required="true" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:currentResultUrl var="closeUrl" value="${urlTarget}" context="${context}"/>


<table cellpadding="0" cellspacing="0" class="ToolbarBg" border="0" width="100%">
    <tr>
        <td align="left" class="Padding">
            <table>
                <tr>
                    <td class="Padding">
                        <a href="${fn:escapeXml(closeUrl)}#cn${cid}" class='zo_leftbutton'>
                            <fmt:message key="close"/>
                        </a></td>
                    <td class="Padding">
                        <c:url var="editUrl" value="${closeUrl}">
                            <c:param name="action" value="edit"/>
                            <c:param name="id" value="${cid}"/>
                            <c:param name="pid" value="${cid}"/>
                        </c:url>
                        <a href="${editUrl}" id="_edit_link" style="display:none;visibility:hidden;">
                            <fmt:message key="edit"/>
                        </a>
                        <c:if test="${uiv == '1'}">
                        <a href="#action" class='zo_button'><fmt:message key="MO_actions"/> </a>
                        </c:if>    
                    </td>
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
        <td class="Padding" align="right">
                    <c:if test="${context.st=='message' || context.st=='conversation'}">
                        <c:url var="composeUrl" value="${urlTarget}?action=compose"/>
                        <a href="${composeUrl}" class='zo_button'>
                            <fmt:message key="compose"/>
                        </a>
                    </c:if>
                    <c:if test="${context.st=='contact'}">
                        <c:url var="addUrl" value="${closeUrl}">
                            <c:param name="action" value="edit"/>
                            <c:param name="pid" value="${cid}"/>
                        </c:url>
                        <a href="${addUrl}" class='zo_button'>
                            <fmt:message key="add"/>
                        </a>
                    </c:if>
                </td>
    </tr>
</table>
