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

<%@ page language="java" import="java.util.*, javax.naming.*"%>
<%
   	String portsCSV = application.getInitParameter("admin.allowed.ports");
   	if (portsCSV != null) {
	    // Split on zero-or-more spaces followed by comma followed by
	    // zero-or-more spaces.
	    String[] vals = portsCSV.split("\\s*,\\s*");
	    if (vals != null || vals.length > 0) {
		    int[] mAllowedPorts = new int[vals.length];
		    for (int i = 0; i < vals.length; i++) {
		    	try {
		        	mAllowedPorts[i] = Integer.parseInt(vals[i]);
		        } catch (NumberFormatException e) {
		            //
		        }
		        if (mAllowedPorts[i] < 1) {
		            //
		        }
		    }  
		    
		    if (mAllowedPorts != null && mAllowedPorts.length > 0) {
		        int incoming = request.getServerPort();
			        for (int i = 0; i < mAllowedPorts.length; i++) {
		            if (mAllowedPorts[i] == incoming) {
				        String qs = request.getQueryString();
				        String path = "/zimbraAdmin";
				       
				        if(qs != null)
				        	path = path + "?" + qs;
				        	
    	    	    	response.sendRedirect(path);    	
	            	    return;
		            }
		        }
		    }    
	    } 	
	}
%>
<%! 
   private static String protocolMode = null;
   private static String httpsPort = null;
   private static String httpPort = null;
   private static final String DEFAULT_HTTPS_PORT = "443";
   private static final String DEFAULT_HTTP_PORT = "80";
   private static final String PROTO_MIXED = "mixed";
   private static final String PROTO_HTTP = "http";
   private static final String PROTO_HTTPS = "https";
   static {
      try {
        Context initCtx = new InitialContext();
        Context envCtx = (Context) initCtx.lookup("java:comp/env");
        protocolMode = (String) envCtx.lookup("protocolMode");
        httpsPort = (String) envCtx.lookup("httpsPort");
        if (httpsPort != null && httpsPort.equals(DEFAULT_HTTP_PORT)){
            httpsPort = "";
        } else {
            httpsPort = ":" + httpsPort;    
        }
        httpPort = (String) envCtx.lookup("httpPort");
        if (httpPort != null && httpPort.equals(DEFAULT_HTTP_PORT)){
            httpPort = "";
        } else {
            httpPort = ":" + httpPort;    
        }
      } catch (NamingException ne) {
        protocolMode = PROTO_HTTP;
        httpsPort = DEFAULT_HTTPS_PORT;
        httpsPort = DEFAULT_HTTP_PORT;
      }
   }
%>      

<%
   String currentProto = request.getScheme();
   String initMode = request.getParameter("initMode");
   initMode = (initMode != null)? initMode : "";
   String qs = request.getQueryString();
   boolean emptyQs = true;
   if (qs != null && !qs.equals("") ) {
       qs = "?" + qs;
       emptyQs = false;
   } else {
       qs = "";
   }
   if (protocolMode.equals(PROTO_MIXED) || protocolMode.equals(PROTO_HTTPS)) {
      if (currentProto.equals(PROTO_HTTP)){
         String httpsLocation = null;
         qs = emptyQs? "?initMode=" + currentProto: qs + "&initMode=" + 
             currentProto;
         httpsLocation = PROTO_HTTPS + "://" + request.getServerName() +
             httpsPort + "/zimbra/" + qs;
         
         response.sendRedirect(httpsLocation);
         return;
      }
   }

   if (currentProto.equals(PROTO_HTTPS) &&
      protocolMode.equals(PROTO_HTTP)){
      qs = emptyQs? "?initMode=" + currentProto: qs + "&initMode=" + 
          currentProto;
      response.sendRedirect(PROTO_HTTP + "://" +
                            request.getServerName() + httpPort + "/zimbra" 
                            + qs);
      return;
   }
   String uname = (String) request.getParameter("uname");
   if (uname == null){
      uname = "";
   }
   String mode = (String) request.getAttribute("mode");
   String vers = (String)request.getAttribute("version");
   String ext = (String)request.getAttribute("fileExtension");
   String gzip = "true";
   if (vers == null){
      vers = "";
   }
   if (ext == null){
      ext = "";
      gzip = "false";
   }
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <link rel="shortcut icon" href="/zimbra/img/hiRes/logo/favicon.gif" type="image/gif" />
    <title>Zimbra Login</title>
    <style>
      <!--
        @import url(/zimbra/js/zimbraMail/config/style/zm.css);
      -->

body, p, td, div, span,input {
  font-size: 8pt; font-family: Tahoma, Arial, Helvetica, sans-serif;
}
body { 
  background-color: #b7b7b7; 
  background-image:url(/zimbra/skins/steel/images/bg_steel.gif);
  overflow:hidden;
}
input {width:185px;}
.LoginPanel {
  width:100%;
  height:100%;
  background-color:white;
}

.mainPanel{ 
  position:absolute; 
  visibility:hidden; 
  width:460px; 
  height:333px; 
  border: 2px solid; 
  border-color: #C7C7C7 #3E3E3E #3E3E3E #C7C7C7;
  background-image:url(/zimbra/skins/steel/images/bg_pebble.gif);
}

.mainPanel table{ table-layout:fixed }

.logoRow{ 
  height:163px;
}

.logoRow .banner { 
  position:relative; 
  margin-top:10px;
  margin-bottom:10px;
  width:447px; 
  height:155px; 
  background-image:url("/zimbra/img/hiRes/logo/LoginBanner.gif");
  
}
.logo { 
  position:absolute; 
  top:43px; 
  left:13px;
}
.companyHeader{  
  position:absolute; 
  top: 51px; 
  left:62px; 
  color:white;
  height:16px; 
  font-size:13.333px;
}

.subHeader {  
  position:absolute; 
  top: 71px; 
  left:62px; 
  color:white; 
  font-size:12pt;
}

.errorDiv {  
  position:relative; 
  margin:13px; 
  height:59px; 
  width:417px; 
  display:none; 
  background-color: rgb(255, 255, 204); 
  border:1px solid rgb(124, 124, 148);
}
.errorIcon { 
  position:absolute;
  top:15px;
  left:15px;
}

.errorMsg {  
  position:absolute; 
  top:25px; 
  left:60px;
}

.inputRow { 
  height:131px;
}

.inputRow td {  
  height:100%;
}

.inputContainer {  
  position:relative; 
  width:100%; 
  height:100%;
  background-image:url(/zimbra/skins/steel/images/bg_pebble.gif);
}

.usernameText{  
  position:absolute; 
  top: 45px; 
  left:28px;
}

.usernameInput {  
  position:absolute; 
  top: 42px; 
  left:104px; 
  width:300px;
}

.passwordText {  
  position:absolute; 
  top: 81px; 
  left:30px;
}

.passwordInput { 
  position:absolute; 
  top:78px; 
  left:104px; 
  width:300px;
}

.button{ 
  position:absolute; 
  top:113px; 
  left: 345px;
}
.whiteBorder{ 
  border: 1px solid white;
}

.focusBorder{ 
  border: 1px dotted black;
}

</style>
  </head>

 <body style="margin:0px; border:0px; padding:0px;">
    <div id='unsupportedBrowserMessage' style="border:1px solid black;background-color:white;height:300px; width:400px;display:none;position:absolute;font-size:16px">
      <div style="margin:4px;background-color: rgb(37, 87,173);;height:40px;font-size:18px;font-weight:bold;">
        <div style="position:relative; top:0px; left:100px;background-image:url('/zimbra/js/img/hiRes/logo/AppBanner.gif')"></div>
     </div>
     <div style="text-align:center">
      <pre>
Zimbra Collaboration Suite requires:

Firefox 1.x, 
Internet Explorer 5.5 or later,
Or Fedora
     </pre>
     <a href="javascript:ZmLogin.handleOnload(null, true);">Click here to continue</a>
   </div>
   </div>
    <form style="margin:0px; border:0px; padding:0px" method="post">
      <div id="loginPanel" class=mainPanel >
		<table class="LoginPanel" cellpadding=0 cellspacing=0 border=0>
	    <tr class=logoRow>
	      <td>
				<div class=banner></div>
	      </td>
	    </tr>
	    <tr id="errorRow">
              <td>
                <div class=errorDiv id="errorMessageContainer" >
                  <img class=errorIcon src="/zimbra/img/hiRes/dwt/Critical_32.gif">
                  <div id="errorMessage" class=errorMsg style="top:25px">yo yo</div>
                </div>
            </td></tr>
	    <tr class=inputRow>
	      <td>
		<div class=inputContainer>
		  <div>
		    <div id="ut" class=usernameText>
		      &nbsp;
		    </div>
		    <div id="ui" class=usernameInput>
		      <input autocomplete=OFF id="uname" type="text"
name="username" value="<%= uname %>" style="width:100%; height:22px" />
		    </div>
		  </div>
		  <div>
		    <div id="pt" class=passwordText>
		      &nbsp;
		    </div>
		    <div id="pi" class=passwordInput>
		      <input autocomplete=OFF id="pass" type="password" name="pwd" value="" style="width:100%; height:22px" />
		    </div>
		  </div><br>
                  <div id="pc" style="position:absolute; top:113px ; left:100px; width:220px; height:30px">
                    <div id="reloginField" style="position: relative">
                      <input id="publicComputer" type="checkbox" style="position:absolute; top:4px; left: 4px; width:13px; height:13px; margin:0; padding:0"><div id="pcText" style="position:absolute; top:2px; left: 23px;" >&nbsp;</div>
                    </div>
                  </div>
		  <div id="bi" class=button>
                    <div class=whiteBorder id="buttonBorder">
                      <div class=DwtDialog>
                        <div id="loginButton" class="DwtButton" style="text-align:center;cursor:default"  
                        		onclick="javascript:ZmLogin.submitAuthRequest(); return false;" 
                        		onmouseover="javascript:this.className='DwtButton-activated';" 
                        		onmouseout="javascript:this.className='DwtButton';" 
                        		onmousedown="javascript: this.className='DwtButton-triggered'; return false;" 
                        		onmouseup="javascript: this.className='DwtButton';" 
                        		onmousemove="javascript:return false;" 
                        		onselectstart="javascript: return false;" 
                        		onfocus="javascript: ZmLogin.loginButtonFocus(this.parentNode.parentNode);return false;"
                        		onblur="javascript: ZmLogin.loginButtonBlur(this.parentNode.parentNode);return false;"
                        	>
                           <div id="logonText" style="margin:3px 0px 3px 0px;" >&nbsp;</div>
                        </div>
                      </div>
                    </div>
		  </div>
		</div>
	      </td>
	    </tr>
	</table>
      </div>
    </form>
  </body>
 <script>
  	DwtConfigPath = "js/dwt/config";
</script>
<jsp:include page="Messages.jsp"/>
<script type="text/javascript" src="/zimbra/js/Ajax_all.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="/zimbra/js/ZmLogin.js<%= ext %>?v=<%= vers %>"></script>


<script language="javascript">
        var initMode = "<%= initMode %>";
   	AjxWindowOpener.HELPER_URL = "/zimbra/public/frameOpenerHelper.jsp"
	DBG = new AjxDebug(AjxDebug.NONE, null, false);
	if (initMode != "" && (initMode != location.protocol)){
		AjxDebug.deleteWindowCookie();
	}
	if (location.search && (location.search.indexOf("debug=") != -1)) {
		var m = location.search.match(/debug=(\d+)/);
		if (m.length) {
			var num = parseInt(m[1]);
			var level = AjxDebug.DBG[num];
			if (level)
   				DBG.setDebugLevel(level);
   		}
	}
	window.onload = ZmLogin.handleOnload;
</script>


</html>
