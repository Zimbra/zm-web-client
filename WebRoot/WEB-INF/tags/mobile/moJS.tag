<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016 Synacor, Inc.
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
<%@ tag body-content="scriptless" %>
<%@ attribute name="ua" rtexprvalue="true" required="false" type="com.zimbra.cs.taglib.bean.ZUserAgentBean"%>
<%@ attribute name="scriptTag" rtexprvalue="true" required="false" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mainx'}"/>
<fmt:message key="service.AUTH_EXPIRED" var="authExp"/> 
<c:if test="${empty ua}">
<zm:getUserAgent var="ua" session="false"/>
</c:if>
<c:if test="${empty scriptTag}">
    <c:set var="scriptTag" value="${true}"/>
</c:if>
<c:if test="${scriptTag}">
<script type="text/javascript">
<!--
</c:if>
/*
 * Bug 98176: To keep the same logic of generating the FileAs contact
 *    label string between the Ajax client, and HTML client, when the
 *    computeFileAs(), and fileAs*() functions are modified, please
 *    change the corresponding functions defined in the autoComplete.tag
 */
<fmt:bundle basename="/messages/ZmMsg">
var ptnFileAsLastFirst   = '<fmt:message key="fileAsLastFirst" />';
var ptnFileAsFirstLast   = '<fmt:message key="fileAsFirstLast" />';
var ptnFileAsNameCompany = '<fmt:message key="fileAsNameCompany" />';
var ptnFileAsCompanyAsSecondaryOnly = '<fmt:message key="fileAsCompanyAsSecondaryOnly" />';
var ptnFileAsNameAsSecondaryOnly    = '<fmt:message key="fileAsNameAsSecondaryOnly" />';
</fmt:bundle>
var ptnFullname = '<fmt:message key="fullname"/>';

(function() {
 i = 1;
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


var $ = function(id){
    return document.getElementById(id);
};
var $iO = function(s1,s2){
    return s1.indexOf(s2);
};
var AjxCache = function(expiry){
    this._exp  = expiry || 5000;  // cache will expire after this many milis
    this._cc = []; //new Array();

    this.expire = function(){
      delete this._cc;
      this._cc = []; //new Array();
    };
    this.get = function(url){
        if(this._exp ===0) { return null;}
        if((data = this._cc[url])){
            if(data.ne || (new Date().getTime() - data.on) < this._exp){
                return data.req;
            }else{
                delete data;
            }
        }
        return null;
    };
    this.set = function(url, request, noExpiry){
        if(this._exp === 0) {return;}
        noExpiry = noExpiry || false;
        var data = { req: request, on: new Date().getTime(), ne: noExpiry };
        this._cc[url] = data;
    };
};
var toHash = function(url){  //convert to hash based URL eg. ?st=contact will be converted to #contact
  if(url.match(/[\\?\\&]st=/g)){
        var r  = new RegExp("([\\?\\&]st=([a-z]+))", "gi");
        var z  = r.exec(url);
        if(z && z.length > 1){
            var y  = url;//.replace(z[1],"");
            if($iO(z[1],'?') === 0){
                y = y.replace(z[1],'#'+z[2]);
            }else{
                y  = url.replace(z[1],"");
                y = y.replace('?','#'+z[2]+'&');
            }
            url = y;
        }
    }
    return url;
};
var trim = function(str){ return str.replace(/^\s+|\s+$/g, ''); };
var XHR = function(justTest) { //get the ajx
    if(justTest && window._ajxAv !== undefined) return window._ajxAv; 
    var xhr = false;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch(e) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch(e1) {
                xhr = false;
            }
        }
    }
    window._ajxAv = xhr ? true : false;  
    return xhr;
};
var sAT = function(tabId){ //set active tab
    tabId = tabId.replace('#','').replace(/(notebooks|wiki|briefcases|briefcase|task|tasks)/ig,'docs').replace(/(cals)/ig,'cal').replace(/(message|conversation|folders)/,'mail');
    var targ = $(tabId);
    if(targ && targ.id.match(/(mail|contact|cal|docs|search)/ig)){
        var ids = ['mail','contact','cal','docs','search'];
        for(var i=0, len = ids.length; i < len;i++){
            var eid = ids[i];
            var  e = $(eid);
            if(e){
                e.className=e.className.replace(e.id+'-active',e.id).replace('appTab-active','appTab');
            }
        }
        targ.className=targ.className.replace(targ.id,targ.id+'-active').replace('appTab','appTab-active').replace('-active-active','-active');//.replace(targ.id+'-active','') + ' '+targ.id + '-active';
    }
};
<c:choose>
    <c:when test="${mailbox.features.mail}">
    var defHash = '#${mailbox.prefs.groupMailBy}';
    </c:when>
    <c:when test="${mailbox.features.contacts}">
    var defHash = '#contact';
    </c:when>
    <c:when test="${mailbox.features.calendar}">
    var defHash = '#cal';
    </c:when>
    <c:when test="${mailbox.features.notebook}">
    var defHash = '#notebook';
    </c:when>
    <c:when test="${mailbox.features.briefcases}">
    var defHash = '#briefcase';
    </c:when>
</c:choose>
var currHash = defHash;
var checkHash = function(url,method, force){
    var hash = null;
    if(!url) {url=window.location.href;hash=window.location.hash;}
    if(url.match(/st=[a-zA-Z0-9]+/)){
        window.location = toHash(url);
        return;
    }
    hash = hash || $iO(url,'#') > 0 ?  url.substring($iO(url,'#')) : false;
    if(hash && ((currHash != hash  /*&& hash != defHash*/) || force)){
            currHash = hash;
            var query = '';
            if(!currHash || hash == '#'){
                query = "st=${mailbox.prefs.groupMailBy}";
            }
            else
            {
                var splits = currHash.replace(/#|%23/ig,"").split('&');
                var app = splits[0];
                delete splits[0];
                var params = splits.join('&');
                query = "st=" + app + params;
                window.location.hash = currHash;   //!FIXME iphone address bar remains open and always shows loading....
            }
            url = '<c:url value='/m/zmain'/>?' + query;
            fetchIt(url,GC(),method);
	}
};
var sAC = function(inp,id,v,c,si){ //select Auto complete contact, when we presse enter on click on it.
  var e = $(id);
  if(trim(e.value) != ''){
    var iv = trim(e.value).substring(0,si);
    e.value = iv+trim(e.value).substring(si).replace(unescape(inp),unescape(v).replace(/&lt;/g, "<").replace(/&gt;/g, ">")+",").replace(/,+/ig,",");
  }
  $(c).style.display = 'none';
  e.focus();  
  return false;  
};
var kU = function(e,f,c){ // On key up, do this operations
    if (!e) e = event ? event : window.event;
    if (!f && e.srcElement) f = e.srcElement;
    var k = e.keyCode?  e.keyCode : e.which;
    if(f.value == null || trim(f.value)  == ''){c.style.display="none";return false;}
    var val = trim(f.value).substring(trim(f.value).lastIndexOf(",")+1);
    var si = 0;
    if(f.selectionStart){
       val = trim(f.value).substring(0,f.selectionStart);
       si = val.lastIndexOf(",")+1;
       val  = val.substring(si);
    }else{
       val = trim(f.value).substring(0); 
       si = val.lastIndexOf(",")+1;
       val  = val.substring(si); 
    }
    if(val==null || val  == ''){c.style.display="none";return false;}
    if(val==null || val  == ''){c.style.display="none";return false;}
    if((window.ktmId) !== undefined && window.ktmId != -1){
        clearTimeout(ktmId);
    }
    if(k == 27){
      c.style.display="none";
    }else if(k == 38 && (c.style.display == "block")){
        $('cn_'+window.sindx).className = "";
        window.sindx--;
        if(window.sindx < 0){
            window.sindx = 0;
            c.style.display="none";stopEvent(e);return false;
        }
        $('cn_'+window.sindx).className = "yui-ac-highlight";

    }else if(k == 40 && (c.style.display == "block")){
        $('cn_'+window.sindx).className = "";
        window.sindx++;
        if(window.sindx >= ssize){
            window.sindx = ssize-1;
        }
        $('cn_'+window.sindx).className = "yui-ac-highlight";
    }else if(k == 13 && (c.style.display == "block")){
        sAC(val,f.id,escape($('em_'+window.sindx).innerHTML),c.id,si);
        c.style.display="none";stopEvent(e);
        return false;
    }else{
        stopEvent(e);
        window.ktmId = setTimeout(function(){
            var xhr = XHR();
            if(xhr){
                xhr.onreadystatechange = function() {
                    if(xhr.readyState == 4){
                       var r = xhr.responseText;
                       if(r && r.indexOf("error") < 0){
                            r = r.replace(/\{"Result":\[(.*)\]}/ig,"var acR = [$1]");
                            r = r.replace(/\\"/ig,"'");
                            r = r.replace(/("([a-zA-Z0-9]+)"):/ig,"$2:");
                            eval(r);
                            var htm = "";
                            for(var i=0, len = (acR !== undefined) ? acR.length : 0; i < len; i++){
                                var t = acR[i].type;
                                var e = acR[i].email;
                                var fileAs  = acR[i].fileas;
                                var first = acR[i].first;
                                var last  = acR[i].last;
                                var full  = acR[i].full;
                                var nick  = acR[i].nick;
                                var company = acR[i].company;
                                var d = acR[i].display;
                                var g = acR[i].isGroup;
                                e = "\"" + computeFullname(first, last) + "\""
                                  + " " + getAddressPart(e);
                                var eHTML = e.replace(/[']/g,"\"").replace(/&/g, "&amp;").replace(/[<]/g, "&lt;").replace(/>/g, "&gt;");
                                var imgsrc = t == 'gal' ? "<app:imgurl value='startup/ImgGALContact.png' />" : t == 'group' ? "<app:imgurl value='contacts/ImgGroup.png' />" : "<app:imgurl value='contacts/ImgContact.png' />";
                                htm = htm+"<li id='cn_"+i+"' onclick=\"return sAC(\'"+escape(val)+"\',\'"+f.id+"\',\'"+escape(e)+"\',\'"+c.id+"\',\'"+si+"\');\" class='"+((i==0)?'yui-ac-highlight':'')+"'><div class='tbl'><div class='tr'><span class='td left'><img src='"+imgsrc+"'></span><span class='td left'><span class='ZhACB' id='em_"+i+"'>"+eHTML+"</span></span></div></div></li>";
                            }
                            if(htm.length > 0 && acR.length > 0){
                                c.innerHTML = "<div class='yui-ac-content'><div class='yui-ac-bcd'><ul>"+htm+"<ul></div></div>";
                                c.style.display="block";
                                window.sindx = 0;
                                window.ssize = acR.length;
                            }else{
                                c.style.display="none";
                            }
                        }
                    }
                };
                xhr.open('GET', '<c:url value="/h/ac"/>?query='+escape(val), true);
                xhr.send(null);
                c.style.display="none";
            }
        },500);
    }
};
var AC = function(f,c){ //Register auto complete on field f and populate container c
    f = (typeof(f) == 'string')? $(f) : f;
    c = (typeof(c) == 'string')? $(c) : c;
    if (document.attachEvent) {
        f.attachEvent("onkeyup", function(e){kU(e,f,c);});
        f.attachEvent("onkeydown", function(e){ if (!e) e = event ? event : window.event;var k = e.keyCode?  e.keyCode : e.which; if((k==13 || k == 38 || k==40) && c.style.display=="block"){ window.acon = true;stopEvent(e);return false;}});
    } else if (document.addEventListener) {
        f.addEventListener("keyup", function(e){kU(e,f,c);},true);
        f.addEventListener("keydown", function(e){if (!e) e = event ? event : window.event;var k = e.keyCode?  e.keyCode : e.which; if((k==13 || k == 38 || k==40) && c.style.display=="block"){ window.acon = true;stopEvent(e);return false;}},true);
    }
};
var zClickLink = function(id, t) { //Click on href and make ajx req if available
    if((window.evHandled) !== undefined && window.evHandled) { return false; }
    var targ = id ? $(id) : t ;
    if(!targ) {return false;}
    if (targ.onclick) {var r=false;<c:if test="${!ua.isIE && !ua.isOpera}">r = targ.onclick();</c:if> if(!r)return false;}
    var href = targ.href;
    if (!href || loading) {return false;}
    if (targ.target) {return true;}
    var xhr = XHR(true);
    if($iO(href,"_replaceDate") > -1){
        href = href.replace(/date=......../, "date=" + currentDate);
    }
    if (targ.attributes.noajax || !xhr) {
        window.location = href;
        return false;
    }
    href = toHash(href);
    var containerId = targ.targetId ? targ.targetId : containerId;
    var container = GC(containerId);
    ajxReq(href, null, container);
    delete xhr;
    return false;
};
var lfr = function(response,frameId){ //Load frame response
    var req = {responseText: response,status: 200, readyState: 4};
    parseResponse(req,GC(),$(frameId).src);
};

var toParams = function(url){
    url = url.replace(/#([a-zA-Z0-9]+)/,'?st=$1');
    return url;
};

var getFormValues = function(obj) {
    var getstr = "ajax=true&";
    for (var i = 0, inp = obj.getElementsByTagName("input"), len = inp !== undefined ? inp.length : 0; i < len; i++) {
        var control = inp[i];//obj.getElementsByTagName("input")[i];
        var type = control.type ;
        if (type == "button" || (type == "submit" && control._wasClicked) || type == "hidden" || type == "password") {
            getstr += control.name + "=" + encodeURIComponent(control.value) + "&";
        }
        if (type == "checkbox" || type == "radio") {
            if (control.checked) {
                getstr += control.name + "=" + control.value + "&";
            }
        }
        if (type == "text") {
            getstr += control.name + "=" + encodeURIComponent(control.value) + "&";
        }
        if (control.tagName == "SELECT") {
            getstr += control.name + "=" + control.options[control.selectedIndex].value + "&";
        }

    }
    for (i = 0, sel = obj.getElementsByTagName("SELECT"), len = sel.length; i < len; i++) {
        control = sel[i];//obj.getElementsByTagName("SELECT")[i];
        if (control.options[control.selectedIndex].value != "" && control.options[control.selectedIndex].value != "selectAll" && control.options[control.selectedIndex].value != "selectNone" && getstr.indexOf(control.name) == -1)
            getstr += control.name + "=" + control.options[control.selectedIndex].value + "&";
    }
    for (i = 0; i < obj.getElementsByTagName("TEXTAREA").length; i++) {
        control = obj.getElementsByTagName("TEXTAREA")[i];
        getstr += control.name + "=" + escape(control.value) + "&";
    }
    return getstr;
};

var createUploaderFrame = function(iframeId){
    var html = [ "<iframe class='hiddenFrame' name='", iframeId, "' id='", iframeId,
             "' src='about:blank",
             "' style='position: absolute; top: -1000px; left: -1000px;z-index:-9999; height:0px;width:0px;border:1px;'></iframe>" ];
    var div = document.createElement("div");
    div.innerHTML = html.join("");
    document.body.appendChild(div.firstChild);
};

var submitForm = function(fobj, target, val) {
    if(window.acon !== undefined && window.acon){window.acon=false;return false;}
    if(val && (val == "selectAll" || val == "selectNone")){
        var cbs = (fobj.cid ? fobj.cid : (fobj.mid ? fobj.mid : (fobj.id ? fobj.id : null)));
        if(cbs){
            checkAll(cbs, (val == "selectAll"));
            return false;
        }
    }
    if (!fobj) {return false;}
    var xhr = XHR(true);
    if (!xhr) {
        fobj.submit();
        return false;
    }
    if (target) {
        if(!$(target)){
            createUploaderFrame(target);
        }
        fobj.target = target;
        fobj.action = fobj.action.replace('ajax=true', '');
        fobj.action = addParam(fobj.action,'isinframe=true');        
        showLoadingMsg("<fmt:message key="MO_sendingRequestMsg"/>", true);
        fobj.submit();
        return true;
    }
    var url = fobj.action;
    var method = fobj.method ? fobj.method : 'GET';
    var params = getFormValues(fobj);
    var container = GC();
    url  = addParam(url,"_ajxnoca=1");    //form submission will not use cache
    url  = addParam(url,"ajax=true");
    ajxReq(url, params, container, method);
    delete xhr;
    return false;
};
var stopEvent =function(e){
    if (!e) e = event ? event : window.event;
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.cancelBubble = true;
    e.stopped = true;
    e.returnValue = false;
};
var customClick = function (e) {
    if (!e) e = event ? event : window.event;
    var targ = e.target;
    if (!targ && e.srcElement) targ = e.srcElement;

    if (targ.nodeType == 3) {// defeat Safari bug
        targ = targ.parentNode;
    }
    if ((targ.tagName == "a" || targ.tagName == "A")) {
        e.returnValue = zClickLink(targ.id, targ);
        if (!e.returnValue) {
            stopEvent(e);
        }
        return e.returnValue;

    } else {
        var tname = targ.tagName;
        var ttype = targ.type;
        if(tname.match(/input/ig) && ttype.match(/submit/ig)){ //submit button; add clicked=true to it
            targ._wasClicked = true;                                                          //ajxForm submit will send only clicked btns to server
            return true;
        }<c:if test="${ua.isiPhone or ua.isiPod}">else if(tname.match(/input/ig) && ttype.match(/checkbox/ig))
            updateChecked(false,true);</c:if>
    }
    //targ.dispatchEvent(e);
};

var fetchIt = function(url, container, method) {
    var xhr = XHR(true);
    if (!xhr) {
        url = toParams(url);
        window.location = url;
        return;
    }
    ajxReq(url, null, container, method);
    delete xhr;
};
var ajxReq = function(url, query, container, method, justPrefetch) {
    justPrefetch = justPrefetch || false;
    if(!justPrefetch){
        //POST method is always non ajax
        if(method != 'post' && (reqCount && reqCount > MAX_CACHE_REQUEST )){
            reqCount = 0;
            window.location = url + (query ? ($iO(url,'?') >= 0 ? '?' : '&') + query : '');
            return;
        }
    }
    //if hash URL then use hash based request call

    if((!query && $iO(url,"?") < 0 ) && $iO(url,"#") >= 0){
        return checkHash(url,method,true);
    }
    url = addParam(url, 'ajax=true'); //parts[0] + ($iO(url,'?') < 0 ? '?ajax=true' : '&ajax=true') + (parts[1] ? "#" + parts[1] : '');

    if((new Date().getTime() - lastRendered) > INAVTITIY_TIMEOUT || (method == "POST" || method == "post")  ){ //Let's expire the cache now.
        ajxCache.expire();
    }

    //If get emthod then see in cached and use it
    method = method ? method : "GET";

    if(!justPrefetch ){
        if(method == "GET" || method == "get"){
            if($iO(url,'_back') > 0 && window.prevUrl){
                url = window.prevUrl;
            }
            window.prevUrl = window.currentUrl;
            window.currentUrl = (query ? addParam(url,query) : url);
        }
    }
    var xhr = false;
    if(((method == "GET" || method == "get")) && $iO(url,"_ajxnoca=1") < 0 && MAX_CACHE_REQUEST > 0){
           xhr = ajxCache.get([url,query].join("?"));
           if(xhr){
                parseResponse(xhr, container,[url,query].join("?"));
                return;
           }
    }

    if(!justPrefetch){
        loading = true;
        container = container ? container : $('maincontainer');
        showLoadingMsg("<fmt:message key="MO_loadingMsg"/>", true);
    }
    xhr = XHR();
    if (xhr) {
        window._xhr = xhr;
        xhr.onreadystatechange = function() {
            if(reqTimer){
                clearTimeout(reqTimer);
            }
            if(xhr.readyState == 4){
                if((method == "GET" || method == "get") && $iO(url,"_ajxnoca=1") < 0 && MAX_CACHE_REQUEST > 0){
                    ajxCache.set([url,query].join("?"),xhr,justPrefetch);
                }
                lastRendered = new Date().getTime();
                if(!justPrefetch){
                    parseResponse(xhr, container,[url,query].join("?"));
                }
            }
        };
        xhr.open(method, url, true);
        if (method == "POST" || method == "post") {
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }
        xhr.send(query);
        reqCount++;
        reqTimer  = setTimeout(function(){ rqT(xhr); },15000); //Try till 15 seconds, give up otherwise
    } else {
        return false;
    }
};
<c:if test="${(ua.isiPhone or ua.isiPod) and param.anim}">
var slideElem = function(elem,dir){
    elem = (typeof(elem) == 'string')? $(elem) : elem;
    if(dir == -1){
        var crd = $('card'),frnt=$('front'),cntr=$('maincontainer');
        if(crd.className.match(/flipped/)){
            crd.className = "card";
            setTimeout(function(){crd.className = "";cntr.className = cntr.className.replace(/ persp/ig,"");},1200);
            frnt.className = frnt.className.replace("back","front");
            //$('back').className = $('back').className.replace("front","back");
        }else{
            setTimeout(function(){
                cntr.className += " persp";
                crd.className = "card flipped";
                frnt.className = frnt.className.replace("front","back");
                //$('back').className = $('back').className.replace("back","front");
            },10);
        }
        return;
    }
    var c1 = " cShow",c2 = " cLeft";
    switch(dir){
        case 0: c2 = " cLeft"; break;
        case 1: c2 = " cRight"; break;
        case 2: c2 = " cTop"; break;
        case 3: c2 = " cBottom"; break;
    }
    if(dir > -1 && dir < 4){
        elem.className = elem.className.replace(c1,c2);
        setTimeout(function(){
            elem.className = elem.className.replace(c2,c1);
        },10);
    }
};
</c:if>
var parseResponse = function (request, container,url) {
    if (request.readyState == 4) {
        var match = url.match(/#([a-zA-Z0-9]+)/);
        if(!match){
            match = url.match(/st=([a-zA-Z0-9]+)/);
        }
        if(match){
            sAT(match[1]);
        }
        if (request.status == 200) {
            showLoadingMsg(null, false);
            var data = request.responseText;
            if (data) {
                <c:if test="${(ua.isiPhone or ua.isiPod) and param.anim}">if(url.match(/st=prefs|action=edit|st=newmail|st=newappt|st=newtask/) || $('card').className.match(/flipped/)){
                    slideElem(container,-1);
                }else if(url.match(/_pv=1|_back|st=briefcases|st=notebooks|st=folders|st=tasks|st=ab|st=cals/)){
                    slideElem(container,0);
                }else if(url.match(/_pv=0|action=view|sti/)){
                    slideElem(container,1);
                }</c:if>
                <c:if test="${!ua.isIE}">window.scrollTo(0,1);</c:if>
                container.innerHTML = data;
                var scripts = container.getElementsByTagName("script");
                for (var i = 0; i < scripts.length; i++) {
                    if (!scripts[i].src) {
                        try{eval(scripts[i].innerHTML);}catch(e){if(window.console){console.log(e);}}
                    }
                }
            }          
        } else if (request.status == 0) {
            showLoadingMsg("<fmt:message key="MO_networkError"/>", true, 'Critical');
        } else {
            showLoadingMsg("<fmt:message key="error"/> : " + request.status, true, 'Critical');
        }
        loading = false;
        GC().style.visibility = 'visible';
        delete request;
    }
};

var registerOnclickHook = function () {
    if (document.attachEvent) {
        document.attachEvent("onclick", customClick);
    } else if (document.addEventListener) {
        document.addEventListener("click", customClick, true);
    }
};

var showLoadingMsg = function(msg, show, status, timeout, divId) {
    //return false;
    <c:if test="${!ua.isIE}">
    var aMsgDiv = $((divId || 'loadingDiv'));
    status = 'Status' + (status ? status.replace("Status","") : '');
    if (aMsgDiv) {
        if (msg && show) {
            aMsgDiv.className = aMsgDiv.className.replace("hidden","").replace("shown","").replace(/Status(Info|Warning|Critical)/,"");
            aMsgDiv.className += " "+status+" shown";
            aMsgDiv.innerHTML = "<div class='tbl'><div class='tr'><span class='td loadingIcon'></span><span style='width:90%;text-align:left;' class='td'>" + msg + "</span><span style='overflow:hidden;height:16px;' class='ImgCancel'></span></div></div>";

            if (timeout) {
                setTimeout(function() {
                    aMsgDiv.className = aMsgDiv.className.replace("shown","hidden");
                    showLoadingMsg(msg, false, status, null, divId);
                }, timeout);
            }
        } else {
            setTimeout(function() {
                aMsgDiv.className = aMsgDiv.className.replace("shown","").replace("hidden","");
                aMsgDiv.className += " hidden";
            }, timeout || 300);
        }
    }
    </c:if>
};
var selectDay = function(datestr) {
    var cell = $("cell" + datestr);
    var list = $("listempty");
    list.style.display = "none";

    if (cell) {
        if (currentDate) {
            list = $("list" + currentDate);
            if (list === null) list = $("listempty");
            list.style.display = "none";
            if($("cell" + currentDate))
            $("cell" + currentDate).className = "zo_cal_mday" + ((currentDate == _today) ? ' zo_cal_mday_today' : '');
        }
        cell.className = 'zo_cal_mday_select';
        var nlist = $("list" + datestr);
        if (nlist === null) nlist = $("listempty");
        nlist.style.display = "block";
        currentDate = datestr;
        return false;
    }
};

var openURL = function(url) {
    window.location = url.replace(/date=......../, "date=" + currentDate);
};
<c:if test="${ua.isiPhone or ua.isiPod}">
var startX,startY,iH=[],xD=0,yD=0,dV=[],dId=0;
var rSH = function(frm){ //Register swipe handler
    if(frm){
        frm.addEventListener('touchstart', function(e) {
            if (e.targetTouches.length != 1){
                return false;
            }
            var p = e.target;
            window.evHandled=false;
            while(p && (!p.className || $iO(p.className,"list-row") < 0)){
                p = p.parentNode;
            }
            if(!p || !p.className || $iO(p.className,"list-row") < 0) {return;}
            xD=0,yD=0;
            startX = e.targetTouches[0].clientX;
            startY = e.targetTouches[0].clientY;
            frm.addEventListener('touchmove', function(e) {
                if (e.targetTouches.length != 1){
                    return false;
                }
                var p = e.target;
                while(p && (!p.className || $iO(p.className,"list-row") < 0)){
                    p = p.parentNode;
                }
                if(!p || !p.className || $iO(p.className,"list-row") < 0) {/*window.evHandled=false;*/return;}

                xD = e.targetTouches[0].clientX - startX;
                yD = e.targetTouches[0].clientY - startY;
            }, false);
            frm.addEventListener('touchend', function(e) {
                var p = e.target;
                while(p && (!p.className || $iO(p.className,"list-row") < 0)){
                    p = p.parentNode;
                }
                if(!p || !p.className || $iO(p.className,"list-row") < 0) {/*window.evHandled=false;*/return;}
                if(Math.abs(xD) > 50 && Math.abs(yD) < 15 ){
                   var l = p.getElementsByClassName("l");
                   if(l && l.length > 0){
                       if(dId && dId != p.id && dV[dId]){
                            hideDelete(dId);
                       }
                       l = l[0];
                       dId = p.id;
                       if(!dV[dId]){
                           showDelete(dId);
                       }else{
                           hideDelete(dId);
                       }
                       stopEvent(e);
                       e.returnValue = false; 
                       window.evHandled=true;
                       frm.removeEventListener('touchmove');
                       frm.removeEventListener('touchend');
                   }
                }
                xD=0;
            }, false);
        }, false);
        
    }
};
var hideDelete = function(id){
   var p = $(id);
   if(!p) {return ;}
   var l = p.getElementsByClassName("l");
    if(l && l.length > 0 && dV[id]){
        l = l[0];
        l.innerHTML = iH[id];
        p.getElementsByClassName('chk')[0].checked=false;
        updateChecked(false);
        $('zForm').anAction[0].value='';
        dV[id]=false;
        delete iH[id];
    }
};
var updateChecked = function(disabled,doItAll){
   var fbbar = $("fbbar");
   if(!dV[dId] && !fbbar) return;
   var cCount = 0,cbs=$('zForm').getElementsByClassName('chk');
   for(var i=0, len = (cbs !== undefined) ? cbs.length : 0; i < len; i++){
       if(cbs[i].checked){ cCount++;cbs[i].disabled = disabled;}
   }
   if(cCount > 0){
    fbbar.style.display = "table";
    uFB();
    $("sc").innerHTML = "<span class='small-gray-text'>"+cCount+"</span>";
   }else{
    fbbar.style.display = "none";
    $("sc").innerHTML = "";
   }
   if(doItAll && dV[dId])
    if(cCount <= 0)
        hideDelete(dId);
    else
        $('delBtn').value = "<fmt:message key="delete"/> ("+cCount+")";
   return cCount;
};
var showDelete = function(id){
   var p = $(id);
   if(!p) {return ;}
   var l = p.getElementsByClassName("l");
   if(l && l.length > 0 && !dV[id]){
       l = l[0];
       iH[id] = l.innerHTML;
       p.getElementsByClassName('chk')[0].checked=true;
       var cCount = updateChecked(false);
       $('zForm').anAction[0].value='';
       l.innerHTML = "<input type='submit'  id='delBtn' style='z-index:-999' class='zo_button delete_button' name='actionDelete' value='<fmt:message key="delete"/>"+(cCount > 1 ? ' ('+cCount+')' : '')+"'>";
       $('delBtn').className += " delBtnV";
       dV[id]=true;
   }
};
</c:if>
var toggleElem = function(elem, me, minMsg, maxMsg) {
    if (!elem && !$(elem)) {return false;}
    if(typeof(elem) == "string"){elem = $(elem);}
    var s = elem.style;
    if (s && s.display && s.display == 'none') {
        s.display = '';
        if (me && minMsg)
            me.innerHTML = minMsg;//'<fmt:message key="details"/>';
    } else {
        s.display = 'none';
        if (me && maxMsg)
            me.innerHTML = maxMsg;//'Hide';
    }
    return false;
};
var addParam = function(url, param) {
    if($iO(url,"&"+param) > -1 || $iO(url,"?"+param) > -1){
        return url;
    }

    if($iO(url,"?") < 0){
        var parts = url.split("#");
        url = parts[0] + "?" + (param) + (parts[1] ? "#" + parts[1] : '');
    }else{
        url = url.replace("?","?"+param+"&");
    }

    return url;
};

var checkAll = function(cb, checked) {
    if(cb === undefined) return;
    if (cb.length)
        for (var i = 0, len = cb.length; i < len; i++)
            cb[i].checked = checked;
    else
        cb.checked = checked;
    <c:if test="${ua.isiPhone or ua.isiPod}">updateChecked(false,true);</c:if>
};
<c:if test="${ua.isiPhone or ua.isiPod}">
var updateOrientation = function() {
    currentWidth = window.innerWidth;
    var orient = (currentWidth == 480) ? "landscape" : "portrait";
    document.body.setAttribute("orient", orient);
};
</c:if>
var rqT = function (xhr,msg,status){ // request timeout
   xhr = xhr ? xhr : window._xhr; 
   xhr.abort();
   loading = false;
   //showLoadingMsg(null, false);
   msg = msg ? msg : '<fmt:message key="MO_requestTimedOut"/>';
   status = status ? status : 'Critical'; 
   showLoadingMsg(msg, true,status,3000);
};
var GC = function(id) {
    id = id ? id : 'front';
    if(window.__container === undefined){
        window.__container = $(id);
    }
    return window.__container;
};

//Init vals
var MAX_CACHE_REQUEST = 50; // No of ajx get requests to cache
var CACHE_DATA_LIFE = 20000; // miliseconds to keep the cache alive
var INAVTITIY_TIMEOUT = 60000; // Inactivity time in miliseconds after which the whole cache will be cleaned

var loading = false;
var reqCount = 0;
var reqTimer = null;
var lastRendered = new Date().getTime();
var ajxCache = new AjxCache(CACHE_DATA_LIFE);
if(window.location.hash){
    sAT(window.location.hash);
};
<c:if test="${ua.isiPhone || ua.isiPod}">
var uFB = function() {var fb = $("fbbar"); if(fb) {var t = window.scrollY;if(t > 88){ t -= 88;}else{t=0;} fb.style['-webkit-transform'] = 'translateY(' + t + 'px)'; }}
window.onscroll = uFB;
    window.addEventListener("load", function() {
        setTimeout(function() {
            updateOrientation();
            window.scrollTo(0,1);
        }, 300);
    }, false);
    rSH(document);
</c:if>
<c:if test="${scriptTag}">
//-->
</script>
</c:if>    
