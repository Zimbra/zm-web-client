<%@ tag body-content="empty" %>
<%@ attribute name="folder" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZFolderBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<table border="0" cellpadding="0" cellspacing="10" width=100%>
    <tr>
        <td nowrap align=right>
            <fmt:message key="name"/>
            :
        </td>
        <td>
            <c:choose>
                <c:when test="${folder.isSystemFolder}">
                    <fmt:message var="label" key="FOLDER_LABEL_${folder.id}"/>
                    <c:if test="${fn:startsWith(label,'???')}"><c:set var="label" value="${folder.name}"/></c:if>
                    ${fn:escapeXml(label)}
                </c:when>
                <c:otherwise>
                    <input name='folderName' type='text' autocomplete='off' size='35' value="${fn:escapeXml(folder.name)}">
                </c:otherwise>
            </c:choose>

        </td>
    </tr>

    <tr>
        <td nowrap align=right>
            <fmt:message key="type"/>
            :
        </td>
        <td>
            <c:choose>
                <c:when test="${folder.isSystemFolder}">
                    <fmt:message key="calendarSystem"/>
                </c:when>
                <c:when test="${not empty folder.remoteURL}">
                    <fmt:message key="calendarSubscribed"/>
                </c:when>
                <c:when test="${folder.isMountPoint}">
                    <fmt:message key="calendarShared"/>
                </c:when>
                <c:otherwise>
                    <fmt:message key="calendar"/>
                </c:otherwise>
            </c:choose>

        </td>
    </tr>

    <c:if test="${not empty folder.remoteURL}">
        <tr>
            <td nowrap align=right>
                <fmt:message key="url"/>
                :
            </td>
            <td>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr valign=center>
                    <td>
                        <input name='folderUrl' type='text' autocomplete='off' size='70' value="${fn:escapeXml(folder.remoteURL)}">
                    </td>
                    <td>
                        &nbsp;
                    </td>
                    <td valign="center">
                        <c:url var="syncUrl" value="">
                            <c:param name="id" value="${folder.id}"/>
                            <c:param name="sync" value="${folder.id}"/>
                        </c:url>
                        <fmt:message key="reloadCalendar" var="reload"/>
                        <a href="${syncUrl}"><app:img src="arrows/Refresh.gif" title="${reload}"/></a>
                    </td>
                </tr>
            </table>
            </td>
        </tr>
    </c:if>

    <c:if test="${folder.isMountPoint}">
        <tr>
            <td nowrap align=right>
                <fmt:message key="owner"/>
                :
            </td>
            <td>
                ${fn:escapeXml(folder.ownerDisplayName)}
            </td>
        </tr>
        <%--
        <tr>
            <td nowrap align=right>
                <fmt:message key="permissions"/>
                :
            </td>
            <td>
                ${fn:escapeXml(folder.effectivePerm)}
            </td>
        </tr>
        --%>
    </c:if>

    <tr>
        <td nowrap align='right'>
            <fmt:message key="color"/>
            :
        </td>
        <td>
            <select name="folderColor">
                <option <c:if test="${folder.color eq 'blue'}">selected</c:if> value="c:blue"/><fmt:message key="blue"/>
                <option <c:if test="${folder.color eq 'cyan'}">selected</c:if> value="c:cyan"/><fmt:message key="cyan"/>
                <option <c:if test="${folder.color eq 'green'}">selected</c:if> value="c:green"/><fmt:message key="green"/>
                <option <c:if test="${folder.color eq 'purple'}">selected</c:if> value="c:purple"/><fmt:message key="purple"/>
                <option <c:if test="${folder.color eq 'red'}">selected</c:if> value="c:red"/><fmt:message key="red"/>
                <option <c:if test="${folder.color eq 'yellow'}">selected</c:if> value="c:yellow"/><fmt:message key="yellow"/>
                <option <c:if test="${folder.color eq 'pink'}">selected</c:if> value="c:pink"/><fmt:message key="pink"/>
                <option <c:if test="${folder.color eq 'gray'}">selected</c:if> value="c:gray"/><fmt:message key="gray"/>
                <option <c:if test="${folder.color eq 'orange'}">selected</c:if> value="c:orange"/><fmt:message key="orange"/>
            </select>
        </td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input name='folderExcludeFlag' type='checkbox' <c:if test="${folder.isExcludedFromFreeBusy}">checked</c:if> value="b">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <fmt:message key="excludeFromFreeBusyTimes"/>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <tr>
        <td>&nbsp;</td>
        <td nowrap>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <input name='folderCheckedFlag' type='checkbox' <c:if test="${folder.isCheckedInUI}">checked</c:if> value="#">
                    </td>
                    <td>&nbsp;</td>
                    <td>
                        <fmt:message key="calendarCheckedInUI"/>
                    </td>
                </tr>
            </table>
        </td>
    </tr>

    <tr>
        <td>&nbsp;</td>
        <td>
            <input class='tbButton' type="submit" name="actionSave"
                   value="<fmt:message key="saveChanges"/>">
        </td>

    </tr>
</table>
