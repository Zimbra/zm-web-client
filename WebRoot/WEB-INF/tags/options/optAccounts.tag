<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table border="0" cellpadding="10" cellspacing="10" width="100%">
    <tr>
        <td>
            <table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr class="ZOptionsHeaderRow">
                    <td class="ImgPrefsHeader_L">
                        &nbsp;
                    </td>
                    <td class='ZOptionsHeader ImgPrefsHeader' >
                        <fmt:message key="optionsAccounts"/>
                    </td>
                    <td class="ImgPrefsHeader_R">
                        &nbsp;
                    </td>
                </tr>
            </table>
            <table cellpadding="3" cellspacing="0" width="100%" class="ZOptionsSectionMain">
                <tr>
                    <td colspan="3">
                        &nbsp;
                    </td>
                </tr>
                <tr>
                    <td width="10%">&nbsp;</td>
                    <td class='List' valign='top'>
                        <table width="100%" cellpadding="2" cellspacing="0">
                            <tr>
                                <th nowrap>&nbsp;
                                <th nowrap><fmt:message key="optionsAccountName"/>
                                <th nowrap><fmt:message key="optionsAccountEmail"/>
                                <th nowrap><fmt:message key="optionsAccountType"/>
                            </tr>
                            <tr>
                                <td nowrap>&nbsp;</td>
                                <td>${fn:escapeXml(not empty mailbox.defaultIdentity.name ? mailbox.defaultIdentity.name : mailbox.name)}</td>
                                <td>${fn:escapeXml(mailbox.name)}</td>
                                <td>
                                    <fmt:message key="optionsAccountTypePrimary"/>
                                </td>
                            </tr>
                        </table>
                    </td>
                    <td width="10%">&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="3">
                        &nbsp;
                    </td>
                </tr>
            </table>
            <br/>
            <table class="ZOptionsSectionTable" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr class="ZOptionsHeaderRow">
                    <td class="ImgPrefsHeader_L">
                        &nbsp;
                    </td>
                    <td class='ZOptionsHeader ImgPrefsHeader' >
                        <fmt:message key="optionsAccountPrimarySettings"/>
                    </td>
                    <td class="ImgPrefsHeader_R">
                        &nbsp;
                    </td>
                </tr>
             </table>
            <table cellpadding="3" cellspacing="0" width="100%" class="ZOptionsSectionMain">
            <tr>

                <td class='ZOptionsTableLabel'>
                    <fmt:message key="optionsAccountEmail"/>
                </td>
                <td class='ZOptionsHint'>
                    ${fn:escapeXml(mailbox.name)}
                </td>
            </tr>
            <tr>
                <td class='ZOptionsTableLabel'>
                    <fmt:message key="optionsAccountName"/>
                </td>
                <td>
                    <input id="zimbraPrefIdentityName" size="40" type="text" name='zimbraPrefIdentityName' value="${fn:escapeXml(mailbox.defaultIdentity.name)}">
                </td>
            </tr>
            <tr><td colspan="2"><hr></td></tr>
            <tr>
                <td class='ZOptionsTableLabel'>
                    <fmt:message key="optionsAccountFrom"/> :
                </td>
                <td>
                    <fmt:message key="optionsAccountFromChoose"/>
                    :
                </td>
            </tr>
            <tr>
                <td class='ZOptionsTableLabel'>
                    &nbsp;
                </td>
                <td style='padding-left:20px'>
                    <table border="0" cellpadding="0" cellspacing="2">
                        <tr>
                            <td>
                                <input id="mailFrom" size="30" type="text" name='zimbraPrefFromDisplay' value="${fn:escapeXml(mailbox.defaultIdentity.fromDisplay)}">
                            </td>
                            <td style='padding-left:10px'>
                                <select name="zimbraPrefFromAddress">
                                    <c:set var="fromAddr" value="${fn:toLowerCase(mailbox.defaultIdentity.fromAddress)}"/>
                                    <c:forEach var="address" items="${mailbox.accountInfo.emailAddresses}">
                                        <option
                                                <c:if test="${fn:toLowerCase(address) eq fromAddr}"> selected</c:if> value="${fn:escapeXml(address)}">
                                                ${fn:escapeXml(address)}
                                        </option>
                                    </c:forEach>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td style='padding-left:5px' class='ZOptionsHint'>
                                <fmt:message key="optionsEmailPersonalHint"/>
                            </td>
                            <td style='padding-left:15px' class='ZOptionsHint'>
                                &nbsp;
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class='ZOptionsTableLabel'>
                    <fmt:message key="optionsAccountReplyTo"/>:
                </td>
                <td>
                    <table cellspacing="0" cellpadding="0">
                        <tr>
                            <td><input type="checkbox" id="REPLYCHECKED" name='zimbraPrefReplyToEnabled' value="TRUE" <c:if test="${mailbox.defaultIdentity.replyToEnabled}">checked</c:if>></td>
                            <td style='padding-left:5px' nowrap align=right><label for="REPLYCHECKED"><fmt:message key="optionsAccountReplyToSet"/>:</label></td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td class='ZOptionsTableLabel'>
                    &nbsp;
                </td>
                <td style='padding-left:20px'>
                    <table border="0" cellpadding="0" cellspacing="2">
                        <tr>
                            <td>
                                <input id="replyToDisplay" size="30" type="text" name='zimbraPrefReplyToDisplay' value="${fn:escapeXml(mailbox.defaultIdentity.replyToDisplay)}">
                            </td>
                            <td style='padding-left:10px'>
                                <input id="replyToAddress" size="30" type="text" name='zimbraPrefReplyToAddress' value="${fn:escapeXml(mailbox.defaultIdentity.replyToAddress)}">
                            </td>
                        </tr>
                        <tr>
                            <td style='padding-left:5px' class='ZOptionsHint'>
                                <fmt:message key="optionsEmailPersonalHint"/>
                            </td>
                            <td style='padding-left:15px' class='ZOptionsHint'>
                                <fmt:message key="optionsEmailAddressHint"/>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <c:set var="maxSigs" value="${mailbox.accountInfo.attrs.zimbraSignatureMaxNumEntries[0]}"/>
            <c:if test="${maxSigs ne 0}">
                <tr><td colspan="2"><hr></td></tr>
                <tr>
                    <td class='ZOptionsTableLabel'>
                        <label for="signatureSelect"><fmt:message key="optionsAccountSignature"/>
                            :</label>
                    </td>
                    <td>
                        <select name="zimbraPrefDefaultSignatureId" id="signatureSelect">
                            <c:set var="signatureId" value="${mailbox.defaultIdentity.signatureId}"/>
                            <option value="">
                                <fmt:message key="optionsAccountNoSignature"/>
                            </option>
                            <zm:forEachSignature var="sig">
                                <!-- ${signatureId} = ${sig.id}  -->
                                <option
                                        <c:if test="${signatureId eq sig.id}">selected</c:if> value="${sig.id}">
                                        ${fn:escapeXml(sig.name)}
                                </option>
                            </zm:forEachSignature>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td class='ZOptionsTableLabel'>
                        &nbsp;
                    </td>
                    <td>
                        <fmt:message key="optionsManageSignatures">
                            <fmt:param><fmt:message key="optionsManageSignaturesPre"/></fmt:param>
                            <fmt:param><a href="options?selected=signatures"><fmt:message key="optionsManageSignaturesLink"/></a></fmt:param>
                            <fmt:param><fmt:message key="optionsManageSignaturesPost"/></fmt:param>
                        </fmt:message>
                    </td>
                </tr>
            </c:if>
            <tr><td colspan="2">&nbsp;</td></tr>
            </table>
</td>
</tr>
</table>