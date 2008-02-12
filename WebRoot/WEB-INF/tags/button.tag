<%@ tag body-content="empty" %>
<%@ attribute name="src" rtexprvalue="true" required="false" %>
<%@ attribute name="tooltip" rtexprvalue="true" required="false" %>
<%@ attribute name="clazz" rtexprvalue="true" required="false" %>
<%@ attribute name="disabled" rtexprvalue="true" required="false" %>
<%@ attribute name="name" rtexprvalue="true" required="true" %>
<%@ attribute name="text" rtexprvalue="true" required="false" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ attribute name="width" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:if test="${not empty src}">
  <c:url value="${iconPath}/${src}" var="src"/>
</c:if>
<c:if test="${not empty text}"><fmt:message key="${text}" var="text"/></c:if>
<c:if test="${not empty tooltip}"><fmt:message key="${tooltip}" var="tooltip"/></c:if>
<c:if test="${disabled}"><c:set var="clazz" value="${clazz} ImgDisabled"/></c:if>
<c:if test="${width}"><c:set var="width" value="${width}"/></c:if>

<%--
 <button <c:if test="${disabled}">disabled </c:if> type="submit" name="${name}" value="1" <c:if test="${not empty tooltip}">title="${fn:escapeXml(tooltip)}"</c:if> >
   <c:if test="${not empty src}">
   <img src="${src}" <c:if test="${not empty tooltip}">alt="${fn:escapeXml(tooltip)}" </c:if> <c:if test="${not empty clazz}">class='${clazz}'</c:if>>
   </c:if>
    <c:if test="${not empty text}"><span>${text}</span></c:if>
  </button>
--%>

<c:if test="${not empty src}">
    <td height="100%" nowrap valign="middle" style="padding: 0 2px 0 2px">
        <input <c:if test="${not empty id}">id="I${id}"</c:if> <c:if test="${disabled}">disabled </c:if> name="${name}" type="image" src="${src}" <c:if test="${not empty tooltip}">alt="${fn:escapeXml(tooltip)}" title="${fn:escapeXml(tooltip)}" </c:if> <c:if test="${not empty clazz}">class='${clazz}'</c:if>>
    </td>
</c:if>
<c:if test="${not empty text}">
    <td height="100%" <c:if test="${not empty width}">width="${width}"</c:if> nowrap valign="middle" style="padding: 0 2px 0 2px">
        <input <c:if test="${not empty id}">id="S${id}"</c:if> <c:if test="${disabled}">disabled class='ImgDisabled' </c:if> name="${name}" type="submit" value="${fn:escapeXml(text)}"  <c:if test="${not empty tooltip}">title="${fn:escapeXml(tooltip)}"</c:if>>
    </td>
</c:if>
    
