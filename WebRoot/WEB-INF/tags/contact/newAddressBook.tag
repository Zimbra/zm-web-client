<%@ tag body-content="empty" %>
<%@ attribute name="link" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<fmt:message var="label" key="addressBookNew"/>
<c:set var="newFolderColor" value="${empty param.newFolderColor ? 'blue' : param.newFolderColor}"/>
<c:set var="newFolderStyleColor" value="${zm:getFolderStyleColor(newFolderColor,'appointment')}"/>

<table width=100% cellspacing=0 cellpadding=0>
    <tr class='${newFolderStyleColor}${newFolderStyleColor ne 'Gray' ? 'Bg' :''}'>
        <c:set var="icon" value="${link ? 'contacts/SharedContactsFolder.gif' : 'contacts/ContactsFolder.gif'}"/>
        <td>&nbsp;</td>
        <td width=20>
            <app:img src="${icon}" alt='${fn:escapeXml(label)}'/>
        </td>
        <td class='ZhFolderHeader' colspan=2>
            ${fn:escapeXml(label)}
        </td>
        <td width=1% nowrap class='ZhABType'>
            <c:choose>
                <c:when test="${link}">
                    <fmt:message key="addressBookShared"/>
                </c:when>
                <c:otherwise>
                    <fmt:message key="addressBookUser"/>
                </c:otherwise>
            </c:choose>
            &nbsp;
        </td>
    </tr>
</table>

<table border="0" cellpadding="0" cellspacing="10" width=100%>


    <tr>
        <td width=20% nowrap align=right>
            <fmt:message key="name"/>
            :
        </td>
        <td>
            <input name='newFolderName' type='text' autocomplete='off' size='35' value="${fn:escapeXml(param.newFolderName)}">
        </td>
    </tr>

    <c:if test="${link}">
        <tr>
            <td nowrap align=right>
                <fmt:message key="ownersEmail"/>
                :
            </td>
            <td>
                <input name='newFolderOwnersEmail' type='text' autocomplete='off' size='35' value="${fn:escapeXml(param.newFolderOwnersEmail)}">
                <input name='newFolderOwnersEmailVisible' type='hidden' value='TRUE'/>
            </td>
        </tr>
        <tr>
            <td nowrap align=right>
                <fmt:message key="ownersAddressBookName"/>
                :
            </td>
            <td>
                <input name='newFolderOwnersAddressBook' type='text' autocomplete='off' size='35' value="${fn:escapeXml(param.newFolderOwnersAddressBook)}">
                <input name='newFolderOwnersAddressBookVisible' type='hidden' value='TRUE'/>
            </td>
        </tr>
    </c:if>

    <tr>
        <td nowrap align='right'>
            <fmt:message key="color"/>
            :
        </td>
        <td>
            <select name="newFolderColor">
                <option <c:if test="${newFolderColor eq 'blue'}">selected</c:if> value="blue"/><fmt:message key="blue"/>
                <option <c:if test="${newFolderColor eq 'cyan'}">selected</c:if> value="cyan"/><fmt:message key="cyan"/>
                <option <c:if test="${newFolderColor eq 'green'}">selected</c:if> value="green"/><fmt:message key="green"/>
                <option <c:if test="${newFolderColor eq 'purple'}">selected</c:if> value="purple"/><fmt:message key="purple"/>
                <option <c:if test="${newFolderColor eq 'red'}">selected</c:if> value="red"/><fmt:message key="red"/>
                <option <c:if test="${newFolderColor eq 'yellow'}">selected</c:if> value="yellow"/><fmt:message key="yellow"/>
                <option <c:if test="${newFolderColor eq 'pink'}">selected</c:if> value="pink"/><fmt:message key="pink"/>
                <option <c:if test="${newFolderColor eq 'gray'}">selected</c:if> value="gray"/><fmt:message key="gray"/>
                <option <c:if test="${newFolderColor eq 'orange'}">selected</c:if> value="orange"/><fmt:message key="orange"/>
            </select>
        </td>
    </tr>

    <tr>
        <td>&nbsp;</td>
        <td>
            <input class='tbButton' type="submit" name="actionNew"
                   value="<fmt:message key="createAddressBook"/>">
            &nbsp;
            <input class='tbButton' type="submit" name="actionCancel"
                   value="<fmt:message key="cancel"/>">
        </td>

    </tr>
</table>
