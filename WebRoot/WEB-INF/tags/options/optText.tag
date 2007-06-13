<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="pref" rtexprvalue="true" required="true" %>
<%@ attribute name="size" rtexprvalue="true" required="true" %>
<%@ attribute name="value" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<tr>
    <td width=30% nowrap align=right><fmt:message key="${label}"/> :</td>
    <td><input size="${size}" type="text" name='${pref}' autocomplete='off' value="${fn:escapeXml(value)}"></td>
</tr>

