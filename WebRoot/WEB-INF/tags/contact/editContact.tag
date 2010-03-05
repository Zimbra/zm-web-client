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

<c:set var="noDisplayAs"><fmt:message key="noDisplayAs"/></c:set>

<c:if test="${zm:actionSet(param, 'actionNew')}"><input type="hidden" name="actionNew" value="true"/></c:if>
<c:if test="${zm:actionSet(param, 'actionNewGroup')}"><input type="hidden" name="actionNewGroup" value="true"/></c:if>
<c:if test="${zm:actionSet(param, 'actionEdit')}"><input type="hidden" name="actionEdit" value="true"/></c:if>
<table width=100% cellspacing=0 cellpadding=0>
<tr>
    <td class='ZhBottomSep'>
        <table width=100% cellspacing=0 cellpadding=0>
            <tr class='contactHeaderRow'>
                <td width=20><center><app:img src="${contact.isGroup or isgroup ? 'contacts/ImgGroup.gif' : 'contacts/ImgContact.gif'}" altkey="${contact.isGroup or isgroup ? 'ALT_CONTACT_GROUP' : 'ALT_CONTACT_CONTACT'}"/></center></td>
                <td class='contactHeader'>${fn:escapeXml(title)}
                </td>
            </tr>
        </table>
    </td>
</tr>
<tr>
<td>
<table border="0" cellpadding="0" cellspacing="3" width="100%">
    <tbody>
    <c:choose>
    <c:when test="${contact.isGroup or isgroup}">
        <tr>
            <td>
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
        <tr>
            <td class="List">
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
        <tr>
            <td>
               <c:if test="${not empty contactValues or not empty requestScope.groupSearchContacts}">
                    <fmt:message key="uncheckToRemoveMembers"/>
               </c:if>
            </td>
        </tr>
    </c:when>
    <c:otherwise>
        <tr>
            <td width="5">&nbsp;</td>
            <td valign="top" width="385">
                 <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_lastName" contact="${contact}" field="lastName"/>
                        <app:contactEditField label="AB_FIELD_firstName" contact="${contact}" field="firstName"/>
                        <app:contactEditField label="AB_FIELD_middleName" contact="${contact}" field="middleName"/>
                        <tr>
                            <td valign='center' class="editContactLabel"><label for="fileAs"><fmt:message key="fileAs"/> :</label></td>
                            <td>
                                <c:set var="selected" value="${empty contact? '1' : contact.fileAs}"/>
                                <select name="fileAs" id="fileAs">
                                    <option <c:if test="${selected eq '1'}">selected</c:if> value="1"><fmt:message key="AB_FILE_AS_lastFirst"/>
                                    <option <c:if test="${selected eq '2'}">selected</c:if> value="2"><fmt:message key="AB_FILE_AS_firstLast"/>
                                    <option <c:if test="${selected eq '3'}">selected</c:if> value="3"><fmt:message key="AB_FILE_AS_company"/>
                                    <option <c:if test="${selected eq '4'}">selected</c:if> value="4"><fmt:message key="AB_FILE_AS_lastFirstCompany"/>
                                    <option <c:if test="${selected eq '5'}">selected</c:if> value="5"><fmt:message key="AB_FILE_AS_firstLastCompany"/>
                                    <option <c:if test="${selected eq '6'}">selected</c:if> value="6"><fmt:message key="AB_FILE_AS_companyLastFirst"/>
                                    <option <c:if test="${selected eq '7'}">selected</c:if> value="7"><fmt:message key="AB_FILE_AS_companyFirstLast"/>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                 </table>
            </td>
            <td valign="top">
                <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_jobTitle" contact="${contact}" field="jobTitle"/>
                        <app:contactEditField label="AB_FIELD_company" contact="${contact}" field="company"/>
                        <tr>
                            <td valign='center' class="editContactLabel"><label for="folderIdSelect"><fmt:message key="addressBook"/> :</label></td>
                            <td>
                                <input type="hidden" name="origFolderId" value="${empty contact ? '': contact.folderId}"/>
                                <select name="folderid" id="folderIdSelect">
                                    <zm:forEachFolder var="folder">
                                        <c:if test="${folder.isContactCreateTarget}">
                                            <option <c:if test="${(empty contact and ((context.selectedId eq folder.id) or (empty context.selectedId and folder.isContacts))) or (!empty contact and contact.folderId eq folder.id)}">selected </c:if> value="${folder.id}">
                                            ${zm:getFolderName(pageContext, folder.id) }</option>     
                                        </c:if>
                                    </zm:forEachFolder>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="email"/></td></tr>
        <tr>
            <td width="5">&nbsp;</td>
            <td valign="top" width="385">
                 <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_email" contact="${contact}" field="email"/>
                        <app:contactEditField label="AB_FIELD_email2" contact="${contact}" field="email2"/>
                        <app:contactEditField label="AB_FIELD_email3" contact="${contact}" field="email3"/>
                    </tbody>
                 </table>
            </td>
            <td valign="top">
                <table width=100% border="0" cellspacing='5'>
                    <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td><br></td>
        </tr>
        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="work"/></td></tr>
        <tr>
            <td width="5">&nbsp;</td>
            <td valign="top" width="385">
                 <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_workStreet" contact="${contact}" field="workStreet" address="true"/>
                        <app:contactEditField label="AB_FIELD_workCity" contact="${contact}" field="workCity"/>
                        <app:contactEditField label="AB_FIELD_workState" contact="${contact}" field="workState"/>
                        <app:contactEditField label="AB_FIELD_workPostalCode" contact="${contact}" field="workPostalCode"/>
                        <app:contactEditField label="AB_FIELD_workCountry" contact="${contact}" field="workCountry"/>
                        <app:contactEditField label="AB_FIELD_workURL" contact="${contact}" field="workURL"/>
                    </tbody>
                 </table>
            </td>
            <td valign="top">
                <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_workPhone" contact="${contact}" field="workPhone"/>
                        <app:contactEditField label="AB_FIELD_workPhone2" contact="${contact}" field="workPhone2"/>
                        <app:contactEditField label="AB_FIELD_workFax" contact="${contact}" field="workFax"/>
                        <app:contactEditField label="AB_FIELD_assistantPhone" contact="${contact}" field="assistantPhone"/>
                        <app:contactEditField label="AB_FIELD_companyPhone" contact="${contact}" field="companyPhone"/>
                        <app:contactEditField label="AB_FIELD_callbackPhone" contact="${contact}" field="callbackPhone"/>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td><br></td>
        </tr>
        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="home"/></td></tr>
        <tr>
            <td width="5">&nbsp;</td>
            <td valign="top" width="385">
                 <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_homeStreet" contact="${contact}" field="homeStreet" address="true"/>
                        <app:contactEditField label="AB_FIELD_homeCity" contact="${contact}" field="homeCity"/>
                        <app:contactEditField label="AB_FIELD_homeState" contact="${contact}" field="homeState"/>
                        <app:contactEditField label="AB_FIELD_homePostalCode" contact="${contact}" field="homePostalCode"/>
                        <app:contactEditField label="AB_FIELD_homeCountry" contact="${contact}" field="homeCountry"/>
                        <app:contactEditField label="AB_FIELD_homeURL" contact="${contact}" field="homeURL"/>
                    </tbody>
                 </table>
            </td>
            <td valign="top">
                <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_homePhone" contact="${contact}" field="homePhone"/>
                        <app:contactEditField label="AB_FIELD_homePhone2" contact="${contact}" field="homePhone2"/>
                        <app:contactEditField label="AB_FIELD_homeFax" contact="${contact}" field="homeFax"/>
                        <app:contactEditField label="AB_FIELD_mobilePhone" contact="${contact}" field="mobilePhone"/>
                        <app:contactEditField label="AB_FIELD_pager" contact="${contact}" field="pager"/>
                        <app:contactEditField label="AB_FIELD_carPhone" contact="${contact}" field="carPhone"/>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td><br></td>
        </tr>
        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="other"/></td></tr>
        <tr>
            <td width="5">&nbsp;</td>
            <td valign="top" width="385">
                 <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_otherStreet" contact="${contact}" field="otherStreet" address="true"/>
                        <app:contactEditField label="AB_FIELD_otherCity" contact="${contact}" field="otherCity"/>
                        <app:contactEditField label="AB_FIELD_otherState" contact="${contact}" field="otherState"/>
                        <app:contactEditField label="AB_FIELD_otherPostalCode" contact="${contact}" field="otherPostalCode"/>
                        <app:contactEditField label="AB_FIELD_otherCountry" contact="${contact}" field="otherCountry"/>
                        <app:contactEditField label="AB_FIELD_otherURL" contact="${contact}" field="otherURL"/>
                    </tbody>
                 </table>
            </td>
            <td valign="top">
                <table width=100% border="0" cellspacing='5'>
                    <tbody>
                        <app:contactEditField label="AB_FIELD_otherPhone" contact="${contact}" field="otherPhone"/>
                        <app:contactEditField label="AB_FIELD_otherFax" contact="${contact}" field="otherFax"/>
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td><br></td>
        </tr>
        <tr><td colspan="4" class="sectionLabel" valign="top"><label for="notes"><fmt:message key="notes"/></label></td></tr>
        <tr>
            <td colspan="4">
                <textarea id="notes" rows="8" cols="60" style="width:90%" name="notes">${contact != null ? contact.notes : ''}</textarea>
            </td>
        </tr>
    </c:otherwise>
    </c:choose>
    </tbody>
</table>
</td>
</tr>
</table>