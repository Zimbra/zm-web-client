<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2009, 2010, 2011, 2013, 2014, 2015, 2016 Synacor, Inc.
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
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ attribute name="type" rtexprvalue="true" required="true" %>
<%@ attribute name="st" rtexprvalue="true" required="true" %>
<%@ attribute name="url" rtexprvalue="true" required="false" %>
<%@ attribute name="hide" rtexprvalue="true" required="false" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<mo:handleError>
    <zm:getUserAgent var="ua" session="true"/>
</mo:handleError>
<zm:getMailbox var="mailbox"/>
<c:choose>
<c:when test="${type eq 'folder' or type eq 'ab'}">
    <c:url var=" caction" value="${prevUrl}">
    <c:if test="${param.pid!=null}">
        <c:param name="action" value="view"/>
        <c:param name="id" value="${param.pid}"/>
    </c:if>
    </c:url>

    <c:if test="${!fn:containsIgnoreCase(caction, '_back=1')}">
    <c:url value="${caction}" var="caction">
        <c:param name="_back" value="1"/>
    </c:url>
    </c:if>
     <div class="tbl View" id="nfldrfrm" style="${hide ? 'display:none':''};">
         <form action="${url}" method="post" onsubmit="return submitForm(this);">
         <c:if test="${not empty id}"><c:set var="efolder" value="${zm:getFolder(pageContext, fn:escapeXml(id))}"/><input type="hidden" name="efolderid" value="${efolder.id}"></c:if>
         <c:if test="${ua.isiPad == true}">
            <div class="composeToolbar">
        		<div class="compose button"><span><input class="zo_button" type="submit" name="action${not empty efolder ? 'Modify':'Save'}Folder" value="<fmt:message key='save'/>"></span></div>
        		<c:if test="${not empty efolder}">
        			<div class="compose button"><span><input type="submit" class="zo_button delete_button" name="action${efolder.parentId eq mailbox.trash.id ? 'Hard' : ''}DeleteFolder" value="<fmt:message key="delete"/>"></span></div>
        		</c:if>
        		<div class="header alignLeft" style="margin-left: 25%;">
            	<div class="subject">
                    <c:choose>
                    <c:when test="${type eq 'folder'}"><fmt:message key="createNewFolder"/></c:when>
                    <c:when test="${type eq 'ab'}"><fmt:message key="createNewAddressBook"/></c:when>
                    </c:choose>
                </div>
            </div>
        		
		        <div class="buttonRight button" onclick="return toggleCompose('compose-pop','veil');"><span><fmt:message key="cancel"/></span></div>
    		</div>
            
         </c:if>
         <input type="hidden" name="doFolderAction" value="1">
         <input name="crumb" type="hidden" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
         <input name="st" type="hidden" value="${fn:escapeXml(st)}"/>
         
         ${ua.isiPad eq true ? '<div class="Stripes cmp_container composeFields">' : '<div class="msgBody">'}
                    <div class="tbl" width="100%"><div class="tr">
                        <span class="label td"><fmt:message key="nameLabel"/><input type="text" name="folder_name" ${ua.isiPad eq true ? 'style="width:50%;"' : 'style=""'} class="Textarea" value="${efolder.name}">
                        <c:if test="${ua.isiPad == false}">
                        	<input class="zo_button" type="submit" name="action${not empty efolder ? 'Modify':'Save'}Folder" value="<fmt:message key='save'/>">
                        </c:if>
                    </div></div>
                    
                    <div class="tbl"><div class="tr"><div class="td label">
                                <c:choose>
                                    <c:when test="${empty st || st eq 'folders' || st eq mailbox.prefs.groupMailBy}">
                                        <hr size="1"/>
                                        <select name="parentid" style="width:120px;height:100%;">
                                            <option value="${mailbox.inbox.parentId}">--<fmt:message key="in"/>--
                                            </option>
                                            <c:set var="count" value="${0}"/>
                                            <zm:forEachFolder parentid="${mailbox.inbox.id}" var="fldr"
                                                              skiproot="false">
                                                <c:if test="${count lt sessionScope.F_LIMIT && fldr.isMessageMoveTarget && (empty efolder || efolder.id != fldr.id)}">
                                                    <option value="${fldr.id}" ${fldr.id eq efolder.parentId? 'selected=selected' : ''}>${zm:getFolderPath(pageContext, fldr.id)}</option>
                                                <c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder><c:set var="count" value="${0}"/>
                                            <zm:forEachFolder parentid="${mailbox.sent.id}" var="fldr"
                                                              skiproot="false">
                                                <c:if test="${count lt sessionScope.F_LIMIT && fldr.isMessageMoveTarget && (empty efolder || efolder.id != fldr.id)}">
                                                    <option value="${fldr.id}" ${fldr.id eq efolder.parentId? 'selected=selected' : ''}>${zm:getFolderPath(pageContext, fldr.id)}</option>
                                                <c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder><c:set var="count" value="${0}"/>
                                            <zm:forEachFolder parentid="${mailbox.drafts.id}" var="fldr"
                                                              skiproot="false">
                                                <c:if test="${count lt sessionScope.F_LIMIT && fldr.isMessageMoveTarget && (empty efolder || efolder.id != fldr.id)}">
                                                    <option value="${fldr.id}" ${fldr.id eq efolder.parentId? 'selected=selected' : ''}>${zm:getFolderPath(pageContext, fldr.id)}</option>
                                                <c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder><c:set var="count" value="${0}"/>
                                            <zm:forEachFolder var="fldr" skiproot="${true}" skipsystem="${true}"
                                                              skiptopsearch="${true}">
                                                <c:if test="${count lt sessionScope.F_LIMIT && fldr.isMessageMoveTarget && (empty efolder || efolder.id != fldr.id)}">
                                                    <option value="${fldr.id}" ${fldr.id eq efolder.parentId? 'selected=selected' : ''}>${zm:getFolderPath(pageContext, fldr.id)}</option>
                                                <c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder>
                                        </select>
                                    </c:when>
                                    <c:when test="${st eq 'ab' || st eq 'contact'}">
                                                            <hr size="1"/>
                                        <select name="parentid" style="width:100px;">
                                            <option value="${mailbox.contacts.parentId}">--<fmt:message key="in"/>--
                                            </option><c:set var="count" value="${0}"/>
                                            <zm:forEachFolder var="fldr" parentid="${mailbox.contacts.parentId}"
                                                              skiproot="false" skiptrash="true">
                                                <c:if test="${count lt sessionScope.F_LIMIT and fldr.isContactMoveTarget && (empty efolder || efolder.id ne fldr.id)}">
                                                    <option value="${fldr.id}" ${efolder.parentId eq fldr.id ? 'selected=selected' : ''}>${zm:getFolderPath(pageContext, fldr.id)}</option>
                                                <c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder>
                                        </select>
                                     
                                    </c:when>
                                    <c:when test="${st eq 'cal' || st eq 'cals' || st eq 'appointment'}">
                                        <c:if test="${st eq 'cals'}">
                                        <select name="color">
                                            <optgroup label="<fmt:message key='color'/>">
                                                <option value="cyan" ${efolder.color eq 'cyan' ? 'selected=selected' : ''}>
                                                    <fmt:message key="cyan"/></option>
                                                <option value="blue" ${efolder.color eq 'blue' ? 'selected=selected' : ''}>
                                                    <fmt:message key="blue"/></option>
                                                <option value="purple" ${efolder.color eq 'purple' ? 'selected=selected' : ''}>
                                                    <fmt:message key="purple"/></option>
                                                <option value="red" ${efolder.color eq 'red' ? 'selected=selected' : ''}>
                                                    <fmt:message key="red"/></option>
                                                <option value="orange" ${efolder.color eq 'orange' ? 'selected=selected' : ''}>
                                                    <fmt:message key="orange"/></option>
                                                <option value="yellow" ${efolder.color eq 'yellow' ? 'selected=selected' : ''}>
                                                    <fmt:message key="yellow"/></option>
                                                <option value="green" ${efolder.color eq 'green' ? 'selected=selected' : ''}>
                                                    <fmt:message key="green"/></option>
                                            </optgroup>
                                        </select></c:if>
                                        <input type="hidden" name="parentid" value="${not empty efolder ? efolder.parentId : mailbox.calendar.parentId}"> 
                                    </c:when>
                                    <c:when test="${st eq 'notebook' || st eq 'notebooks' || st eq 'wiki'}">
                                                            <hr size="1"/>
                                        <select name="parentid" style="width:100px;">
                                            <option value="${mailbox.inbox.parentId}">--<fmt:message key="in"/>--
                                            </option><c:set var="count" value="${0}"/>
                                            <zm:forEachFolder var="fldr" skiproot="${false}" skipsystem="${false}"
                                                              skiptrash="${true}">
                                                <c:if test="${count lt sessionScope.F_LIMIT and fldr.isWikiMoveTarget && (empty efolder || efolder.id ne fldr.id)}">
                                                    <option value="${fldr.id}" ${efolder.parentId eq fldr.id ? 'selected=selected' : ''}>${zm:getFolderPath(pageContext, fldr.id)}</option>
                                                <c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder>

                                        </select>
                                    </c:when>
                                    <c:when test="${st eq 'briefcase' || st eq 'briefcases' || st eq 'document'}">
                                                            <hr size="1"/>
                                        <select name="parentid" style="width:100px;">
                                            <option value="${mailbox.inbox.parentId}">--<fmt:message key="in"/>--
                                            </option><c:set var="count" value="${0}"/>
                                            <zm:forEachFolder var="fldr" skiproot="${false}" skipsystem="${false}"
                                                              skiptrash="${true}">
                                                <c:if test="${count lt sessionScope.F_LIMIT and fldr.isDocumentMoveTarget && (empty efolder || efolder.id ne fldr.id)}">
                                                    <option value="${fldr.id}" ${fldr.id eq efolder.parentId ? 'selected=selected' : ''}>${zm:getFolderPath(pageContext, fldr.id)}</option>
                                                <c:set var="count" value="${count+1}"/></c:if>
                                            </zm:forEachFolder>

                                        </select>
                                    </c:when>
                                    <c:when test="${st eq 'task' || st eq 'tasks'}">
                                        <input type="hidden" name="parentid" value="${not empty efolder ? efolder.parentId : mailbox.tasks.parentId}">
                                    </c:when>
                                </c:choose>
                    </div></div></div>
                    <c:if test="${ua.isiPad == false and not empty efolder}">
                        <hr size="1"/><div align="center"><input type="submit" class="zo_button delete_button" name="action${efolder.parentId eq mailbox.trash.id ? 'Hard' : ''}DeleteFolder" value="<fmt:message key="delete"/>"></div>
                    </c:if>
                    </div>
              </form>
         <a name="folders" style="padding:0px;margin:0px;"></a>
     </div>
</c:when>
<c:when test="${type eq 'search'}">
    <div class="tbl View" id="nsrchfrm" style="${hide ?'display:none':''};">
            <form action="${url}&faction=submit&" method="post" onsubmit="return submitForm(this);">
            		<c:if test="${not empty id}">
                        <c:set var="efolder" value="${zm:getFolder(pageContext, fn:escapeXml(id))}"/>
                        <input type="hidden" name="esearchid" value="${efolder.id}">
                        <input type="hidden" name="parentid" value="${efolder.parentId}">
                    </c:if>
                    
                <c:if test="${ua.isiPad == true}">
	                <div class="composeToolbar">
        				<div class="compose button"><span><input class="zo_button" type="submit" name="action${empty efolder ? 'Save' : 'Modify'}Search" value="<fmt:message key='save'/>"></span></div>
        				<c:if test="${not empty efolder}">
                        	<div class="compose button"><span><input type="submit" class="zo_button delete_button" name="action${efolder.parentId eq mailbox.trash.id ? 'Hard' : ''}DeleteSearch" value="<fmt:message key="delete"/>"></span></div>
                    	</c:if>
                    	<div class="header alignLeft" style="margin-left: 25%;">
		                <div class="subject">
		                    <fmt:message key="folderCreateSearch"/>
		                </div>
	                </div>
		        		<div class="buttonRight button" onclick="return toggleCompose('compose-pop','veil');"><span><fmt:message key="cancel"/></span></div>
    				</div>
	                
                </c:if>
                    <input type="hidden" name="doFolderAction" value="1">
                    <input name="crumb" type="hidden" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
                    <input name="st" type="hidden" value="${fn:escapeXml(st)}"/>
                    <c:if test="${empty id}"><input type="hidden" name="parentid" value="${mailbox.inbox.parentId}"></c:if>
                    ${ua.isiPad eq true ? '<div class="Stripes cmp_container composeFields">' : '<div class="msgBody">'}
                    <div class="tbl" width="100%">
                        <div class="tr">
                        <span class="label td"> <fmt:message key="nameLabel"/>  <input type="text" name="sname" ${ua.isiPad eq true ? 'style="width:50%;"' : 'style="width:100px;"'}  class="Textarea" value="${efolder.name}">
                            <c:if test="${ua.isiPad == false}"><input class="zo_button" type="submit" name="action${empty efolder ? 'Save' : 'Modify'}Search" value="<fmt:message key='save'/>"></c:if>
                        </span>
                        </div>
                    </div>
                    <div class="tbl" width="100%"><div class="tr"><span class="label td"> <fmt:message key="searchQueryLabel"/> <input type="text" name="query" ${ua.isiPad eq true ? 'style="width:50%;"' : 'style="width:100px; height; 70px;"'}  class="Textarea" value="${efolder.query}"> </span></div></div>
                    <c:if test="${not empty efolder and ua.isiPad == false}"><hr size="1"/>
                        <div align="center"><input type="submit" class="zo_button delete_button" name="action${efolder.parentId eq mailbox.trash.id ? 'Hard' : ''}DeleteSearch" value="<fmt:message key="delete"/>"></div>
                    </c:if>
                    </div>
            </form>
            <a name="searches" style="padding:0px;margin:0px;"></a>
    </div>
</c:when>
<c:when test="${type eq 'tag'}">
    <div class="tbl View" id="ntagfrm" style="${hide ? 'display:none' : ''};">
        <form action="${url}&faction=submit&" method="post" onsubmit="return submitForm(this);">
        			<c:if test="${not empty id}">
                        <c:set var="etag" value="${zm:getTag(pageContext, fn:escapeXml(id))}"/>
                        <input type="hidden" name="etagid" value="${etag.id}">
                    </c:if>
                    
                    <c:if test="${ua.isiPad == true}">
	                    <div class="composeToolbar">
	        				<div class="compose button"><span><input type="submit" class="zo_button" name="action${empty etag ? 'Save':'Modify'}Tag" value="<fmt:message key='save'/>"></span></div>
	        				<c:if test="${not empty etag}"><div class="compose button"><span><input type="submit" class="zo_button delete_button" name="actionDeleteTag" value="<fmt:message key="delete"/>"></span></div></c:if>
			        		<div class="header alignLeft" style="margin-left: 25%;">
		                    <div class="subject">
		                        <fmt:message key="createTag"/>
		                    </div>
	                    	</div>
			        		<div class="buttonRight button" onclick="return toggleCompose('compose-pop','veil');"><span><fmt:message key="cancel"/></span></div>
	    				</div>
	                    
                    </c:if>
                    <input type="hidden" name="doFolderAction" value="1">
                    <input name="crumb" type="hidden" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
                    
                    ${ua.isiPad eq true ? '<div class="Stripes cmp_container composeFields">' : '<div class="msgBody">'}
                    <div class="tbl"><div class="tr">
                        <span class="label td"><fmt:message key="nameLabel"/>
                        <input type="text" ${ua.isiPad eq true ? 'style="width:50%;"' : 'style="width:100px;"'} class="Textarea" name="tag_name" value="${zm:cook(etag.name)}">
                        <c:if test="${ua.isiPad == false}"><input type="submit" class="zo_button" name="action${empty etag ? 'Save':'Modify'}Tag" value="<fmt:message key='save'/>"></c:if>
                        </span>
                    </div></div> 
                    <div class="tbl"><div class="tr">
                   
                    <div class="td label"><fmt:message key="tagColor"/>: 
                                <select name="tag_color">
                                    <optgroup label="<fmt:message key='color'/>">
                                        <option value="<fmt:message key="colorCyan"/>" ${etag.color eq 'cyan' ? 'selected=selected' : ''}>
                                            <fmt:message key="cyan"/></option>
                                        <option value="<fmt:message key="colorBlue"/>" ${etag.color eq 'blue' ? 'selected=selected' : ''}>
                                            <fmt:message key="blue"/></option>
                                        <option value="<fmt:message key="colorPurple"/>" ${etag.color eq 'purple' ? 'selected=selected' : ''}>
                                            <fmt:message key="purple"/></option>
                                        <option value="<fmt:message key="colorRed"/>" ${etag.color eq 'red' ? 'selected=selected' : ''}>
                                            <fmt:message key="red"/></option>
                                        <option value="<fmt:message key="colorOrange"/>" ${etag.color eq 'orange' ? 'selected=selected' : ''}>
                                            <fmt:message key="orange"/></option>
                                        <option value="<fmt:message key="colorYellow"/>" ${etag.color eq 'yellow' ? 'selected=selected' : ''}>
                                            <fmt:message key="yellow"/></option>
                                        <option value="<fmt:message key="colorGreen"/>" ${etag.color eq 'green' ? 'selected=selected' : ''}>
                                            <fmt:message key="green"/></option>
                                    </optgroup>
                                </select>
                    </div></div></div>
                    <c:if test="${not empty etag and ua.isiPad == false}"><hr size="1"/><div align="center"><input type="submit" class="zo_button delete_button" name="actionDeleteTag" value="<fmt:message key="delete"/>"></div></c:if>
                    </div>
                </form>
        <a name="tags" style="padding:0px;margin:0px;"></a>
    </div>
</c:when>
</c:choose>
