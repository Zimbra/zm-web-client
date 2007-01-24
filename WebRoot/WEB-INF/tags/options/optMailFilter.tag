<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<app:handleError>
    <c:set var="rules" value="${empty param.ruleName ? mailbox.filterRulesReload : mailbox.filterRules}"/>
    <c:forEach items="${rules}" var="rule" varStatus="status">
        <c:if test="${rule.name eq param.ruleName or status.first}">
            <c:set var="selectedRule" value="${rule}"/>
        </c:if>
    </c:forEach>
</app:handleError>

<table border="0" cellpadding="0" cellspacing="4" width=100%>
    <tbody>
        <tr>
            <td width=200 class='List' valign='top'>
                <table width=100% cellpadding=2 cellspacing=0>
                    <tr>
                        <th width=1% nowrap>&nbsp;
                        <th width=1% nowrap><fmt:message key="active"/>
                        <th width=1% nowrap>&nbsp;
                        <th nowrap><fmt:message key="filterName"/>
                    </tr>
                    <c:forEach items="${rules}" var="rule" varStatus="status">
                        <tr <c:if test="${selectedRule.name eq rule.name}">class='RowSelected'</c:if>>
                            <td width=1% nowrap>&nbsp;</td>
                            <td width=1% nowrap><input type=checkbox  name="active" value="${rule.name}" <c:if test="${rule.active}">CHECKED </c:if>></td>
                            <td width=1% nowrap>&nbsp;</td>                            
                            <td >
                            <c:url var="selectRuleUrl" value="/h/options?selected=filter">
                                <c:param name="ruleName" value="${rule.name}"/>
                            </c:url>
                                <a href="${selectRuleUrl}">
                                        ${fn:escapeXml(rule.name)}
                                    </a>
                            </td>
                        </tr>
                    </c:forEach>
                    <c:if test="${empty rules}">
                        <tr>
                            <td colspan="4">
                                <div class='NoResults'><fmt:message key="noFilterRules"/></div>
                            </td>
                        </tr>
                    </c:if>
                </table>
            </td>
            <td class='ZhAppViewContent' valign='top'>
                <c:if test="${not empty selectedRule}">
                    <app:displayRule rule="${selectedRule}"/>
                </c:if>
            </td>
        </tr>
    </tbody>
</table>
