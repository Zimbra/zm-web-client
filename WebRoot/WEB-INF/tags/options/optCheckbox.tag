<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="pref" rtexprvalue="true" required="true" %>
<%@ attribute name="checked" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<tr>
    <td width=30% nowrap align=right><label for="${pref}"><fmt:message key="${label}"/> :</label></td>
    <td><input type="checkbox" id="${pref}" name='${pref}' value="TRUE" <c:if test="${checked}">checked</c:if>></td>
</tr>

