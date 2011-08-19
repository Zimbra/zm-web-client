<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011 Zimbra, Inc.
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
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<html>
<head><title>External User Login</title></head>
<body>
<c:choose>
    <c:when test="${not empty param.email}">
        <% String acctName = request.getParameter("email").replace("@", ".") + "@" + request.getParameter("domain"); %>
        <zm:login username="<%=acctName%>" password="${param.password}" varRedirectUrl="postLoginUrl"
                  varAuthResult="authResult" rememberme="${param.zrememberme == '1'}"/>
        <c:choose>
            <c:when test="${not empty authResult}">
                <c:redirect url="/"/>
            </c:when>
            <c:otherwise>
                <c:redirect url="/zimbra/public/extuserlogin.jsp"/>
            </c:otherwise>
        </c:choose>
    </c:when>
    <c:otherwise>
        <form action="/zimbra/public/extuserlogin.jsp" method="post" style="margin:10%;">
            <input type="hidden" name="domain" value="${param.domain}"/>
            <table width="" cellspacing="5" cellpadding="5" align="center"
                   style="border: 1px solid #C3D9FF; padding: 5px; background-color: #E8EEFA;">
                <tbody>
                <tr>
                    <td>
                        Email:
                    </td>
                    <td>
                        <input type="text" name="email"/>
                    </td>
                </tr>
                <tr>
                    <td>
                        Password:
                    </td>
                    <td>
                        <input type="password" name="password"/>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                </tr>
                <tr>
                    <td colspan=2 align="center">
                        <input type="Submit" Value="Login"/>
                    </td>
                </tr>
                </tbody>
            </table>
        </form>
    </c:otherwise>
</c:choose>
</body>
</html>