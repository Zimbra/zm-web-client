<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="create" rtexprvalue="true" required="true"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td align=left class=TbBt>
            <input class='tbButton' type="submit" name="${create ? 'actionCreate' : 'actionModify'}" value="<fmt:message key="save"/>">
            &nbsp;
            <input class='tbButton' type="submit" name="${create ? 'actionCancelCreate' : 'actionCancelModify'}" value="<fmt:message key="cancel"/>">
        </td>
        <td align=right>
            &nbsp;
        </td>
    </tr>
</table>
