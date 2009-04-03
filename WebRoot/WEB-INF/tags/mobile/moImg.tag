<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="src" rtexprvalue="true" required="false" %>
<%@ attribute name="alt" rtexprvalue="true" required="false" %>
<%@ attribute name="altkey" rtexprvalue="true" required="false" %>
<%@ attribute name="clazz" rtexprvalue="true" required="false" %>
<%@ attribute name="disabled" rtexprvalue="true" required="false" %>
<%@ attribute name="title" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:if test="${not empty altkey}"><fmt:message key="${altkey}" var="alt"/></c:if>
<c:if test="${not empty title}"><fmt:message key="${title}" var="title"/></c:if> 
<c:if test="${disabled}"><c:set var="clazz" value="${clazz} ImgDisabled"/></c:if>
<img src="<app:imgurl value='${src}' />" <c:if test="${not empty title}"> title='${title}'</c:if> <c:if test="${not empty alt}">alt="${fn:escapeXml(alt)}"</c:if> <c:if test="${not empty clazz}">class='${clazz}'</c:if> <c:forEach items="${dynattrs}" var="a"> ${a.key}="${a.value}" </c:forEach>/>
