<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="label" rtexprvalue="true" required="true" %>
<%@ attribute name="pref" rtexprvalue="true" required="true" %>
<%@ attribute name="checked" rtexprvalue="true" required="true" %>
<%@ attribute name="boxfirst" rtexprvalue="true" required="false" %>
<%@ attribute name="trailingcolon" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:choose>
    <c:when test="${boxfirst}">
        <table cellspacing="0" cellpadding="0">
            <tr>
                <td><input type="checkbox" id="${pref}" name='${pref}' value="TRUE" <c:if test="${checked}">checked</c:if>></td>
                <td style='padding-left:5px' nowrap align=right><label for="${pref}"><fmt:message key="${label}"/><c:if test="${trailingcolon}">:</c:if> </label></td>
            </tr>
        </table>
    </c:when>
    <c:otherwise>
        <tr>
            <td class="ZOptionsTableLabel" style="width:30%;" nowrap align=right><label for="${pref}"><fmt:message key="${label}"/> :</label></td>
            <td><input type="checkbox" id="${pref}" name='${pref}' value="TRUE" <c:if test="${checked}">checked</c:if>></td>
        </tr>
    </c:otherwise>
</c:choose>
