<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="key" rtexprvalue="true" required="true" %>
<%@ attribute name="description" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<tr><td class='shortcutKeys'>
    <span class='shortcutKeyCombo'>
        <span class='shortcutKey'>
            ${key}
        </span>
    </span></td>
    <td class='shortcutDescription'>
        <fmt:message var="desc" key="${description}"/>
        <c:out value="${desc}"/>
    </td>
</tr>
