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
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table cellspacing="0" class='Tb' width="100%">
    <tr>
        <td class='TbBt'>
            <table cellspacing="0" cellpadding="0" class='Tb'>
               <tr>
                   <c:choose>
                       <c:when test="${selected eq 'filter'}">
                           <c:set var="rules" value="${empty param.ruleName ? mailbox.filterRulesReload : mailbox.filterRules}"/>
                           <c:if test="${empty rules}">
                               <c:set var="disabled" value="true"/>
                           </c:if>
                           <c:choose>
                               <c:when test="${(not zm:actionSet(param, 'actionFilterCancel') and requestScope.filterSave ne 'success') and (zm:actionSet(param, 'actionEditFilter') or zm:actionSet(param, 'actionNewFilter'))}">
                                    <app:button  name="actionFilterSave" src="common/ImgSave.png" tooltip="save" text="save"/>
                                     <td><div class='vertSep'></div></td>
                                    <app:button  name="actionFilterCancel" src="common/ImgCancel.png" tooltip="cancel" text="cancel"/>
                                       <input type="hidden"
                                              name="${zm:actionSet(param, 'actionEditFilter') ? 'actionEditFilter' : 'actionNewFilter'}" value="1"/>
                               </c:when>
                               <c:otherwise>
                                   <app:button name="actionNewFilter" src="startup/ImgPlus.png" tooltip="newFilter" text="newFilter"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionEditFilter" src="startup/ImgEdit.png" tooltip="editFilter" text="editFilter" disabled="${disabled}"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionDeleteFilter" src="startup/ImgDelete.png" tooltip="deleteFilter" text="deleteFilter" disabled="${disabled}"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionMoveFilterUp" src="arrows/ImgUpArrow.png" tooltip="filterMoveUp" text="filterMoveUp"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionMoveFilterDown" src="arrows/ImgDownArrow.png" tooltip="filterMoveDown" text="filterMoveDown"/>
                               </c:otherwise>
                           </c:choose>
                       </c:when>
                       <c:otherwise>
                           <c:if test="${selected ne 'shortcuts'}">
                                <app:button id="OPSEND" name="actionSave" src="common/ImgSave.png" tooltip="save" text="save"/>
                           </c:if>
                           <td><div class='vertSep'></div></td>
                           <app:button  name="actionCancel" src="common/ImgCancel.png" tooltip="cancel" text="cancel"/>
                       </c:otherwise>
                   </c:choose>
               </tr>
            </table>
        </td>
        <td align="right">
            &nbsp;
        </td>
    </tr>
</table>
