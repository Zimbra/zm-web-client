<%@ tag body-content="empty" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean"%>
<%@ attribute name="field" rtexprvalue="true" required="true" %>
<%@ attribute name="hint" rtexprvalue="true" required="false" %>
<%@ attribute name="address" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:set var="value" value="${contact != null ? contact.attrs[field] : param[field]}"/>
<fmt:message key="${label}" var="label"/>
<c:if test="${not empty hint}">
<fmt:message key="${hint}" var="hint"/>
</c:if>
<div class="table-row">
    <span class="label  list-row table-cell"><label for="${field}">${fn:escapeXml(label)}:</label></span>
    <span class="table-cell  list-row">
    <c:choose>
        <c:when test="${address}">
            <textarea name='${field}' id='${field}' style="width:95%">${fn:escapeXml(value)}</textarea>
        </c:when>
        <c:otherwise>
            <input name='${field}' id='${field}' type='text' style="width:95%" autocomplete='off' value="${fn:escapeXml(value)}">  <c:if test="${not empty hint}" ><span class="ZOptionsHint">(${hint})</span></c:if>
        </c:otherwise>
    </c:choose>
    </span>
</div>
