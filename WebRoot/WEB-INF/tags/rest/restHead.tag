<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="rssfeed" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <title>
        <c:if test="${empty title}"><fmt:message key="zimbraTitle"/></c:if>
        <c:if test="${!empty title}">${fn:escapeXml(title)}</c:if>
    </title>
    <c:set var="skin" value="${not empty param.skin ? param.skin : not empty requestScope.zimbra_target_account_prefSkin ? requestScope.zimbra_target_account_prefSkin : 'beach'}"/>
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>
    <style type="text/css">
       @import url( "<c:url value='/css/common,login,images,skin.css?client=standard&skin=${skin}&v=${version}'/>" );
    </style>
    <fmt:message key="favIconUrl" var="favIconUrl"/>
    <link rel="SHORTCUT ICON" href="<c:url value='${favIconUrl}'/>">
    <c:if test="${rssfeed}">
    <link rel="alternate" type="application/rss+xml"  title="RSS Feed" href="${requestScope.zimbra_target_item_name}.rss">
    </c:if>
    <jsp:doBody/>
</head>
