<%@ tag body-content="empty" %>
<%@ attribute name="calendar" rtexprvalue="true" required="false" %>
<%@ attribute name="tasklist" rtexprvalue="true" required="false" %>
<%@ attribute name="addressbook" rtexprvalue="true" required="false" %>
<%@ attribute name="search" rtexprvalue="true" required="false" %>
<%@ attribute name="url" rtexprvalue="true" required="false" %>
<%@ attribute name="link" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>


<c:choose>
    <c:when test="${calendar}">
        <fmt:message var="label" key="calendarNew"/>
        <fmt:message var="createLabel" key="createCalendar"/>
        <c:set var="icon" value="${link ? 'calendar/ImgSharedCalendarFolder.gif' : 'calendar/ImgCalendarFolder.gif'}"/>
        <c:set var="newFolderColor" value="${empty param.newFolderColor ? 'blue' : param.newFolderColor}"/>
        <c:set var="newFolderStyleColor" value="${zm:getFolderStyleColor(newFolderColor,'appointment')}"/>
        <c:set var="newFolderExcludeFlag" value="${empty param.newFolderExcludeFlag ? '' : param.newFolderExcludeFlag}"/>
        <c:set var="newFolderCheckedFlag" value="${empty param.newFolderCheckedFlag ? '#' : param.newFolderCheckedFlag}"/>
        <fmt:message var="folderType" key="${url ? 'calendarSubscribed' : (link ? 'calendarShared' : 'calendarUser')}"/>
    </c:when>
    <c:when test="${addressbook}">
        <fmt:message var="label" key="addressBookNew"/>
        <fmt:message var="createLabel" key="createAddressBook"/>
        <c:set var="icon" value="${link ? 'contacts/ImgSharedContactsFolder.gif' : 'contacts/ImgContactsFolder.gif'}"/>
        <fmt:message var="folderType" key="${link ? 'addressBookShared' : 'addressBookUser'}"/>
        <c:set var="newFolderColor" value="${empty param.newFolderColor ? 'blue' : param.newFolderColor}"/>
        <c:set var="newFolderStyleColor" value="${zm:getFolderStyleColor(newFolderColor,'appointment')}"/>
    </c:when>
    <c:when test="${tasklist}">
        <fmt:message var="label" key="taskListNew"/>
        <fmt:message var="createLabel" key="createTaskList"/>
        <c:set var="icon" value="${link ? 'tasks/ImgSharedTaskList.gif' : 'startup/ImgTaskList.gif'}"/>
        <c:set var="newFolderColor" value="${empty param.newFolderColor ? 'gray' : param.newFolderColor}"/>
        <c:set var="newFolderStyleColor" value="${zm:getFolderStyleColor(newFolderColor,'task')}"/>
        <fmt:message var="folderType" key="${link ? 'taskListShared' : 'taskListUser'}"/>
    </c:when>
    <c:otherwise>
        <c:set var="newFolderStyleColor" value="Gray"/>

        <c:set var="icon" value="${search ? 'startup/ImgSearchFolder.gif' : (url ? 'startup/ImgRSS.gif' : 'startup/ImgFolder.gif')}"/>
        <c:choose>
            <c:when test="${url}">
                <fmt:message var="label" key="folderNewRssAtomFeed"/>
                <fmt:message var="folderType" key="folderSubscribed"/>
                <fmt:message var="createLabel" key="folderCreateFeed"/>
            </c:when>
            <c:when test="${search}">
                <fmt:message var="label" key="folderNewSearchFolder"/>
                <fmt:message var="folderType" key="folderSearch"/>
                <fmt:message var="createLabel" key="folderCreateSearch"/>
            </c:when>
            <c:otherwise>
                <fmt:message var="label" key="folderNew"/>
                <fmt:message var="folderType" key="folderUser"/>
                <fmt:message var="createLabel" key="folderCreate"/>
            </c:otherwise>
        </c:choose>
    </c:otherwise>
</c:choose>

<table width=100% cellspacing=0 cellpadding=0>
    <tr class="${newFolderStyleColor}${newFolderStyleColor ne 'Gray' ? 'Bg' :''}">
        <td width=20 style='padding-left:5px'>
            <app:img src="${icon}" alt='${fn:escapeXml(label)}'/>
        </td>
        <td class='ZhFolderHeader' colspan=2>
            ${fn:escapeXml(label)}
        </td>
        <td width=1% nowrap class='ZhFolderType'>
            ${fn:escapeXml(folderType)}
            &nbsp;
        </td>
    </tr>
</table>

<table border="0" cellpadding="0" cellspacing="10" width=100%>

    <tr>
        <td nowrap align=right>
            <label for="newName"><fmt:message key="name"/>
            :</label>
        </td>
        <td>
            <input id="newName" name='newFolderName' type='text' autocomplete='off' size='35' value="${fn:escapeXml(param.newFolderName)}">
        </td>
    </tr>

<c:choose>
    <c:when test="${not (calendar or addressbook or tasklist)}">
    <tr>
        <td nowrap align='right'>
            <label for="parentFolder">
            <fmt:message key="parentFolder"/>
            :</label>
        </td>
        <td>
            <select name="newFolderParentId" id="parentFolder">
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
    </c:when>
    <c:otherwise>
        <input name="newFolderParentId" type="hidden" value="1">
    </c:otherwise>
</c:choose>

    <c:if test="${url}">
        <tr>
            <td nowrap align=right>
                <label for="url"><fmt:message key="url"/>
                :</label>
            </td>
            <td>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr valign=center>
                    <td>
                        <input id="url" name='newFolderUrl' type='text' size='70' value="${fn:escapeXml(param.newFolderUrl)}">
                        <input name='newFolderUrlVisible' type='hidden' value='TRUE'/>
                    </td>
                </tr>
            </table>
            </td>
        </tr>
    </c:if>


    <c:if test="${link}">
        <tr>
            <td nowrap align=right>
                <label for="ownersEmail"><fmt:message key="ownersEmail"/>
                :</label>
            </td>
            <td>
                <input id="ownersEmail" name='newFolderOwnersEmail' type='text' size='35' value="${fn:escapeXml(param.newFolderOwnersEmail)}">
                <input name='newFolderOwnersEmailVisible' type='hidden' value='TRUE'/>
            </td>
        </tr>
        <c:if test="${addressbook}">
         <tr>
            <td nowrap align=right>
                <label for="ownersAbName"><fmt:message key="ownersAddressBookName"/>
                :</label>
            </td>
            <td>
                <input id="ownersAbName" name='newFolderOwnersAddressBook' type='text' size='35' value="${fn:escapeXml(param.newFolderOwnersAddressBook)}">
                <input name='newFolderOwnersAddressBookVisible' type='hidden' value='TRUE'/>
            </td>
        </tr>
        </c:if>
        <c:if test="${tasklist}">
         <tr>
            <td nowrap align=right>
                <label for="ownersTlName"><fmt:message key="ownersTaskListName"/>
                :</label>
            </td>
            <td>
                <input id="ownersTlName" name='newFolderOwnersTaskList' type='text' size='35' value="${fn:escapeXml(param.newFolderOwnersTaskList)}">
                <input name='newFolderOwnersTaskListVisible' type='hidden' value='TRUE'/>
            </td>
        </tr>
        </c:if>
        <c:if test="${calendar}">
            <tr>
                <td nowrap align=right>
                    <label for="ownersCalName"><fmt:message key="ownersCalendarName"/>
                    :</label>
                </td>
                <td>
                    <input id="ownersCalName" name='newFolderOwnersCalendar' type='text' size='35' value="${fn:escapeXml(param.newFolderOwnersCalendar)}">
                    <input name='newFolderOwnersCalendarVisible' type='hidden' value='TRUE'/>
                </td>
            </tr>
        </c:if>
    </c:if>

    <c:if test="${calendar or addressbook or tasklist}">
        <tr>
            <td nowrap align='right'>
                <label for="color"><fmt:message key="color"/>
                :</label>
            </td>
            <td>
                <select name="newFolderColor" id="color">
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
    </c:if>

    <c:if test="${calendar}">
        <tr>
              <td>&nbsp;</td>
              <td nowrap>
                  <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                          <td>
                              <input id="exclude" name='newFolderExcludeFlag' type='checkbox' <c:if test="${newFolderExcludeFlag eq 'b'}">checked</c:if> value="b">
                          </td
                          <td>&nbsp;</td>
                          <td>
                              <label for="exclude"><fmt:message key="excludeFromFreeBusyTimes"/></label>
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
                              <input id="checked" name='newFolderCheckedFlag' type='checkbox' <c:if test="${newFolderCheckedFlag eq '#'}">checked</c:if> value="#">
                          </td>
                          <td>&nbsp;</td>
                          <td>
                              <label for="checked"><fmt:message key="calendarCheckedInUI"/></label>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
    </c:if>

    <c:if test="${search}">
        <tr>
            <td nowrap align=right>
                <label for="folderQuery"><fmt:message key="searchQuery"/>
                :</label>
            </td>
            <td>
            <table border="0" cellpadding="0" cellspacing="0">
                <tr valign=center>
                    <td>
                        <input id="folderQuery" name='newFolderQuery' type='text' size='70' value="${fn:escapeXml(param.newFolderQuery)}">
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
            <input id="OPSAVE" class='tbButton' type="submit" name="actionNew"
                   value="${createLabel}">
            &nbsp;
            <input class='tbButton' type="submit" name="actionCancel"
                   value="<fmt:message key="cancel"/>">
        </td>

    </tr>
</table>
