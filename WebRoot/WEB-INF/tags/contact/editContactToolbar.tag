<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
