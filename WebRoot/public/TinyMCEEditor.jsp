<!--
***** BEGIN LICENSE BLOCK *****
Zimbra Collaboration Suite Web Client
Copyright (C) 2011 VMware, Inc.

The contents of this file are subject to the Zimbra Public License
Version 1.3 ("License"); you may not use this file except in
compliance with the License.  You may obtain a copy of the License at
http://www.zimbra.com/license.

Software distributed under the License is distributed on an "AS IS"
basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
***** END LICENSE BLOCK *****
-->

<!--
TinyMCE editor test page used for development purpose
-->

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>Zimbra TinyMCE Editor Test Page</title>
  </head>
    <body>
    <noscript><p><b>Javascript must be enabled to use this.</b></p></noscript>
    <script type="text/javascript" language="JavaScript">
        var editorid = 1;

        function Init() {
            tinyMCE.activeEditor.setContent('<span>some</span> html');
        };

        function generate() {
            var _textarea = document.createElement("textarea");
            _textarea.id = editorid++;
            document.body.appendChild(_textarea);
            tinyMCE.init({
                // General options
                mode : "exact",
                elements : editorid-1+"",
                theme : "advanced",
                plugins : "table,inlinepopups,contextmenu,fullscreen,emotions,directionality",
                // Theme options
                theme_advanced_buttons1 : "fontselect,fontsizeselect,formatselect,justifyleft,justifycenter,justifyright,justifyfull,separator,bullist,numlist,outdent,indent,separator,bold,italic,underline,separator,forecolor,backcolor,separator,hr,link,table,fullscreen,emotions,seperator,ltr,rtl",
                theme_advanced_buttons2: "",
                theme_advanced_buttons3: "",
                theme_advanced_buttons4: "",
                theme_advanced_toolbar_location : "top",
                theme_advanced_toolbar_align : "left",
                theme_advanced_resizing : true,
                height:300,
                dialog_type:"modal" ,

                //callback
                oninit:Init
            });
        }

        function LoadJS() {
            //http://tinymce.moxiecode.com/forum/viewtopic.php?id=23286
            (function initTinyMCEDynamicLoading() {
                // Setup some variables to make tiny load with ajax request
                window.tinyMCEPreInit = {};
                window.tinyMCEPreInit.suffix = '';
                window.tinyMCEPreInit.base = "/tiny_mce/3.4.3.2"; // SET PATH TO TINYMCE HERE
                window.tinyMCEPreInit.base = "/tiny_mce/3.2.6"; // SET PATH TO TINYMCE HERE
                // Tell TinyMCE that the page has already been loaded
                window.tinyMCE_GZ = {};
                window.tinyMCE_GZ.loaded = true;
            }());

            var _script = document.createElement("script");
            _script.src = "/tiny_mce/3.4.3.2/tiny_mce.js";
            _script.src = "/tiny_mce/3.2.6/tiny_mce.js";
            _script.type = "text/javascript";
            _script.onreadystatechange = function () {
                if (_script.readyState === 'loaded' || _script.readyState === 'complete') {
                    generate();
                }
            }
            _script.onload = function() {
                generate();
            }
            document.body.appendChild(_script);
        }

        function log(msg){
            if(msg){
                document.getElementById("log").value += msg+"\n";
            }
        };
    </script>
    <input type="button" value="Generate editor" onclick="generate();"></input>
    <input type="button" value="Load TinyMCE js and Generate Editor" onclick="LoadJS();"></input>
    <br>
    <br>
    <div id="talog" style="position:absolute;margin-left:75%;top:25px;background-color:#efefef;padding:5px;">
			<input type=button value=Clear onclick="document.getElementById('log').value=''"><input type=button value="minimize" onclick="document.getElementById('log').style.display=(document.getElementById('log').style.display=='none')?'block':'none'"><br>
			<textarea id="log" style="width:250px;height:400px;overflow:auto;"></textarea>
    </div>

    </body>
</html>