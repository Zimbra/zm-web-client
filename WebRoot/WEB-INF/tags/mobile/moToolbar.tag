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

<table cellpadding="0" cellspacing="0" border="0" class="ToolbarBg" width="100%">
    <tr>
        <%--<c:if test="${context.searchResult.size > 0 }">--%>
        <td align="left" class="Padding">
            <table border="0">
                <tr>
                    <c:if test="${isTop == null || isTop || uiv != '1'}">
                    <td class="Padding">
                        <c:if test="${uiv != '1'}">
                            <a href="main" class='zo_leftbutton'>
                                <fmt:message key="MO_MAIN"/> 
                            </a>
                        </c:if>
                        <c:if test="${uiv == '1'}">
                        <a href="#action" class='zo_button'>
                            <fmt:message key="MO_actions"/>
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
                </tr>
            </table>
        </td>
        <%--</c:if>--%>
        <td class="Padding" align="right">
            <c:if test="${uiv != '1' && isTop != null && isTop}">
                <a href="#action" class='zo_button'>
                    <fmt:message key="MO_actions"/>
                </a>
            </c:if>
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
        </td>
    </tr>
</table>
