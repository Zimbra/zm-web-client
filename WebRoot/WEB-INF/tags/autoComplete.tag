<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="scriptless" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="yahooDomEvent" value="true" scope="request"/>

<script type="text/javascript" src="<c:url value='/yui/2.7.0/yahoo-dom-event/yahoo-dom-event.js'/>"></script>
<script type="text/javascript" src="<c:url value='/yui/2.7.0/connection/connection-min.js'/>"></script>
<script type="text/javascript" src="<c:url value='/yui/2.7.0/datasource/datasource-min.js'/>"></script>
<script type="text/javascript" src="<c:url value='/yui/2.7.0/json/json-min.js'/>"></script>
<script type="text/javascript" src="<c:url value='/yui/2.7.0/autocomplete/autocomplete-debug.js'/>"></script>

<script type="text/javascript">
    <!--
    <fmt:bundle basename="/messages/ZmMsg">
        var ptnFileAsLastFirst   = '<fmt:message key="fileAsLastFirst" />';
        var ptnFileAsFirstLast   = '<fmt:message key="fileAsFirstLast" />';
        var ptnFileAsNameCompany = '<fmt:message key="fileAsNameCompany" />';
        var ptnFileAsCompanyAsSecondaryOnly = '<fmt:message key="fileAsCompanyAsSecondaryOnly" />';
        var ptnFileAsNameAsSecondaryOnly    = '<fmt:message key="fileAsNameAsSecondaryOnly" />';
    </fmt:bundle>
    var ptnFullname = '<fmt:message key="fullname"/>';

    (function() {
	var i = 1;
        FA_LAST_C_FIRST         = i++;
        FA_FIRST_LAST           = i++;
        FA_COMPANY              = i++;
        FA_LAST_C_FIRST_COMPANY = i++;
        FA_FIRST_LAST_COMPANY   = i++;
        FA_COMPANY_LAST_C_FIRST = i++;
        FA_COMPANY_FIRST_LAST   = i++;
        FA_CUSTOM               = i++;
    })();

    /**
     * Same logic defined in the ZmContact.js#computeFileAs
     */
    function computeFileAs(fileAs, first, last, full, nick, company) {

        var fa;
        var val = parseInt(fileAs);
        switch(val) {
            case FA_LAST_C_FIRST:
            default: {                   // Last, First
                fa = fileAsLastFirst(first, last, full, nick);
            }
            break;

            case FA_FIRST_LAST: {        // First Last
                fa = fileAsFirstLast(first, last, full, nick);
            }
            break;

            case FA_COMPANY: {           // Company
                fa = company;
            }
            break;

            case FA_LAST_C_FIRST_COMPANY: {  // Last, First (Company)
                var name = fileAsLastFirst(first, last, full, nick);
                fa = fileAsNameCompany(name, company);
            }
            break;

            case FA_FIRST_LAST_COMPANY: {    // First Last (Company)
                var name = fileAsFirstLast(first, last, full, nick);
                fa = fileAsNameCompany(name, company);
            }
            break;

            case FA_COMPANY_LAST_C_FIRST: {  // Company (Last, First)
                var name = fileAsLastFirst(first, last);
                fa = fileAsCompanyName(name, company);
            }
            break;

            case FA_COMPANY_FIRST_LAST: {    // Company (First Last)
                var name = fileAsFirstLast(first, last);
                fa = fileAsCompanyName(name, company);
            }
            break;

            case FA_CUSTOM: {                // custom looks like this: "8:foobar"
                fa = fileAs.substring(2);
            }
            break;
        }
        return fa || full || "";
    }

    function computeFullname(first, last) {
        if (first && last) {
            return ptnFullname.replace("{0}", first).replace("{1}", last);
        }
	return last || first;
    }

    function fileAsLastFirst(first, last, fullname, nickname) {
        if (first && last) {
            return ptnFileAsLastFirst.replace("{0}", first).replace("{1}", last);
        }
        return last || first || fullname || nickname || "";
    }

    function fileAsFirstLast(first, last, fullname, nickname) {
        if (first && last) {
            return ptnFileAsFirstLast.replace("{0}", first).replace("{1}", last);
        }
        return first || last || fullname || nickname || "";
    }

    function fileAsNameCompany(name, company) {
        if (name && company) {
            return ptnFileAsNameCompany.replace("{0}", name).replace("{1}", company);
        }
        if (company) {
            return ptnFileAsCompanyAsSecondaryOnly.replace("{0}", company);
        }
        return name;
    }

    function fileAsCompanyName(name, company) {
        if (company && name) {
            return ptnFileAsCompanyName.replace("{0}", name).replace("{1}", company);
        }
        if (name) {
            return ptnFileAsNameAsSecondaryOnly.replace("{0}", name);
        }
        return company;
    }

    function getAddressPart(str) {
        return str.match(/<.+@.+>$/);
    }

    var zimbraAutoComplete = function() {
        var zhEncode = function(s) {return s == null ? '' : s.replace(/&/g, "&amp;").replace(/[<]/g, "&lt;").replace(/>/g, "&gt;");}
        var zhFmt = function(str,query,bold) {
            return bold ?
                   ["<span class='ZhACB'>",zhEncode(str.substring(0, query.length)), "<"+"/span>", zhEncode(str.substring(query.length))].join("")
                    : zhEncode(str);
        }
        var zhDisplay = function(str,query) {
            var index = str.toLowerCase().indexOf(query.toLowerCase());
            if (index < 0)
                return zhFmt(str, query, false);
            else {
                return [zhFmt(str.substring(0, index), query, false),
                        zhFmt(str.substring(index), query, true)].join("");
            }
        }
        var myacformat = function(aResultItem, query, sResultMatch) {

            
            var i = 0;
            var e = aResultItem[i++];
            var r = aResultItem[i++];
            var d = aResultItem[i++];
            var t = aResultItem[i++];
            var id = aResultItem[i++];
            var l  = aResultItem[i++];

            if (e || d) {
				var imgsrc = 
				   t == 'gal' ? "<app:imgurl value='startup/ImgGALContact.png' />"
	             : t == 'group' ? "<app:imgurl value='contacts/ImgGroup.png' />"
				                : "<app:imgurl value='contacts/ImgContact.png' />" ;
				return ["<div style='padding:3px;'><span><img src='",imgsrc,"'><"+"/span><span>",
                        zhDisplay(d ? d : e, query),
                        "</span></div>"].join("");
            }
            else {
                return "";
            }
        };

        /**
         * Generate the label string shown next to the email address
         * in the auto-complete pull-down list.  This label string
         * should be aligned with the formatting rule in Contact list
         * whose items are generated using ZmContact.js#computeFileAs
         */
        var formatNameLabel = function(sQuery, oResponse, oPayload) {
            var allResults = oResponse.results;
            for (var i = 0; i < allResults.length; i++) {
                var oResult = oResponse.results[i];
                var isGroup = oResult["isGroup"];
                if (isGroup) {
                    continue;
                }
                var fileAs = oResult["fileas"];
                var email     = oResult["email"];

                var first = oResult["first"];
                var last  = oResult["last"];
                var full  = oResult["full"];
                var nick  = oResult["nick"];
                var company = oResult["company"];

                oResult["email"]
                    = "\"" + computeFullname(first, last) + "\""
                    + " " + getAddressPart(email);
            }
            return true;
        };

		window.JSON = null;
        var myDataSource = new YAHOO.util.XHRDataSource("<c:url value='/h/ac' />");
        myDataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
        myDataSource.responseSchema = {
            resultsList : "Result", // String pointer to result data
            fields : ["email","ranking","display","type","id","l","isGroup","fileas","first","middle","last","full","nick","company"]
        };

        var expandGroup = {
                sendRequest : function(params) {
                    YAHOO.util.Connect.asyncRequest('GET', "<c:url value='/h/grpcontacts' />"+"?id="+params.query, params.callback);
                }
        };

        var initAuto = function(field,container) {
            var ac = new YAHOO.widget.AutoComplete(field, container, myDataSource);
            ac.delimChar = [",",";"];
            ac.queryDelay = 0.25;
            ac.formatResult = myacformat;
            ac.doBeforeLoadData = formatNameLabel;
            ac.queryMatchContains = true;
            ac.maxResultsDisplayed = 20;
            ac.allowBrowserAutocomplete = false;
            ac.expandGroup = expandGroup;
        };
    <jsp:doBody/>
    }();
    // -->
</script>
