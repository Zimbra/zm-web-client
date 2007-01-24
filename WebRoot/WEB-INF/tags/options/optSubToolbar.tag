<%@ tag body-content="empty" %>
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table cellspacing=0 class='Tb' width=100%>
    <tr>
        <c:choose>
            <c:when test="${selected eq 'filter'}">

                    <c:choose>
                        <c:when test="${(empty param.actionFilterCancel and requestScope.filterSave ne 'success') and (not empty param.actionEditFilter or not empty param.actionNewFilter)}">
                            <td align=left class=TbBt>
                                <input class='tbButton' type="submit"
                                       name="actionFilterSave" value="<fmt:message key="save"/>">
                                &nbsp;
                                <input class='tbButton' type="submit"
                                       name="actionFilterCancel" value="<fmt:message key="cancel"/>">
                                <input type="hidden"
                                       name="${not empty param.actionEditFilter ? 'actionEditFilter' : 'actionNewFilter'}" value="1"/>
                            </td>
                        </c:when>
                        <c:otherwise>
                            <td align=left class=TbBt>
                                <input class='tbButton' type="submit"
                                       name="actionNewFilter" value="<fmt:message key="newFilter"/>">
                                &nbsp;
                                <input class='tbButton' type="submit"
                                       name="actionEditFilter" value="<fmt:message key="editFilter"/>">
                                &nbsp;
                                <input class='tbButton' type="submit"
                                       name="actionMoveFilterUp" value="<fmt:message key="filterMoveUp"/>">
                                &nbsp;
                                <input class='tbButton' type="submit"
                                       name="actionMoveFilterDown" value="<fmt:message key="filterMoveDown"/>">
                            </td>
                            <td align=right class=TbBt>
                                <input class='tbButton' type="submit"
                                       name="actionDeleteFilter" value="<fmt:message key="deleteFilter"/>">
                            </td>
                        </c:otherwise>
                    </c:choose>
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
