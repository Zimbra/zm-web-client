<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="mid" rtexprvalue="true" required="true" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:currentResultUrl var="closeUrl" value="${urlTarget}" context="${context}"/>
<zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
<table class="x_toolbar" cellpadding="0" cellspacing="0">
    <tr>
        <td class="x_main_buttons">
            <c:if test="${context.st=='message' || context.st=='conversation'}">
                <c:url var="composeUrl" value="${urlTarget}?action=compose"/>
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
        </td>
        <td  align="right" class="x_sub_buttons">
            <table>
                <tr>
                    <td>
                        <a href="${fn:escapeXml(closeUrl)}#msg${mid}" class='zo_leftbutton'>
                            ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
                        </a>
                    </td>
                    <td>
                        <a class='zo_button' href="#action"><fmt:message key="MO_actions"/></a>

                    </td>
                    <td>
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
                    <td>
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
    </tr>
</table>
