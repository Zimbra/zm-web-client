<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ attribute name="keys" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
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
                        <a href="${fn:escapeXml(refreshUrl)}" <c:if test="${keys}"></c:if>><app:img src="startup/ImgRefresh.png" altkey="refresh"/><span>&nbsp;<fmt:message key="refresh"/></span></a>
                    </td>
                    <td><div class='vertSep'></div></td>
                    <td>
                        <zm:currentResultUrl var="newTaskUrl" value="" context="${context}" action="edittask"/>
                        <a <c:if test="${keys}">id="NEW_TASK" </c:if>href="${fn:escapeXml(newTaskUrl)}"><app:img altkey="newTask" src="tasks/ImgNewTask.png"/><span><fmt:message key="newTask"/></span></a>
                    </td>
                    <td><div class='vertSep'></div></td>
                    <c:choose>
                        <c:when test="${context.isFolderSearch and context.folder.isTrash}">
                            <app:button id="${keys ? 'OPDELETE' : ''}" name="actionHardDelete" src="startup/ImgDelete.png" text="actionDelete" tooltip="actionTrashTT" />
                        </c:when>
                        <c:otherwise>
                            <app:button id="${keys ? 'OPDELETE' : ''}" name="actionDelete" src="startup/ImgDelete.png" text="actionDelete" tooltip="actionTrashTT"/>
                        </c:otherwise>
                    </c:choose>
                    <td><div class='vertSep'></div></td>
                    <td height="100%" nowrap valign="middle" style="padding: 0 2px 0 2px">
                        <input onclick="zprint();return false;" id="${keys ? 'IOPPRINT' : ''}" name="actionPrint" type="image" src="<app:imgurl value='startup/ImgPrint.png'/>" alt='<fmt:message key="actionPrint" />' title='<fmt:message key="actionPrint" />' />
                    </td>
                    <td height="100%" nowrap valign="middle" style="padding: 0 2px 0 2px">
                        <input onclick="zprint();return false;" id="${keys ? 'SOPPRINT' : ''}" name="actionPrint" type="submit" value='<fmt:message key="actionPrint" />' title='<fmt:message key="actionPrint" />' />
                    </td>
                    <td><div class='vertSep'></div></td>
                    <td nowrap>
                        <select name="folderId" onchange="zclick('SOPMOVE')">
                            <option value="" selected/><fmt:message key="moveAction"/>
                            <option disabled /><fmt:message key="actionOptSep"/>
                            <zm:forEachFolder var="folder">
                                <c:if test="${folder.isTaskMoveTarget and !folder.isTrash}">
                                    <option value="m:${folder.id}" />${zm:getFolderPath(pageContext, folder.id)}
                                </c:if>
                            </zm:forEachFolder>
                        </select>
                    </td>
                    <app:button  id="${keys ? 'OPMOVE' :''}" name="actionMove" text="actionMove" tooltip="actionMoveTT"/>
                    <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                    <td><div class='vertSep'></div></td>
                    <td nowrap>
                        <select name="actionOp" onchange="zclick('SOPGO')">
                            <option value="" selected/><fmt:message key="moreActions"/>
                    </c:if>
                           <app:tagOptions mailbox="${mailbox}" keys="${keys}"/>
                    <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                        </select>
                    </td>
                    <app:button  id="${keys ? 'OPGO' : ''}" name="action" tooltip="actionTaskListGoTT" text="actionGo" />
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
