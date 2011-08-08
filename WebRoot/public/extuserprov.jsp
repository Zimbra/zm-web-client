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
<html>
<head><title>External User Registration</title></head>
<body>
<form action="/service/extuserprov/" method="post" style="margin:10%;">
    <table width="" cellspacing="5" cellpadding="5" align="center"
           style="border: 1px solid #C3D9FF; padding: 5px; background-color: #E8EEFA;">
        <tbody>
        <tr>
            <td>
                Display Name:
            </td>
            <td>
                <input type="text" name="displayname"/>
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
            <td>
                Confirm Password:
            </td>
            <td>
                <input type="password" name="password2"/>
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td colspan=2 align="center">
                <input type="Submit" Value="Register"/>
            </td>
        </tr>
        </tbody>
    </table>
</form>
</body>
</html>