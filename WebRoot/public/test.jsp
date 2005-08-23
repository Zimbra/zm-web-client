<!-- 
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License
Version 1.1 ("License"); you may not use this file except in
compliance with the License. You may obtain a copy of the License at
http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
the License for the specific language governing rights and limitations
under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.

Contributor(s):

***** END LICENSE BLOCK *****
-->

<%@ page language="java" 
         import="java.lang.*, java.util.*" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Zimbra Mail</title>
    <style type="text/css">
      <!--
        @import url(/zimbra/js/dwt/config/style/dwt.css);
        @import url(/zimbra/js/zimbraMail/config/style/zm.css);
      -->
    </style>
	<script language="JavaScript">
    	DwtConfigPath = "js/dwt/config";
    </script>
    <jsp:include page="Messages.jsp"/>
    <jsp:include page="Zimbra.jsp"/>
    <jsp:include page="Dwt.jsp"/>
    <jsp:include page="ZimbraMail.jsp"/>
    <script language="JavaScript">   	
   		function launch() {
   			/*var x = new DwtShell();
   			// var y = new DwtControl(x);
	   			var y = new DwtTree(x);
   			for (var i = 0; i < 100; i++) {
   				var z = new DwtTreeItem(y, null, null, null, false);
   			}*/
 	    	DBG = new AjxDebug(AjxDebug.NONE, null, false);
 	    	ZmZimbraMail.run(document.domain);
 	    }
   		function shutdown() {
   			delete DwtComposite._pendingElements;
	    }
    </script>
  </head>
  <body onload="javascript:void launch()" onunload="javascript:void shutdown()">
   </body>
</html>

