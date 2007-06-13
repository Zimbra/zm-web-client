<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="description" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<tr>
    <td class='shortcutListHeader' colspan=2>
        <div class='PanelHead'>
            <fmt:message var="desc" key="${description}"/>
            <c:out value="${desc}"/>
        </div>
    </td>
</tr>

