<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ attribute name="create" rtexprvalue="true" required="true"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<table width=100% cellspacing=0 class='Tb'>
    <tr>
        <td align=left class=TbBt>
            <table cellspacing=0 cellpadding=0 class='Tb'>
                <tr>
                    <app:button id="OPSAVE" name="${create ? 'actionCreate' : 'actionModify'}" src="common/ImgSave.gif" tooltip="save" text="save"/>
                    <td><div class='vertSep'></div></td>
                    <c:choose>
                        <c:when test="${create}">
                            <app:button id="OPCANCEL" name="actionCancelCreate" src="common/ImgCancel.gif" tooltip="cancel" text="cancel"/>
                        </c:when>
                        <c:otherwise>
                            <app:button id="OPCANCEL" name="actionCancelModify" src="common/ImgClose.gif" tooltip="close" text="close"/>                            
                        </c:otherwise>
                    </c:choose>

                </tr>
            </table>
        </td>
        <td align=right>
            &nbsp;
        </td>
    </tr>
</table>
