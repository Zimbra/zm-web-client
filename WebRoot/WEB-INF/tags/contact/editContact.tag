<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011 Zimbra, Inc.
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
        <td class='ZhBottomSep contactHeader'>
            <c:set var="fileAsStr"><app:contactFileAs contact="${contact}" ruby="true" /></c:set>
            ${fileAsStr}
        </td>
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
        <input type="hidden" name="fullName" value="${fn:escapeXml(not empty contact ? contact.fullName : '')}" />
        <input type="hidden" name="nickname" value="${fn:escapeXml(not empty contact ? contact.nickname : '')}" />
        <table border="0" cellpadding="0" cellspacing="3" width="100%">
        <tr><td valign='center' class="editContactLabel"><label for="folderIdSelect"><fmt:message key="addressBook"/> :</label></td>
            <td><input type="hidden" name="origFolderId" value="${empty contact ? '': contact.folderId}"/>
                <select name="folderid" id="folderIdSelect" tabindex=100>
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
                <select name="fileAs" id="fileAs" tabindex=150>
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
        <%-- NOTE: fmt:getLocale is a non-standard tag --%>
        <fmt:getLocale var="locale" />
        <c:set var="showPhoneticFields" value="${locale.language eq 'ja'}" />
        <tr><app:contactEditField contact="${contact}" field="lastName" tabindex="101" />
            <c:if test="${showPhoneticFields}">
                <app:contactEditField contact="${contact}" field="phoneticLastName" tabindex="151" />
            </c:if>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="firstName" tabindex="102" />
            <c:if test="${showPhoneticFields}">
                <app:contactEditField contact="${contact}" field="phoneticFirstName" tabindex="152" />
            </c:if>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="middleName" tabindex="103"/></tr>
        <tr><app:contactEditField contact="${contact}" field="company" tabindex="104" />
            <c:if test="${showPhoneticFields}">
                <app:contactEditField contact="${contact}" field="phoneticCompany" tabindex="154" />
            </c:if>
        </tr>
        <tr><app:contactEditField contact="${contact}" field="jobTitle" tabindex="105" /></tr>
        <tr><app:contactEditField contact="${contact}" field="department" label="AB_FIELD_otherDepartment" tabindex="106" /></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="email"/></td></tr>

        <tr><app:contactEditField contact="${contact}" field="email" tabindex="200" /></tr>
        <tr><app:contactEditField contact="${contact}" field="email2" tabindex="201" /></tr>
        <tr><app:contactEditField contact="${contact}" field="email3" tabindex="202" /></tr>

        <tr><td><br></td></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="work"/></td></tr>

        <tr><app:contactEditField contact="${contact}" field="workStreet" address="true" tabindex="300" />
            <app:contactEditField contact="${contact}" field="workPhone" tabindex="350" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workCity" tabindex="301" />
            <app:contactEditField contact="${contact}" field="workPhone2" tabindex="351" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workState" tabindex="302" />
            <app:contactEditField contact="${contact}" field="workFax" tabindex="352" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workPostalCode" tabindex="303" />
            <app:contactEditField contact="${contact}" field="assistantPhone" tabindex="353" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workCountry" tabindex="304" />
            <app:contactEditField contact="${contact}" field="companyPhone" tabindex="354" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="workURL" tabindex="305" />
            <app:contactEditField contact="${contact}" field="callbackPhone" tabindex="355" />
        </tr>

        <tr><td><br></td></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="home"/></td></tr>

        <tr><app:contactEditField contact="${contact}" field="homeStreet" address="true" tabindex="400" />
            <app:contactEditField contact="${contact}" field="homePhone" tabindex="450" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homeCity" tabindex="401" />
            <app:contactEditField contact="${contact}" field="homePhone2" tabindex="451" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homeState" tabindex="402" />
            <app:contactEditField contact="${contact}" field="homeFax" tabindex="452" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homePostalCode" tabindex="403" />
            <app:contactEditField contact="${contact}" field="mobilePhone" tabindex="453" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homeCountry" tabindex="404" />
            <app:contactEditField contact="${contact}" field="pager" tabindex="454" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="homeURL" tabindex="405" />
            <app:contactEditField contact="${contact}" field="carPhone" tabindex="455" />
        </tr>

        <tr><td><br></td></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="other"/></td></tr>

        <tr><app:contactEditField contact="${contact}" field="otherStreet" address="true" tabindex="500" />
            <app:contactEditField contact="${contact}" field="otherPhone" tabindex="550" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="otherCity" tabindex="501" />
            <app:contactEditField contact="${contact}" field="otherFax" tabindex="551" />
        </tr>
        <tr><app:contactEditField contact="${contact}" field="otherState" tabindex="502" /></tr>
        <tr><app:contactEditField contact="${contact}" field="otherPostalCode" tabindex="503" /></tr>
        <tr><app:contactEditField contact="${contact}" field="otherCountry" tabindex="504" /></tr>
        <tr><app:contactEditField contact="${contact}" field="otherURL" tabindex="505" /></tr>

        <tr><td><br></td></tr>

        <tr><td colspan="4" class="sectionLabel" valign="top"><label for="notes"><fmt:message key="notes"/></label></td></tr>

        <tr><td colspan="4">
                <textarea id="notes" rows="8" cols="60" style="width:90%" name="notes" tabindex="600">${contact != null ? contact.notes : ''}</textarea>
            </td>
        </tr>
        </table>
    </c:otherwise>
</c:choose>
</td>
</tr>
</table>