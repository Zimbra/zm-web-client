<%@ tag body-content="empty" %>
<%@ attribute name="search" rtexprvalue="true" required="false" %>
<%@ attribute name="url" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:message var="label" key="folderNew"/>

<table width=100% cellspacing=0 cellpadding=0>
    <tr class='GrayBg'>
        <c:set var="icon" value="${search ? 'common/SearchFolder.gif' : (url ? 'mail/RSS.gif' : 'common/Folder.gif')}"/>
        <td>&nbsp;</td>
        <td width=20>
            <app:img src="${icon}" alt='${fn:escapeXml(label)}'/>
        </td>
        <td class='ZhFolderHeader' colspan=2>
            ${fn:escapeXml(label)}
        </td>
        <td width=1% nowrap class='ZhCalType'>
            <c:choose>
                <c:when test="${url}">
                    <fmt:message key="folderSubscribed"/>
                </c:when>
                <c:when test="${search}">
                    <fmt:message key="folderSearch"/>
                </c:when>
                <c:otherwise>
                    <fmt:message key="folderUser"/>
                </c:otherwise>
            </c:choose>
            &nbsp;
        </td>
    </tr>
</table>

<table border="0" cellpadding="0" cellspacing="10" width=100%>

    <tr>
        <td nowrap align=right>
            <fmt:message key="name"/>
            :
        </td>
        <td>
            <input name='newFolderName' type='text' autocomplete='off' size='35' value="${fn:escapeXml(param.newFolderName)}">
        </td>
    </tr>

    <tr>
        <td nowrap align='right'>
            <fmt:message key="parentFolder"/>
            :
        </td>
        <td>
            <select name="newFolderParentId">
                <option selected value="1"/>
                <fmt:message key="rootFolder"/>
                <zm:forEachFolder var="parent">
                    <c:if test="${parent.isMessageMoveTarget and !parent.isTrash and !parent.isSpam}">
                        <option value="${parent.id}"/>
                        ${fn:escapeXml(parent.rootRelativePath)}
                    </c:if>
                </zm:forEachFolder>
            </select>
        </td>
    </tr>

    <c:if test="${url}">
        <tr>
            <td nowrap align=right>
                <fmt:message key="url"/>
                :
            </td>
            <td>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr valign=center>
                    <td>
                        <input name='newFolderUrl' type='text' autocomplete='off' size='70' value="${fn:escapeXml(param.newFolderUrl)}">
                        <input name='newFolderUrlVisible' type='hidden' value='TRUE'/>
                    </td>
                </tr>
            </table>
            </td>
        </tr>
    </c:if>

    <c:if test="${search}">
        <tr>
            <td nowrap align=right>
                <fmt:message key="searchQuery"/>
                :
            </td>
            <td>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr valign=center>
                    <td>
                        <input name='newFolderQuery' type='text' autocomplete='off' size='70' value="${fn:escapeXml(param.newFolderQuery)}">
                        <input name='newFolderQueryVisible' type='hidden' value='TRUE'/>
                    </td>
                </tr>
            </table>
            </td>
        </tr>
    </c:if>

    <tr>
        <td>&nbsp;</td>
        <td>
            <input class='tbButton' type="submit" name="actionNew"
                   value="<fmt:message key="folderNew"/>">
            &nbsp;
            <input class='tbButton' type="submit" name="actionCancel"
                   value="<fmt:message key="cancel"/>">
        </td>

    </tr>
</table>
