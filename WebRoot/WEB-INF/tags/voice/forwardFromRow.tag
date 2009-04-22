<%@ tag body-content="empty" %>
<%@ attribute name="phone" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="title"><fmt:message key="remove"/></c:set>
<c:set var="removeKey">actionRemove${phone}</c:set>
<c:if test="${!zm:actionSet(param, removeKey)}">
    <tr>
        <td width="50%">${phone}</td>
        <td><input class="ZhOptVoiceRemove" type="Submit" title="${title}" value="${title}" name="${removeKey}"></td>
    </tr>
    <input type="hidden" name="forwardNumbers" value="${phone}">
</c:if>    