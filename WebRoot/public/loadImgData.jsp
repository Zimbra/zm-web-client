<!--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
-->
<!--
NOTE: it should not happen, but if for some reason updating this file does not cause a recompile of the files including it
(currently launchZCS and launchNewWindow), make sure you touch those files too to test.
I tested on my Jetty and it does recognize included files and recompiles the files that include them. But just in case.
-->
<!--
Make sure svg related js file included after including img related js file so svg will have higher priority and 
if we have same file in both places then svg will be picked up
-->
<script>
<jsp:include page="/img/images.css.js" />
<jsp:include page="/svg/svgs.css.js" />
<jsp:include page="/skins/${skin}/img/images.css.js" />
<jsp:include page="/skins/${skin}/svg/svgs.css.js" />
document.write("<DIV style='display:none'>");
for (id in AjxImgData) {
	data = AjxImgData[id];
	if (data.f) data.f = data.f.replace(/@AppContextPath@/,appContextPath);
	document.write("<IMG id='",id,"' src='",data.d||data.f,"?v=${vers}'>");
}
document.write("</DIV>");
delete id;
delete data;
delete f;
</script>
