<%@ tag body-content="scriptless" %>
<%@ attribute name="title" rtexprvalue="true" required="true" %>
<%@ attribute name="onload" rtexprvalue="true" required="false" %>
<%@ attribute name="rssfeed" rtexprvalue="true" required="false" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<rest:head  title="${title}" rssfeed="${rssfeed}"/>
<body <c:if test="${not empty onload}">onload="${onload}"</c:if>>
<jsp:doBody/>	
</body>
</html>
