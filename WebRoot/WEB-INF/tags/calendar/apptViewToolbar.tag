<%@ tag body-content="empty" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="isReadOnly" rtexprvalue="true" required="true" %>
<%@ attribute name="isInstance" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:getMailbox var="mailbox"/>
<table width="100%" cellspacing="0" class='Tb'>
    <tr valign='middle'>
        <td class='TbBt'>
            <table cellspacing="0" cellpadding="0" class='Tb'>
                <tr>
                    <td nowrap>
                        <app:calendarUrl var="closeurl" />
                        <a id="OPCLOSE" href="${fn:escapeXml(closeurl)}" <c:if test="${keys}"></c:if>> <app:img src="common/ImgClose.gif" alt="close"/> <span>&nbsp;<fmt:message key="close"/></span></a>
                    </td>
                    <c:if test="${not isReadOnly}">
                    <td><div class='vertSep'></div></td>
                    <c:choose>
                    <c:when test="${isInstance}">
                        <app:button name="actionApptDelete" src="startup/ImgDelete.gif" tooltip="actionApptDeleteInstTT" text="deleteInst"/>
                    </c:when>
                    <c:otherwise>
                        <app:button name="actionApptDelete" src="startup/ImgDelete.gif" tooltip="actionApptDeleteTT" text="delete"/>
                    </c:otherwise>
                    </c:choose>

                    <c:if test="${not isInstance}">
                    <td><div class='vertSep'></div></td>
                    <td  nowrap valign="middle">
                        <select name="actionOp">
                            <option value="" selected/><fmt:message key="moreActions"/>
                            <option value="flag"/><fmt:message key="actionAddFlag"/>
                            <option value="unflag"/><fmt:message key="actionRemoveFlag"/>
                            <app:tagOptions mailbox="${mailbox}" keys="${keys}"/>
                        </select>
                    </td>
                        <app:button name="actionGo" tooltip="actionConvGoTT" text="actionGo"/>
                    <td><div class='vertSep'></div></td>
                    </c:if>
                    </c:if>
                </tr>
            </table>
        </td>
    </tr>
</table>
