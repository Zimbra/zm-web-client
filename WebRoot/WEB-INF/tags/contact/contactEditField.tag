<%@ tag body-content="empty" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean"%>
<%@ attribute name="field" rtexprvalue="true" required="true" %>
<%@ attribute name="address" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<c:set var="value" value="${contact != null ? contact.attrs[field] : ''}"/>
<fmt:message key="${label}" var="label"/>
<tr>
    <td <c:if test="${address}">valign='top'</c:if> class="editContactLabel"><label for="${field}">${fn:escapeXml(label)}:</label></td>
    <td>
    <c:choose>
        <c:when test="${address}">
            <textarea name='${field}' id='${field}' cols=32 rows='2'>${fn:escapeXml(value)}</textarea>
        </c:when>
        <c:otherwise>
            <input name='${field}' id='${field}' type='text' autocomplete='off' size='35' value="${fn:escapeXml(value)}">
        </c:otherwise>
    </c:choose>
    </td>
</tr>
