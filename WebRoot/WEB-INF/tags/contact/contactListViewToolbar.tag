<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<zm:getMailbox var="mailbox"/>

<table width="100%" cellspacing="0" class='Tb'>
    <tr>
        <td align="left" class=TbBt>
            <table cellspacing="0" cellpadding="0" class='Tb'>
                <tr>
                    <td nowrap>
                        <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                        <a href="${fn:escapeXml(refreshUrl)}" <c:if test="${keys}"></c:if>><app:img src="arrows/ImgRefresh.gif" altkey="refresh"/><span style='padding-left:5px'><fmt:message key="refresh"/></span></a>
                    </td>
                    <td><div class='vertSep'></div></td>
                    <app:button name="actionNew" id="${keys ? 'NEW_CONTACT' : ''}" src="contacts/ImgNewContact.gif" tooltip="newContact" text="contact"/>
                    <td><div class='vertSep'></div></td>
                    <app:button name="actionNewGroup" id="${keys ? 'NEW_GROUP' : ''}" src="mail/ImgNewGroup.gif" tooltip="newGroup" text="group"/>
                    <td><div class='vertSep'></div></td>
                    <td nowrap>
                    <app:button name="actionPrint" id="${keys ? 'OPPRINT' : ''}" src="startup/ImgPrint.gif" tooltip="actionPrint" text="actionPrint"/>
                    </td>
                    <c:if test="${not empty contact}">
                        <td><div class='vertSep'></div><input type='hidden' name="actionEditId" value="${contact.id}"></td>
                        <app:button id="${keys ? 'OPEDIT' : ''}" name="actionEdit" src="startup/ImgEdit.gif" tooltip="edit" text="edit"/>
                    </c:if>
                    <td><div class='vertSep'></div></td>
                    <c:choose>
                        <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                            <app:button id="${keys ? 'OPDELETE' : ''}" name="actionHardDelete" src="startup/ImgDelete.gif" text="actionDelete" tooltip="actionTrashTT" />
                        </c:when>
                        <c:otherwise>
                            <app:button id="${keys ? 'OPDELETE' : ''}" src="startup/ImgDelete.gif" name="actionDelete" text="actionDelete" tooltip="actionTrashTT"/>
                        </c:otherwise>
                    </c:choose>
                    <td><div class='vertSep'></div></td>
                    <td nowrap>
                        <select name="folderId" onchange="zclick('SOPMOVE')">
                            <option value="" selected/><fmt:message key="moveAction"/>
                            <option disabled /><fmt:message key="actionOptSep"/>
                            <zm:forEachFolder var="folder">
                                <c:if test="${folder.isContactMoveTarget and !folder.isTrash}">
                                    <option value="m:${folder.id}" />${fn:escapeXml(zm:getFolderPath(pageContext, folder.id))}
                                </c:if>
                            </zm:forEachFolder>
                        </select>
                    </td>
                    <app:button  id="${keys ? 'OPMOVE' :''}" name="actionMove" text="actionMove" tooltip="actionMoveTT"/>
                    <td><div class='vertSep'></div></td>
                    <td nowrap>
                        <label for="searchField"><fmt:message key="find"/>&nbsp;:&nbsp;</label>
                        <input onkeydown="handleEnter(event);" style="background-color:#FFFFFF;height:auto;padding:2px 4px;cursor:text;" type="text" id="searchField" maxlength="50" name="contactsq" value="${param.sq}">
                    </td>
                    <app:button name="actionSearch" id="${keys ? 'SEARCH_CONTACT' : ''}" tooltip="search" text="search"/>
                    <td><div class='vertSep'></div></td>
                    <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                    <td nowrap>
                        <select name="actionOp"  onchange="zclick('SOPGO')">
                            <option value="" selected/><fmt:message key="moreActions"/>
                            </c:if>
                            <app:tagOptions mailbox="${mailbox}" keys="${keys}"/>
                            <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                        </select>
                    </td>
                    <app:button id="${keys ? 'OPGO' : ''}" name="action" tooltip="actionContactGoTT" text="actionGo" />
                    </c:if>
                    <c:if test="${context.folder.isTrash}">
                        <td><div class='vertSep'></div><input type="hidden" name="contextFolderId" value="${context.selectedId}"></td>
                        <app:button name="actionEmpty" tooltip="emptyTrash" text="emptyTrash"/>
                    </c:if>
                </tr>
            </table>
        </td>
        <td nowrap align=right>
            <app:searchPageLeft keys="${keys}" context="${context}" urlTarget="/h/search"/>
            <app:searchPageOffset searchResult="${context.searchResult}"/>
            <app:searchPageRight keys="${keys}" context="${context}" urlTarget="/h/search"/>
        </td>
    </tr>
</table>
