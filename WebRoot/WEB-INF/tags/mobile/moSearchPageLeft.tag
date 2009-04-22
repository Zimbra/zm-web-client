<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:choose>
<c:when test="${context.searchResult.hasPrevPage}">
    <zm:prevResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
    <a class='zo_button' href="${fn:escapeXml(url)}">
        <fmt:message key="MO_PREV"/>
        <%-- <app:img src="arrows/ImgPreviousPage.gif" alt=""/>--%>
    </a>
</c:when>
<c:otherwise>
        <a class='zo_button' style='color:gray'>
            <fmt:message key="MO_PREV"/>
        </a>
</c:otherwise>
</c:choose>