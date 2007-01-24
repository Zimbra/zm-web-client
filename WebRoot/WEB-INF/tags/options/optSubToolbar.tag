<%@ tag body-content="empty" %>
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table cellspacing=0 class='Tb'>
    <tr>
        <c:choose>
            <c:when test="${selected eq 'filter'}">
                <td align=left class=TbBt>
                    <c:choose>
                        <c:when test="${empty param.actionRuleCancel and (not empty param.actionEditFilter or not empty param.actionNewFilter)}">
                            <input class='tbButton' type="submit"
                                   name="actionRuleSave" value="<fmt:message key="save"/>">
                            <input class='tbButton' type="submit"
                                   name="actionRuleCancel" value="<fmt:message key="cancel"/>">
                            <input type="hidden"
                                   name="${not empty param.actionEditFilter ? 'actionEditFilter' : 'actionNewFilter'}" value="1"/>
                        </c:when>
                        <c:otherwise>
                            <input class='tbButton' type="submit"
                                   name="actionNewFilter" value="<fmt:message key="newFilter"/>">
                            <input class='tbButton' type="submit"
                                   name="actionEditFilter" value="<fmt:message key="editFilter"/>">
                        </c:otherwise>
                    </c:choose>
                </td>
            </c:when>
            <c:otherwise>
                <td align=left class=TbBt>
                    <input
                    <c:if test="${selected eq 'shortcuts'}"> DISABLED </c:if> class='tbButton' type="submit"
                                                             name="actionSave" value="<fmt:message key="save"/>">
                </td>
            </c:otherwise>
        </c:choose>
        <td align=right>
            &nbsp;
        </td>
    </tr>
</table>
