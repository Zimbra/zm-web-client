<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="link" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:message var="label" key="tagNew"/>

<table width="100%" cellspacing="0" cellpadding="0">
    <tr class='GrayBg'>
        <c:set var="icon" value="startup/ImgTagBlue.png"/>
        <td>&nbsp;</td>
        <td width="20">
            <app:img src="${icon}" alt='${fn:escapeXml(label)}'/>
        </td>
        <td class='ZhFolderHeader' colspan="2">
            ${fn:escapeXml(label)}
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
            <input id="name" name='newTagName' type='text' size='35' value="${fn:escapeXml(param.newTagName)}">
        </td>
    </tr>

    <tr>
        <td nowrap align='right'>
            <fmt:message key="color"/>
            :
        </td>
        <td>
            <select name="newTagColor">
                <option <c:if test="${param.newTagColor eq 'blue'}">selected</c:if> value="<fmt:message key="colorBlue"/>"/><fmt:message key="blue"/>
                <option <c:if test="${param.newTagColor eq 'cyan'}">selected</c:if> value="<fmt:message key="colorCyan"/>"/><fmt:message key="cyan"/>
                <option <c:if test="${param.newTagColor eq 'green'}">selected</c:if> value="<fmt:message key="colorGreen"/>"/><fmt:message key="green"/>
                <option <c:if test="${param.newTagColor eq 'purple'}">selected</c:if> value="<fmt:message key="colorPurple"/>"/><fmt:message key="purple"/>
                <option <c:if test="${param.newTagColor eq 'red'}">selected</c:if> value="<fmt:message key="colorRed"/>"/><fmt:message key="red"/>
                <option <c:if test="${param.newTagColor eq 'yellow'}">selected</c:if> value="<fmt:message key="colorYellow"/>"/><fmt:message key="yellow"/>
                <option <c:if test="${param.newTagColor eq 'orange'}">selected</c:if> value="<fmt:message key="colorOrange"/>"/><fmt:message key="orange"/>
            </select>                                                                                                                                                      
        </td>
    </tr>

    <tr>
        <td>&nbsp;</td>
        <td>
            <input id="OPSAVE" class='tbButton' type="submit" name="actionNew"
                   value="<fmt:message key="createNewTag"/>">
            &nbsp;
            <input class='tbButton' type="submit" name="actionCancel"
                   value="<fmt:message key="cancel"/>">
        </td>

    </tr>
</table>
