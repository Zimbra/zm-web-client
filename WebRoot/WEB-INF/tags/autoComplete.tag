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

		window.JSON = null;
        var myDataSource = new YAHOO.util.XHRDataSource("<c:url value='/h/ac' />");
        myDataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
        myDataSource.responseSchema = {
            resultsList : "Result", // String pointer to result data
            fields : ["email","ranking","display","type","id","l","isGroup"]
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
            ac.queryMatchContains = true;
            ac.maxResultsDisplayed = 20;
            ac.allowBrowserAutocomplete = false;
            ac.expandGroup = expandGroup;
        };
    <jsp:doBody/>
    }();
    // -->
</script>
