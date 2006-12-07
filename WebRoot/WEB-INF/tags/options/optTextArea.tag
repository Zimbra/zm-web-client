<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="pref" rtexprvalue="true" required="true" %>
<%@ attribute name="cols" rtexprvalue="true" required="true" %>
<%@ attribute name="rows" rtexprvalue="true" required="true" %>
<%@ attribute name="value" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<tr>
    <td width=30% nowrap align=right valign='top'><fmt:message key="${label}"/> :</td>
    <td>
        <textarea name='${pref}' cols='${cols}' rows='${rows}'>${fn:escapeXml(value)}</textarea>
    </td>

</tr>

