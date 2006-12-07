<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="src" rtexprvalue="true" required="false" %>
<%@ attribute name="clazz" rtexprvalue="true" required="false" %>
<%@ attribute name="disabled" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:url value="/images/${src}" var="src"/>
<c:if test="${disabled}"><c:set var="clazz" value="${clazz} ImgDisabled"/></c:if>
<img src="${src}" <c:if test="${!empty clazz}">class='${clazz}'</c:if> <c:forEach items="${dynattrs}" var="a"> ${a.key}="${a.value}" </c:forEach>/>
