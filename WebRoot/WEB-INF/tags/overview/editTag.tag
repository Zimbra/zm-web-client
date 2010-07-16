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
<%@ attribute name="tag" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZTagBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<table width="100%" cellspacing="0" cellpadding="0">
    <tr class='GrayBg'>
        <c:set var="icon" value="${tag.image}"/>

        <td width="20">
            &nbsp;<app:img src="${icon}" alt='${fn:escapeXml(tag.name)}'/>
        </td>
        <td class='ZhFolderHeader' colspan="2">
            ${fn:escapeXml(tag.name)}
        </td>
    </tr>
</table>

<table border="0" cellpadding="0" cellspacing="10" width="100%">


    <tr>
        <td width="20%" nowrap align="right">
            <fmt:message key="name"/>
            :
        </td>
        <td>
            <input  name='tagName' type='text' size='35' value="${fn:escapeXml(tag.name)}">
        </td>
    </tr>

    <tr>
        <td nowrap align='right'>
            <fmt:message key="color"/>
            :
        </td>
        <td>
            <select name="tagColor">
                <option <c:if test="${tag.color eq 'blue'}">selected</c:if> value="<fmt:message key="colorBlue"/>"/><fmt:message key="blue"/>
                <option <c:if test="${tag.color eq 'cyan'}">selected</c:if> value="<fmt:message key="colorCyan"/>"/><fmt:message key="cyan"/>
                <option <c:if test="${tag.color eq 'green'}">selected</c:if> value="<fmt:message key="colorGreen"/>"/><fmt:message key="green"/>
                <option <c:if test="${tag.color eq 'purple'}">selected</c:if> value="<fmt:message key="colorPurple"/>"/><fmt:message key="purple"/>
                <option <c:if test="${tag.color eq 'red'}">selected</c:if> value="<fmt:message key="colorRed"/>"/><fmt:message key="red"/>
                <option <c:if test="${tag.color eq 'yellow'}">selected</c:if> value="<fmt:message key="colorYellow"/>"/><fmt:message key="yellow"/>
                <option <c:if test="${tag.color eq 'orange'}">selected</c:if> value="<fmt:message key="colorOrange"/>"/><fmt:message key="orange"/>
            </select>
        </td>
    </tr>

    <tr>
        <td>&nbsp;</td>
        <td>
            <input id="OPSAVE" class='tbButton' type="submit" name="actionSave"
                   value="<fmt:message key="saveChanges"/>">
            <input type="hidden" name="tagId" value="${tag.id}"/>
        </td>
    </tr>

    <tr>
        <td colspan="2">&nbsp;</td>
    </tr>

    <c:if test="${tag.unreadCount gt 0}">
        <tr>
            <td colspan="2">
                <hr>
            </td>
        </tr>
        <tr>
            <td>&nbsp;</td>
            <td>
                <input id="OPMARKALLREAD" class='tbButton' type="submit" name="actionMarkRead"
                       value="<fmt:message key="actionMarkAllRead"/>">
            </td>
        </tr>
    </c:if>
    
    <tr>
        <td colspan="2"><hr></td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input name='tagDeleteConfirm' type='checkbox' value="true">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <fmt:message key="tagDeleteConfirmation"/>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td>
            <input class='tbButton' type="submit" name="actionDelete"
                   value="<fmt:message key="tagDelete"/>">
            <input type="hidden" name="tagDeleteId" value="${tag.id}"/>
        </td>
    </tr>
</table>
