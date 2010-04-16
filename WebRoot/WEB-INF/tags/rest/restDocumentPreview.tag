<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010 Zimbra, Inc.
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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="rest" uri="com.zimbra.restclient" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<rest:handleError>
    <zm:getDocument var="doc" box="${mailbox}" id="${requestScope.zimbra_target_account_id}:${requestScope.zimbra_target_item_id}"/>
    <zm:getDocumentContent  var="docContent" box="${mailbox}" id="${requestScope.zimbra_target_item_id}"/>
</rest:handleError>

<html>
    <head>

        <c:set value="/img" var="iconPath" scope="request"/>
        <c:url var='cssurl' value='/css/images,common,login,skin,docs.css'>
            <c:param name="client"	value="standard" />
            <c:param name="skin"	value="${mailbox.prefs.skin}" />
            <c:param name="v"		value="${initParam.zimbraCacheBusterVersion}" />
        </c:url>
        <link rel="stylesheet" type="text/css" href="${cssurl}" />

    </head>
    <body>
    <table width="100%" height="100%" cellspacing="0" cellpadding="0">
        <tbody>
            <tr>
                <td class="TbTop" style="height:40px;">
                    <table width="100%" height="100%" cellpadding="0" cellspacing="5">
                    <tr>
                        <td>
                            <span style="font-size:18px;"><b>${doc.name}</b></span>
                        </td>
                        <td>
                            &nbsp;
                        </td>
                    </tr>
                    <tr>
                        <td><fmt:message key="labelBy"/>&nbsp;${doc.creator}</td>
                        <td align="right"><fmt:message key="labelVersion"/>: ${doc.version}  |  <fmt:message key="labelModifiedOn"/>: <fmt:formatDate value="${doc.modifiedDate}" pattern="M/d/yyyy hh:mm" timeZone="${mailbox.prefs.timeZone}"/></td>
                    </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td align="top">
                    <table width="100%" height="100%" cellpadding="5" cellspacing="5">
                        <tbody>
                            <tr>
                                <td class="ZhAppContent" style="border-width:1px;">
                                <div style="width:100%; height:100%;">
                                   ${docContent}
                                </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
    </body>
</html>