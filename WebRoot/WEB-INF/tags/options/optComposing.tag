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
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table width="100%">
    <tr>
        <td>
        <table class="ZOptionsSectionTable" width="100%">
            <tr class="ZOptionsHeaderRow">
                <td class="ImgPrefsHeader_L">&nbsp;</td>
                <td class='ZOptionsHeader ImgPrefsHeader' >
                    <fmt:message key="optionsComposingMessages"/>
                </td>
                <td class="ImgPrefsHeader_R">&nbsp;</td>
            </tr>
         </table>
        <table width="100%" class="ZOptionsSectionMain" cellspacing="6">
        <tr>
            <td class='ZOptionsTableLabel'>
                <label><fmt:message key="optionsCompose"/>:</label>
            </td>
            <td>
                <table class="ZPropertySheet" cellspacing="6">
                    <tr>
                        <td>
                            <input id="composeAsHTML" type="radio" name="zimbraPrefComposeFormat" value="html" 
								<c:if test="${mailbox.prefs.composeFormat eq 'html'}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="composeAsHTML"><fmt:message key="optionsComposeAsHTML"/></label>
                        </td>
                        <td class='ZOptionsTableLabel' style='width:50px;'>
                            <label for="composeFont"><fmt:message key="optionsComposeFont"/>:</label>
                        </td>
                        <td>
                            <c:set var="fontStyle" value="${fn:replace(mailbox.prefs.htmlEditorDefaultFontFamily,', ',',')}"/>
                            <select name="zimbraPrefHtmlEditorDefaultFontFamily" id="composeFont">
                                <option<c:if test="${fontStyle eq 'arial,helvetica,sans-serif'}"> selected</c:if> value="arial,helvetica,sans-serif">Sans Serif</option>
                                <option<c:if test="${fontStyle eq 'times new roman,new york,times,serif'}"> selected</c:if> value="times new roman,new york,times,serif">Serif</option>
                                <option<c:if test="${fontStyle eq 'arial black,avant garde'}"> selected</c:if> value="arial black,avant garde">Wide Block</option>
                                <option<c:if test="${fontStyle eq 'courier new,courier,monaco,monospace,sans-serif'}"> selected</c:if> value="courier new,courier,monaco,monospace,sans-serif">Monospaced</option>                                
                                <option<c:if test="${fontStyle eq 'comic sans ms,comic sans,sans-serif'}"> selected</c:if> value="comic sans ms,comic sans,sans-serif">Comic</option>
                                <option<c:if test="${fontStyle eq 'lucida console,sans-serif'}"> selected</c:if> value="lucida console,sans-serif">Console</option>
                                <option<c:if test="${fontStyle eq 'garamond,new york,times,serif'}"> selected</c:if> value="garamond,new york,times,serif">Garamond</option>
                                <option<c:if test="${fontStyle eq 'georgia,serif'}"> selected</c:if> value="georgia,serif">Elegant</option>
                                <option<c:if test="${fontStyle eq 'tahoma,new york,times,serif'}"> selected</c:if> value="tahoma,new york,times,serif">Professional</option>
                                <option<c:if test="${fontStyle eq 'terminal,monaco'}"> selected</c:if> value="terminal,monaco">Terminal</option>
                                <option<c:if test="${fontStyle eq 'trebuchet ms,sans-serif'}"> selected</c:if> value="trebuchet ms,sans-serif">Modern</option>
                                <option<c:if test="${fontStyle eq 'verdana,helvetica,sans-serif'}"> selected</c:if> value="verdana,helvetica,sans-serif">Wide</option>
                            </select>
                        </td>
                        <td class='ZOptionsTableLabel' style='width:50px;'>
                            <label for="composeSize"><fmt:message key="optionsComposeSize"/>:</label>
                        </td>
                        <td>
                            <select name="zimbraPrefHtmlEditorDefaultFontSize" id="composeSize">
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontSize eq '8pt'}"> selected</c:if> value="8pt">8pt</option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontSize eq '10pt'}"> selected</c:if> value="10pt">10pt</option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontSize eq '12pt'}"> selected</c:if> value="12pt">12pt</option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontSize eq '14pt'}"> selected</c:if> value="14pt">14pt</option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontSize eq '18pt'}"> selected</c:if> value="18pt">18pt</option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontSize eq '24pt'}"> selected</c:if> value="24pt">24pt</option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontSize eq '36pt'}"> selected</c:if> value="36pt">36pt</option>
                            </select>
                        </td>
                         <td class='ZOptionsTableLabel' style='width:50px;'>
                            <label for="composeColor"><fmt:message key="optionsComposeColor"/>:</label>
                        </td>
                        <td>
                            <select name="zimbraPrefHtmlEditorDefaultFontColor" id="composeColor">
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontColor eq '#000000'}"> selected</c:if> value="#000000"><fmt:message key="black"/></option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontColor eq '#0033FF'}"> selected</c:if> value="#0033FF"><fmt:message key="blue"/></option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontColor eq '#00E3E3'}"> selected</c:if> value="#00E3E3"><fmt:message key="cyan"/></option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontColor eq '#00CC00'}"> selected</c:if> value="#00CC00"><fmt:message key="green"/></option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontColor eq '#7300CC'}"> selected</c:if> value="#7300CC"><fmt:message key="purple"/></option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontColor eq '#FF0000'}"> selected</c:if> value="#FF0000"><fmt:message key="red"/></option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontColor eq '#FFFF00'}"> selected</c:if> value="#FFFF00"><fmt:message key="yellow"/></option>
                                <option <c:if test="${mailbox.prefs.htmlEditorDefaultFontColor eq '#FF6600'}"> selected</c:if> value="#FF6600"><fmt:message key="orange"/></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <input id="composeAsText" type="radio" name="zimbraPrefComposeFormat" value="text" 
								<c:if test="${mailbox.prefs.composeFormat eq 'text'}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="composeAsText"><fmt:message key="optionsComposeAsText"/></label>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <app:optSeparator/>
        <tr>
            <td class='ZOptionsTableLabel'>&nbsp;
            </td>
            <td>
                <app:optCheckbox boxfirst="true" trailingcolon="false" label="optionsReplyForwardInSameFormat" 
					pref="zimbraPrefForwardReplyInOriginalFormat" checked="${mailbox.prefs.forwardReplyInOriginalFormat}"/>
            </td>
        </tr>
        <app:optSeparator/>
        <tr>
            <td class='ZOptionsTableLabel'>
                <label><fmt:message key="optionsReplyReplyAll"/>:</label>
            </td>
            <td>
                <label><fmt:message key="optionsWhenReplying"/>:</label>
            </td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel'>&nbsp;</td>
            <td>
                <table>
                    <tr>
                        <td>
                            <input id="replyIncludeBody" type="radio" name="zimbraPrefReplyIncludeOriginalText" value="includeBody" 
								<c:if test="${mailbox.prefs.replyIncludeBody}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="replyIncludeBody"><fmt:message key="optionsIncludeBody"/></label>
                        </td>
                        <td>
                            <input id="replyIncludeBodyWithPrefix" type="radio" name="zimbraPrefReplyIncludeOriginalText" value="includeBodyWithPrefix" 
								<c:if test="${mailbox.prefs.replyIncludeBodyWithPrefx}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="replyIncludeBodyWithPrefix"><fmt:message key="optionsIncludeBodyWithPrefix"/></label>
                        </td>
                        <td>
                            <input id="replyIncludeAsAttachment" type="radio" name="zimbraPrefReplyIncludeOriginalText" value="includeAsAttachment" 
								<c:if test="${mailbox.prefs.replyIncludeAsAttachment}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="replyIncludeAsAttachment"><fmt:message key="optionsIncludeAsAttachment"/></label>
                        </td>
                        <td>
                            <input id="replyIncludeNone" type="radio" name="zimbraPrefReplyIncludeOriginalText" value="includeNone" 
								<c:if test="${mailbox.prefs.replyIncludeNone}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="replyIncludeNone"><fmt:message key="optionsIncludeNone"/></label>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <app:optSeparator/>
        <tr>
            <td class='ZOptionsTableLabel'>
                <label><fmt:message key="optionsForward"/>:</label>
            </td>
            <td>
                <label><fmt:message key="optionsWhenForwarding"/>:</label>
            </td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel'>&nbsp;</td>
            <td>
                <table>
                    <tr>
                        <td>
                            <input id="forwardIncludeBody" type="radio" name="zimbraPrefForwardIncludeOriginalText" value="includeBody" 
								<c:if test="${mailbox.prefs.forwardIncludeBody}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="forwardIncludeBody"><fmt:message key="optionsIncludeBody"/></label>
                        </td>
                        <td>
                            <input id="forwardIncludeBodyWithPrefix" type="radio" name="zimbraPrefForwardIncludeOriginalText" value="includeBodyWithPrefix" 
								<c:if test="${mailbox.prefs.forwardIncludeBodyWithPrefx}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="forwardIncludeBodyWithPrefix"><fmt:message key="optionsIncludeBodyWithPrefix"/></label>
                        </td>
                        <td>
                            <input id="forwardIncludeAsAttachment" type="radio" name="zimbraPrefForwardIncludeOriginalText" value="includeAsAttachment" 
								<c:if test="${mailbox.prefs.forwardIncludeAsAttachment}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="forwardIncludeAsAttachment"><fmt:message key="optionsIncludeAsAttachment"/></label>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <app:optSeparator/>
        <tr>
            <td class='ZOptionsTableLabel'>
                <label><fmt:message key="optionsPrefixChar"/>:</label>
            </td>
            <td>
                <label for="prefixText"><fmt:message key="prefixTextWith"/>:</label>
            </td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel'>&nbsp;</td>
            <td>
                <select name="zimbraPrefForwardReplyPrefixChar" id="prefixText">
                    <option <c:if test="${mailbox.prefs.forwardReplyPrefixChar eq '>'}"> selected</c:if> value="&gt;">
                        &gt;
                    </option>
                    <option <c:if test="${mailbox.prefs.forwardReplyPrefixChar eq '|'}"> selected</c:if> value="|">
                        |
                    </option>
                </select>
            </td>
        </tr>
        <app:optSeparator/>
        <tr>
            <td class='ZOptionsTableLabel'>
                <label><fmt:message key="optionsSentMessages"/>:</label>
            </td>
            <td>
                <table>
                    <tr>
                        <td>
                            <input id="saveSent" type="radio" name="zimbraPrefSaveToSent" value="TRUE" 
								<c:if test="${mailbox.prefs.saveToSent}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="saveSent"><fmt:message key="optionsSaveSent"/></label>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel'>&nbsp;</td>
            <td>
                <table>
                    <tr>
                        <td>
                            <input id="dontSave" type="radio" name="zimbraPrefSaveToSent" value="FALSE" 
								<c:if test="${not mailbox.prefs.saveToSent}">checked</c:if>/>
                        </td>
                        <td>
                            <label for="dontSave"><fmt:message key="optionsDontSaveSent"/></label>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <app:optSeparator/>
        <tr>
			<td colspan='2' class='ZOptionsTableField' style='text-align:center;font-weight:bold;width:auto;'>
                <fmt:message key="optionsManageAccounts">
                    <fmt:param><fmt:message key="optionsComposeManageAccountsPre"/></fmt:param><fmt:param><a href="options?selected=accounts"><fmt:message key="optionsManageAccountsLink"/></a></fmt:param><fmt:param><fmt:message key="optionsManageAccountsPost"/></fmt:param>
                </fmt:message>
            </td>
        </tr>
        <tr>
            <td colspan="2">&nbsp;</td>
        </tr>
     </table>
</td>
</tr>
</table>
