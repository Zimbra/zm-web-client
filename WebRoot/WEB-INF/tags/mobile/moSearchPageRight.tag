<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:if test="${context.searchResult.hasNextPage}">
    <zm:nextResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
    <a class='zo_button' href="${url}">
        <fmt:message key="MO_NEXT"/>
        <%--<img src="<c:url value='/images/arrows/NextPage.gif'/>" border="0"/> --%>
    </a>
</c:if>
<c:if test="${!context.searchResult.hasNextPage}">
    <a class='zo_button' style='color:gray'>
        <fmt:message key="MO_NEXT"/>
        <%--<img src="<c:url value='/images/arrows/NextPage.gif'/>" border="0"/> --%>
    </a>
</c:if>
