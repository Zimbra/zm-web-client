<%@ tag body-content="empty" %>
<%@ attribute name="src" rtexprvalue="true" required="false" %>
<%@ attribute name="tooltip" rtexprvalue="true" required="false" %>
<%@ attribute name="clazz" rtexprvalue="true" required="false" %>
<%@ attribute name="disabled" rtexprvalue="true" required="false" %>
<%@ attribute name="name" rtexprvalue="true" required="true" %>
<%@ attribute name="text" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:if test="${not empty src}">
<c:url value="/images/${src}" var="src"/>
</c:if>
<c:if test="${not empty text}"><fmt:message key="${text}" var="text"/></c:if>
<c:if test="${not empty tooltip}"><fmt:message key="${tooltip}" var="tooltip"/></c:if>
<c:if test="${disabled}"><c:set var="clazz" value="${clazz} ImgDisabled"/></c:if>

<td height=100% nowrap valign=middle style='padding: 0 2px 0 2px'>
    <button <c:if test="${disabled}">disabled </c:if> type="submit" name="${name}" value="1" <c:if test="${not empty tooltip}">title="${fn:escapeXml(tooltip)}"</c:if> >
        <c:if test="${not empty src}">
        <img src="${src}" <c:if test="${not empty tooltip}">alt="${fn:escapeXml(tooltip)}" </c:if> <c:if test="${not empty clazz}">class='${clazz}'</c:if>>
        </c:if>
        <c:if test="${not empty text}"><span>${text}</span></c:if>
    </button>
</td>