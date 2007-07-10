<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ attribute name="scale" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<head>
    <title>
        <c:if test="${empty title}"><fmt:message key="zimbraTitle"/></c:if>
        <c:if test="${!empty title}"><fmt:message key="zimbraTitle"/>: ${fn:escapeXml(title)}</c:if>
    </title>
    <c:choose>
        <c:when test="${scale}">
            <meta name="viewport" content="width=320; initial-scale=1.0; maximum-scale=8.0; user-scalable=1;"/>
        </c:when>
        <c:otherwise>
            <meta name="viewport" content="width=320; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;"/>
        </c:otherwise>
    </c:choose>

    <style type="text/css" media="screen">
    <c:set var="version" value="${initParam.zimbraCacheBusterVersion}"/>        
       @import url( "<c:url value='/css/zmobile.css?v=${version}&debug=1'/>" );
    </style>
    <jsp:doBody/>
</head>
