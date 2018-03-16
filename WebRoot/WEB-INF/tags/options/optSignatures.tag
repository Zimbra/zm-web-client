<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<fmt:setBundle basename='/messages/AjxMsg' var='AjxMsg' scope='request' />
<app:loadTinyMCE />

<body class="yui-skin-sam">
<table width="100%">
<tr>
<td>
<table class="ZOptionsSectionTable" width="100%">
<tr class="ZOptionsHeaderRow">
    <td class="ImgPrefsHeader_L">
        &nbsp;
    </td>
    <td class='ZOptionsHeader ImgPrefsHeader' >
        <fmt:message key="optionsSignatures"/>
    </td>
    <td class="ImgPrefsHeader_R">
        &nbsp;
    </td>
</tr>
</table>
<table width="100%"  class="ZOptionsSectionMain" cellspacing="6">
    <c:set var="numSigs" value="${0}"/>
    <zm:forEachSignature var="signature">
        <c:if test="${numSigs gt 0}">
            <tr>
                <td colspan="4">
                    <hr>
                </td>
            </tr>
        </c:if>
        <c:set var="isHtml" value="${fn:escapeXml(signature.type) eq 'text/html' ? true : false }"/>
        <tr>
            <td class='ZOptionsTableLabel'>
                <fmt:message key="optionsSignatureName"/>
                :
            </td>
            <td>
                <input type="hidden" name="signatureId${numSigs}" value="${fn:escapeXml(signature.id)}"/>
                <input type="hidden" name="origSignatureName${numSigs}" value="${fn:escapeXml(signature.name)}"/>
                <input id="signatureName${numSigs}" size="40" type="text" name='signatureName${numSigs}'
                       value="${fn:escapeXml(signature.name)}">
            </td>
            <td align=right>
                <input class='tbButton' type="submit" name="actionDeleteSig:${fn:escapeXml(signature.id)}"
                       value="<fmt:message key="delete"/>">
            </td>
            <td width="20%">&nbsp;</td>
        </tr>
        <tr>
            <td class='ZOptionsTableLabel' style='vertical-align:top;' valign='top'>
                <fmt:message key="optionsSignature"/>
                :
            </td>
            <td colspan=2 <c:if test="${isHtml}">style="background-color:white;"</c:if>>
                <input type="hidden" id="signatureType${numSigs}" name="signatureType${numSigs}" value="${fn:escapeXml(signature.type)}"/>
                <input type="hidden" name="origSignatureValue${numSigs}" value="${fn:escapeXml(signature.value)}"/>
                <textarea style='width:100%' id="signatureValue${numSigs}" name='signatureValue${numSigs}' cols='80' rows='5' style='<c:if test="${isHtml}">visibility:hidden;</c:if>width:100%'>${fn:escapeXml(signature.value)}</textarea>
            </td>
            <td width="20%">&nbsp;</td>
        </tr>
        <c:set var="numSigs" value="${numSigs+1}"/>
    </zm:forEachSignature>

    <tr>
        <td colspan="4">
            <input type="hidden" name="numSignatures" value="${numSigs}"/>
            <hr>
        </td>
    </tr>
    <c:set var="maxSigs" value="${mailbox.accountInfo.attrs.zimbraSignatureMaxNumEntries[0]}"/>    
    <c:choose>
        <c:when test="${not empty param.actionNewSig or requestScope.newSignatureWarning}">
            <tr>
                <td colspan="4" class='ZHeader'>
                    <fmt:message key="optionsNewSignature"/>
                </td>
            </tr>
            <tr>
                <td class='ZOptionsTableLabel'>
                    <label><fmt:message key="optionsSignatureName"/>:</label>
                </td>
                <td>
                    <input type="hidden" name="newSignature" value="TRUE"/>
                    <input id="newSignatureName" size="40" type="text" name='newSignatureName'
                           value="${fn:escapeXml(param.newSignatureName)}">
                </td>
                <td align=right>
                    <input class='tbButton' type="submit" name="actionCancelNewSig"
                           value="<fmt:message key="cancel"/>">
                </td>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td class='ZOptionsTableLabel' style='vertical-align:top;' valign='top'>
                    <fmt:message key="optionsSignature"/>:
                </td>
                <td colspan=2 style="background-color: #FFFFFF;">
                    <input type="hidden" id="newSignatureType" name="newSignatureType" value="text/html"/>
                    <textarea style='width:100%' id="newSignatureValue" name='newSignatureValue' cols='80'rows='5' 
						style='visibility:hidden;width:100%'>${fn:escapeXml(param.newSignatureValue)}</textarea>
                </td>
                <td width="20%">&nbsp;</td>
            </tr>
        </c:when>
        <c:otherwise>
            <tr>
                <td>
                    &nbsp;
                </td>
                <td colspan=2>
                    <c:if test="${numSigs lt maxSigs}">
                    <input id="OPNEW" class='tbButton' type="submit" name="actionNewSig"
                           value="<fmt:message key="optionsAddSignature"/>">
                    </c:if>
                </td>
                <td width="20%">&nbsp;</td>
            </tr>
        </c:otherwise>
    </c:choose>
    <tr>
        <td class='ZOptionsTableLabel'>&nbsp;</td>
        <td colspan="3"><fmt:message key="optionsSignatureMaxNumber"><fmt:param value="${maxSigs}"></fmt:param></fmt:message></td>
    </tr>
    <tr>
        <td colspan="4">&nbsp;</td>
    </tr>
</table>
<br/>
<table class="ZOptionsSectionTable" width="100%">
    <tr class="ZOptionsHeaderRow">
        <td class="ImgPrefsHeader_L">
            &nbsp;
        </td>
        <td class='ZOptionsHeader ImgPrefsHeader' >
            <fmt:message key="optionsUsingSignatures"/>
        </td>
        <td class="ImgPrefsHeader_R">
            &nbsp;
        </td>
    </tr>
</table>
<table width="100%" class="ZOptionsSectionMain" cellspacing="6">
    <tr>
        <td class='ZOptionsTableLabel'>
            <label><fmt:message key="optionsSignaturePlacement"/>:</label>
        </td>
        <td>
            <label><fmt:message key="optionsSignaturePlaceTheSignature"/>:</label>
        </td>
    </tr>
    <tr>
        <td class='ZOptionsTableLabel'>&nbsp;</td>
        <td>
            <table>
                <tr>
                    <td>
                        <input id="placeAbove" type="radio" name="zimbraPrefMailSignatureStyle" value="outlook"
							<c:if test="${mailbox.prefs.signatureStyleTop}">checked</c:if> />
                    </td>
                    <td>
                        <label for="placeAbove">
                            <fmt:message key="aboveQuotedText"/>
                        </label>
                    </td>
                    <td>
                        <input id="placeBelow" type="radio" name="zimbraPrefMailSignatureStyle" value="internet"
							<c:if test="${mailbox.prefs.signatureStyleBottom}">checked</c:if> />
                    </td>
                    <td>
                        <label for="placeBelow">
                            <fmt:message key="atBottomOfMessage"/>
                        </label>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
     <tr>
        <td colspan="4">
            <hr>
        </td>
    </tr>
    <tr>
		<td colspan='4' class='ZOptionsTableField' style='text-align:center;font-weight:bold;width:auto;'>
            <fmt:message key="optionsManageAccounts">
                <fmt:param><fmt:message key="optionsSigManageAccountsPre"/></fmt:param>
                <fmt:param><a href="options?selected=accounts"><fmt:message key="optionsManageAccountsLink"/></a></fmt:param>
                <fmt:param><fmt:message key="optionsManageAccountsPost"/></fmt:param>
            </fmt:message>
        </td>
    </tr>
    <tr>
        <td colspan="4">&nbsp;</td>
    </tr>
</table>
</td>
</tr>
</table>

<script type="text/javascript">

    (function(){
        <%-- Get font definitions from AjxMsg --%>
        var fonts = [];
        <c:forEach var="KEY" items="fontFamilyIntl,fontFamilyBase">
            <c:forEach var="i" begin="1" end="30">
                <fmt:message var="style" bundle='${AjxMsg}' key="${KEY}${i}.css"/>
                <c:choose>
                    <c:when test="${fn:startsWith(style, '#') or fn:startsWith(style, '?')}">
                    <%-- Do nothing --%>
                    </c:when>
                    <c:otherwise>
                        <c:set var="style" value="${fn:replace(style,', ',',')}"/>
                            <fmt:message var="name" bundle='${AjxMsg}' key="${KEY}${i}.display"/>
                        <c:set var="selected" value="${fn:replace(mailbox.prefs.htmlEditorDefaultFontFamily,', ',',') eq style}"/>
                            fonts.push("${name}=${style}");
                    </c:otherwise>
                </c:choose>
            </c:forEach>
        </c:forEach>

        var onTinyMCEEditorInit = function(ev){
            var ed = ev.target;

            ed.dom.setStyles( ed.getBody(), {
                "font-family" : "${mailbox.prefs.htmlEditorDefaultFontFamily}",
                "font-size"   : "${mailbox.prefs.htmlEditorDefaultFontSize}",
                "color"       : "${mailbox.prefs.htmlEditorDefaultFontColor}"
            });
            if( ed.id === "newSignatureValue"){
                myEditor = ed;
                ed.focus();
            }
            else{
                myEdit.push(ed);
            }
        };

        var handleContentLoad = function(ev){
            var ed = ev.target;

            var imageArray = ed.dom.select("img[dfsrc^='doc:']"),
                    path = ["/home/", "${mailbox.accountInfo.name}", "/"].join(""),
                    image;

            while( image = imageArray.shift() ){
                image.src = [path, image.getAttribute("dfsrc").substring(4)].join('');
            }
        };

        var toolbarbuttons = [
            'fontselect fontsizeselect formatselect |',
            'bold italic underline strikethrough |',
            'forecolor backcolor |',
            'removeformat |',
            'outdent indent bullist numlist blockquote |',
            'alignleft aligncenter alignright alignjustify |',
            'image link zemoticons charmap hr table |',
            'undo redo |',
            'pastetext code'
        ];

        var plugins = [
            "zemoticons",
            "table", "paste", "directionality", "textcolor", "lists", "advlist",
            "link", "hr", "charmap", "code"
        ];

        var tinyMCEInitObj = {
            mode : "none",
            height : "200px",
            width : "100%",
            plugins : plugins.join(' '),
            theme : "modern",
            toolbar_items_size: 'small',
            toolbar : toolbarbuttons.join(' '),
            font_formats : fonts.join(";"),
            fontsize_formats : "<fmt:message bundle='${AjxMsg}' key="fontSizes"/>" || '',
            statusbar : false,
            menubar : false,
            convert_urls : false,
            verify_html : false,
            browser_spellcheck : true,
            dialog_type : "modal",
            forced_root_block : "div",
            table_default_attributes: { cellpadding: '3px', border: '1px' },
            table_default_styles: { width: '90%', tableLayout: 'fixed' },
            content_css : false,
            language : tinyMCE.getlanguage("${mailbox.prefs.locale}"),
            paste_data_images: true,
            paste_retain_style_properties : "all",
            paste_remove_styles_if_webkit : false,
            submit_patch : false,
            add_form_submit_trigger: false,
            setup : function(ed) {
                ed.on('init', onTinyMCEEditorInit);
                ed.on('LoadContent', handleContentLoad);
                ed.on('SaveContent', function(ev) {
                    var ed = ev.target;

                    if (!ed.isDirty() && ed.getContent() == "<div></div>") {
                        ed.content = "";
                    }
                });
                ed.on('BeforeSetContent', function(ed) {
                    // Replaces all double br elements for avoiding enter issue
                    ed.content = ed.content.replace(/<br><br>/ig, '<br><div><br></div>');
                });
            }
        };
        window.tinyMCE && window.tinyMCE.init(tinyMCEInitObj);

        window.sigcount = ${numSigs};
        window.myEdit = [];

        for(var i = 0 ;i < sigcount ; i++) {
            var sigType = document.getElementById("signatureType"+i).value;
            if(sigType == 'text/html') {
                window.tinyMCE && window.tinyMCE.execCommand('mceAddEditor', false, "signatureValue"+i);
            }
            else if(sigType == 'text/plain') {
                myEdit[i] == null;
            }
        }

        window.tinyMCE && window.tinyMCE.execCommand('mceAddEditor', false, "newSignatureValue");
    }());

    /* List of elements that has to be handled for send */
    var sendElemts = new Array("SOPSEND","IOPSEND");
    var y;
    for (y in sendElemts){
        var _elemA = document.getElementById(sendElemts[y]);
        _elemA.onclick = function () {
            return prepToSend();
        }
    }

    function prepToSend (){
       for(var j = 0 ;j < sigcount ; j++) {
          if(myEdit[j] != null) {
            myEdit[j].save({format:"raw"});
          }
       }
       myEditor.save({format:"raw"});
       return true;
    }

</script>
</body>


