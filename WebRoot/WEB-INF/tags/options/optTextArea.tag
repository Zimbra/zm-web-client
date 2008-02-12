<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="pref" rtexprvalue="true" required="true" %>
<%@ attribute name="cols" rtexprvalue="true" required="true" %>
<%@ attribute name="rows" rtexprvalue="true" required="true" %>
<%@ attribute name="value" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>

<tr>
    <td width=30% nowrap align=right valign='top'><label for="${pref}"><fmt:message key="${label}"/> :</label></td>
    <td>
        <textarea id="${pref}" name='${pref}' cols='${cols}' rows='${rows}'>${fn:escapeXml(value)}</textarea>
    </td>

</tr>

