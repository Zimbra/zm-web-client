<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<zm:currentResultUrl var="closeUrl" value="${urlTarget}" context="${context}"/>
<table class="x_toolbar" cellpadding="0" cellspacing="0">
    <tr>
        <td class="x_main_buttons">
            <c:if test="${uiv == '1'}">
                <c:if test="${context.st=='message' || context.st=='conversation'}">
                    <c:url var="composeUrl" value="${urlTarget}?action=compose"/>
                    <a href="${composeUrl}" class="zo_button">
                        <fmt:message key="compose"/>
                    </a>
                </c:if>
                <c:if test="${context.st=='contact'}">
                    <c:url var="composeUrl" value="${closeUrl}">
                        <c:param name="action" value="edit"/>
                    </c:url>
                    <a href="${composeUrl}" class="zo_button">
                        <fmt:message key="add"/>
                    </a>
                </c:if>
            </c:if>
            <c:if test="${uiv != '1'}">
                <a href="main" class='zo_leftbutton'><fmt:message key="MO_MAIN"/></a>
            </c:if>
        </td>
        <c:if test="${context.searchResult.size > 0 }">
        <td class="x_sub_buttons" align="right">
            <table>
                <tr>
                    <c:if test="${isTop == null || isTop}">
                    <td>
                        <a href="#action" class='zo_button'>
                            <fmt:message key="MO_actions"/>
                        </a>
                    </td>
                    </c:if>    
                    <c:choose>
                        <c:when test="${context.searchResult.hasPrevPage}">
                            <zm:prevResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
                            <td>
                                <a href="${fn:escapeXml(url)}" class='zo_button'>
                                    <fmt:message key="MO_PREV"/>
                                </a>
                            </td>
                        </c:when>
                        <c:otherwise>
                            <td>
                                <a class='zo_button_disabled'>
                                    <fmt:message key="MO_PREV"/>
                                </a>
                            </td>
                        </c:otherwise>
                    </c:choose>
                    <td>
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
                </tr>
            </table>
        </td>
        </c:if>    
    </tr>
</table>
