<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010 Zimbra, Inc.
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
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="title" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="isgroup" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:if test="${zm:actionSet(param, 'actionNew')}"><input type="hidden" name="actionNew" value="true"/></c:if>
<c:if test="${zm:actionSet(param, 'actionNewGroup')}"><input type="hidden" name="actionNewGroup" value="true"/></c:if>
<c:if test="${zm:actionSet(param, 'actionEdit')}"><input type="hidden" name="actionEdit" value="true"/></c:if>
<table width=100% cellspacing=0 cellpadding=0>
    <tr class='contactHeaderRow'>
        <td class="ZhBottomSep" width=20 align="center">
            <app:img src="${contact.isGroup or isgroup ? 'contacts/ImgGroup.png' : 'contacts/ImgContact.png'}" altkey="${contact.isGroup or isgroup ? 'ALT_CONTACT_GROUP' : 'ALT_CONTACT_CONTACT'}"/>
        </td>
        <td class='ZhBottomSep contactHeader'>${fn:escapeXml(title)}</td>
    </tr>
</table>
<c:choose>
    <c:when test="${contact.isGroup or isgroup}">
        <table border="0" cellpadding="0" cellspacing="3" width="100%">
        <tr><td>
                <table border="0" cellpadding="0" cellspacing="3" width="100%">
                    <tr>
                        <td class="editContactGroupLabel"><label for="nickname"><fmt:message key="AB_GROUP_NAME"/>:</label>
                            <input name='isgroup' type='hidden' value="true"/>
                            <input name='nickname' id="nickname" type='text' autocomplete='off' size='35' value="${fn:escapeXml(not empty param.nickname ? param.nickname : contact.nickname)}">
                        </td>
						<td align=right>
							<table  border="0" cellspacing='5'>
								<tbody>
									<tr>
										<td valign='center' class="editContactLabel"><label for="folderSelect"><fmt:message key="addressBook"/> :</label></td>
										<td>
											<input type="hidden" name="origFolderId" value="${empty contact ? '': contact.folderId}"/>
											<select name="folderid" id="folderSelect">
												<zm:forEachFolder var="folder">
													<c:if test="${folder.isContactCreateTarget}">
														<option <c:if test="${(empty contact and ((context.selectedId eq folder.id) or (empty context.selectedId and folder.isContacts))) or (!empty contact and contact.folderId eq folder.id)}">selected </c:if> value="${folder.id}" />
														${zm:getFolderName(pageContext, folder.id)}
													</c:if>
												</zm:forEachFolder>
											</select>
										</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>
                </table>
            </td>
        </tr>
        <tr><td class="List">
                <c:set var="contactValues" value="${empty paramValues.dlist ? contact.groupMembers : paramValues.dlist}"/>
                <table class="topborder" cellpadding="2" cellspacing="0" width="100%">
                    <tr valign="top">
                        <th width="4%">
                              &nbsp;&nbsp;
                        </th>
                        <th width="96%">
                             <fmt:message key="AB_GROUP_MEMBERS"/>
                        </th>
                    </tr>
                    <c:forEach var="gMember" items="${requestScope.groupSearchContacts}">
                    <tr>
                        <td><input checked name="dlist" value="${fn:escapeXml(gMember)}" type="checkbox"></td>
                        <td>${fn:escapeXml(gMember)}</td>
                    </tr>
                    </c:forEach>
                    <c:forEach var="gMember" items="${contactValues}">
                    <tr>
                        <td><input checked name="dlist" value="${fn:escapeXml(gMember)}" type="checkbox"></td>
                        <td>${fn:escapeXml(gMember)}</td>
                    </tr>
                    </c:forEach>
                </table>
                <c:if test="${empty contactValues and empty requestScope.groupSearchContacts}">
                    <div class="NoResults"><fmt:message key="addMembers"/></div>
                </c:if>
            </td>

        </tr>
        <tr><td>
               <c:if test="${not empty contactValues or not empty requestScope.groupSearchContacts}">
                    <fmt:message key="uncheckToRemoveMembers"/>
               </c:if>
            </td>
        </tr>
        </table>
    </c:when>
    <c:otherwise>
        <table border="0" cellpadding="0" cellspacing="3" width="100%">
        <tr><td valign='center' class="editContactLabel"><label for="folderIdSelect"><fmt:message key="addressBook"/> :</label></td>
            <td><input type="hidden" name="origFolderId" value="${empty contact ? '': contact.folderId}"/>
                <select name="folderid" id="folderIdSelect">
                    <zm:forEachFolder var="folder">
                        <c:if test="${folder.isContactCreateTarget}">
                            <option <c:if test="${(empty contact and ((context.selectedId eq (folder.isMountPoint ? folder.canonicalId : folder.id)) or (empty context.selectedId and folder.isContacts)))
                            or (!empty contact and (contact.folderId eq (folder.isMountPoint ? folder.canonicalId : folder.id)))}">selected </c:if> value="${folder.id}">
                            ${zm:getFolderName(pageContext, folder.id) }</option>
                        </c:if>
                    </zm:forEachFolder>
                </select>
            </td>
            <td valign='center' class="editContactLabel"><label for="fileAs"><fmt:message key="fileAs"/> :</label></td>
            <td><c:set var="selected" value="${empty contact? '1' : contact.fileAs}"/>
                <select name="fileAs" id="fileAs">
                    <option <c:if test="${selected eq '1'}">selected</c:if> value="1"><fmt:message key="AB_FILE_AS_lastFirst"/></option>
                    <option <c:if test="${selected eq '2'}">selected</c:if> value="2"><fmt:message key="AB_FILE_AS_firstLast"/></option>
                    <option <c:if test="${selected eq '3'}">selected</c:if> value="3"><fmt:message key="AB_FILE_AS_company"/></option>
                    <option <c:if test="${selected eq '4'}">selected</c:if> value="4"><fmt:message key="AB_FILE_AS_lastFirstCompany"/></option>
                    <option <c:if test="${selected eq '5'}">selected</c:if> value="5"><fmt:message key="AB_FILE_AS_firstLastCompany"/></option>
                    <option <c:if test="${selected eq '6'}">selected</c:if> value="6"><fmt:message key="AB_FILE_AS_companyLastFirst"/></option>
                    <option <c:if test="${selected eq '7'}">selected</c:if> value="7"><fmt:message key="AB_FILE_AS_companyFirstLast"/></option>
                </select>
            </td>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="lastName"/>
            <app:contactEditField contact="${contact}" field="phoneticLastName"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="firstName"/>
            <app:contactEditField contact="${contact}" field="phoneticFirstName"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="middleName"/></tr>
        <tr><app:contactEditField contact="${contact}" field="jobTitle"/></tr>
        <tr><app:contactEditField contact="${contact}" field="company"/>
            <app:contactEditField contact="${contact}" field="phoneticCompany"/>
        </tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="email"/></td></tr>

        <tr><app:contactEditField contact="${contact}" field="email"/></tr>
        <tr><app:contactEditField contact="${contact}" field="email2"/></tr>
        <tr><app:contactEditField contact="${contact}" field="email3"/></tr>

        <tr><td><br></td></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="work"/></td></tr>

        <tr><app:contactEditField contact="${contact}" field="workStreet" address="true"/>
            <app:contactEditField contact="${contact}" field="workPhone"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workCity"/>
            <app:contactEditField contact="${contact}" field="workPhone2"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workState"/>
            <app:contactEditField contact="${contact}" field="workFax"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workPostalCode"/>
            <app:contactEditField contact="${contact}" field="assistantPhone"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workCountry"/>
            <app:contactEditField contact="${contact}" field="companyPhone"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workURL"/>
            <app:contactEditField contact="${contact}" field="callbackPhone"/>
        </tr>

        <tr><td><br></td></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="home"/></td></tr>

        <tr><app:contactEditField contact="${contact}" field="homeStreet" address="true"/>
            <app:contactEditField contact="${contact}" field="homePhone"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homeCity"/>
            <app:contactEditField contact="${contact}" field="homePhone2"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homeState"/>
            <app:contactEditField contact="${contact}" field="homeFax"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homePostalCode"/>
            <app:contactEditField contact="${contact}" field="mobilePhone"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homeCountry"/>
            <app:contactEditField contact="${contact}" field="pager"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homeURL"/>
            <app:contactEditField contact="${contact}" field="carPhone"/>
        </tr>

        <tr><td><br></td></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="other"/></td></tr>

        <tr><app:contactEditField contact="${contact}" field="otherStreet" address="true"/>
            <app:contactEditField contact="${contact}" field="otherPhone"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="otherCity"/>
            <app:contactEditField contact="${contact}" field="otherFax"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="otherState"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="otherPostalCode"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="otherCountry"/>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="otherURL"/>
        </tr>

        <tr><td><br></td></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><label for="notes"><fmt:message key="notes"/></label></td></tr>

        <tr><td colspan="4">
                <textarea id="notes" rows="8" cols="60" style="width:90%" name="notes">${contact != null ? contact.notes : ''}</textarea>
            </td>
        </tr>
        </table>
    </c:otherwise>
</c:choose>
</td>
</tr>
</table>