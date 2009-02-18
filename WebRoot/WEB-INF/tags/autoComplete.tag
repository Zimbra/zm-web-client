<%@ tag body-content="scriptless" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="yahooDomEvent" value="true" scope="request"/>
<script type="text/javascript" src="<c:url value='/yui/2.5.1/yahoo-dom-event/yahoo-dom-event.js'/>"></script>
<script type="text/javascript" src="<c:url value='/yui/2.5.1/connection/connection-min.js'/>"></script>
<script type="text/javascript" src="<c:url value='/yui/2.5.1/autocomplete/autocomplete-min.js'/>"></script>

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
        var myacformat = function(aResultItem, query) {
            var i = 0;
            var e = aResultItem[i++];
            var r = aResultItem[i++];
            var d = aResultItem[i++];
            var t = aResultItem[i++];
            var id = aResultItem[i++];
            var l  = aResultItem[i++];

            if (e) {
				var imgsrc = 
				   t == 'gal' ? "<app:imgurl value='contacts/ImgGALContact.gif' />" 
	             : t == 'group' ? "<app:imgurl value='contacts/ImgGroup.gif' />" 
				                : "<app:imgurl value='contacts/ImgContact.gif' />" ;
				return ["<table><tr><td><img src='",imgsrc,"'><"+"/td><td>",
                        zhDisplay(d ? d : e, query),
                        "</td></tr></table>"].join("");
            }
            else {
                return "";
            }
        };
        var myDataSource = new YAHOO.widget.DS_XHR("<c:url value='/h/ac' />", ["Result","email","ranking","display","type","id","l"]);
        var initAuto = function(field,container) {
            var ac = new YAHOO.widget.AutoComplete(field, container, myDataSource);
            ac.delimChar = [",",";"];
            ac.queryDelay = 0.25;
            //ac.useShadow = true;
            ac.formatResult = myacformat;
            ac.queryMatchContains = true;
            ac.maxResultsDisplayed = 20;
            ac.allowBrowserAutocomplete = false;
        };
    <jsp:doBody/>
    }();
    // -->
</script>
