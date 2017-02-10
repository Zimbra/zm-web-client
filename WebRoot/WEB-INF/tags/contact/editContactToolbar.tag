<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
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
                    <app:button id="OPSAVE" name="${create ? 'actionCreate' : 'actionModify'}" src="common/ImgSave.png" tooltip="save" text="save"/>
                    <td><div class='vertSep'></div></td>
                    <c:choose>
                        <c:when test="${create}">
                            <app:button id="OPCANCEL" name="actionCancelCreate" src="common/ImgCancel.png" tooltip="cancel" text="cancel"/>
                        </c:when>
                        <c:otherwise>
                            <app:button id="OPCANCEL" name="actionCancelModify" src="common/ImgClose.png" tooltip="close" text="close"/>                            
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
