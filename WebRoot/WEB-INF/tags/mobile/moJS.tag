<%--
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
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
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mainx'}"/>
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

var AjxCache = function(expiry, accessCountLimit){
    this.expiry  = expiry || 5000;  // cache will expire after this many milis
    this._cache = new Array();

    this.expire = function(){
      delete this._cache;
      this._cache = new Array();
    };
    this.get = function(url){
        if(this.expiry ==0) return null;
        if(data = this._cache[url]){
            if(data.noExpiry || (new Date().getTime() - data.addedOn) < this.expiry){
                return data.request;
            }else{
                delete data;
            }
        }
        return null;
    };

    this.set = function(url, request, noExpiry){
        if(this.expiry ==0) return;
        noExpiry = noExpiry || false;
        var data = { request: request, addedOn: new Date().getTime(), noExpiry: noExpiry };
        this._cache[url] = data;
    };
};
var currHash = null;
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

var checkHash = function(url,method, force){
    if(url.match(/st=[a-zA-Z0-9]+/)){
        window.location = convertToHashUrl(url);
        return;
    }

    var hash = url.indexOf('#') > 0 ?  url.substring(url.indexOf('#')) : false;
    if(hash && ((currHash != hash  /*&& hash != defHash*/) || force)){
            currHash = hash;
            if(!currHash || hash == '#'){
                query = "st=${mailbox.prefs.groupMailBy}";
            }
            else
            {
                var splits = currHash.substring(1).split('&');
                var app = splits[0];
                delete splits[0];
                var params = splits.join('&');
                var query = "st=" + app + params;
                /*setTimeout(function(){
                    document.location.hash = currHash;   //!FIXME iphone address bar remains open and always shows loading....
                },200);*/

            }
            var url = '<c:url value='/m/zmain'/>?' + query;
            fetchIt(url,getContainer(),method);
	}
};

var getXHR = function() {
    var xhr = false;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
        } catch(e) {
            try {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch(e) {
                xhr = false;
            }
        }
    }
    return xhr;
};

//var xhr = getXHR();

var zClickLink = function(id, t) {

    var targ = id ? document.getElementById(id) : t ;
    if(!targ) return;
    var href = targ.href;
    if (!href || loading) return false;
    if (targ.target) return true;
    var xhr = getXHR();
    if(href.indexOf("_replaceDate") > -1){
        href = href.replace(/date=......../, "date=" + currentDate);
    }
    if (targ.attributes['noajax'] || !xhr) {
        window.location = href;
        return false;
    }
    href = convertToHashUrl(href);
    if (targ.onclick) return false;
    var containerId = targ.targetId ? targ.targetId : containerId;
    var container = getContainer(containerId);
    ajxReq(href, null, container);
    delete xhr;
    return false;
};
var setActiveTab = function(tabId){
    tabId = tabId.replace('#','').replace(/(notebooks|wiki|briefcases|briefcase|task|tasks)/ig,'docs').replace(/(cals)/ig,'cal').replace(/(message|conversation|folders)/,'mail');
    var targ = document.getElementById(tabId);
    if(targ && targ.id.match(/(mail|contact|cal|docs|search)/ig)){
        var ids = ['mail','contact','cal','docs','search'];
        for(var i=0;i<ids.length;i++){
            var eid = ids[i];
            var  e = document.getElementById(eid);
            if(e){
                e.className=e.className.replace(e.id+'-active',e.id).replace('appTab-active','appTab');
            }
        }

        targ.className=targ.className.replace(targ.id,targ.id+'-active').replace('appTab','appTab-active').replace('-active-active','-active');//.replace(targ.id+'-active','') + ' '+targ.id + '-active';
    }

};
var loadThisFrameResponse = function(response,frameId){
    getContainer().innerHTML = response;
};

var convertToHashUrl = function(url){
  if(url.match(/[\\?\\&]st=/g)){
        var r  = new RegExp("([\\?\\&]st=([a-z]+))", "gi");
        var z  = r.exec(url);
        if(z && z.length > 1){
            var y  = url;//.replace(z[1],"");
            if(z[1].indexOf('?') == 0){
                var y = y.replace(z[1],'#'+z[2]);
            }else{
                var y  = url.replace(z[1],"");
                y = y.replace('?','#'+z[2]+'&');
            }
            url = y;
        }
    }
    return url;
};

var convertToParamUrl = function(url){

    url = url.replace(/#([a-zA-Z0-9]+)/,'?st=$1')
    return url;

};

var getFormValues = function(obj) {
    var getstr = "ajax=true&";
    for (var i = 0; i < obj.getElementsByTagName("input").length; i++) {
        var control = obj.getElementsByTagName("input")[i];
        var type = control.type ;
        if (type == "text" || type == "button" || (type == "submit" && control._wasClicked) || type == "hidden" || type == "password") {
            getstr += control.name + "=" + control.value + "&";
        }
        if (type == "checkbox" || type == "radio") {
            if (control.checked) {
                getstr += control.name + "=" + control.value + "&";
            } else {
                //getstr += obj.getElementsByTagName("input")[i].name + "=&";
            }
        }
        if (control.tagName == "SELECT") {
            getstr += control.name + "=" + control.options[control.selectedIndex].value + "&";
        }

    }
    for (i = 0; i < obj.getElementsByTagName("SELECT").length; i++) {
        var control = obj.getElementsByTagName("SELECT")[i];
        getstr += control.name + "=" + control.options[control.selectedIndex].value + "&";
    }
    for (i = 0; i < obj.getElementsByTagName("TEXTAREA").length; i++) {
        var control = obj.getElementsByTagName("TEXTAREA")[i];
        getstr += control.name + "=" + control.value + "&";
    }
    return getstr;
};

var createUploaderFrame = function(iframeId){
    var html = [ "<iframe name='", iframeId, "' id='", iframeId,
             "' src='about:blank",
             "' style='position: absolute; top: -900; left: -900; height:0px;width:0px; visibility: hidden; display:none;'></iframe>" ];
    var div = document.createElement("div");
    div.innerHTML = html.join("");
    document.body.appendChild(div.firstChild);
};

var submitForm = function(fobj, target) {
    if (!fobj) return false;
    var xhr = getXHR();
    if (!xhr) {
        fobj.submit();
        return false;
    }
    if (target) {
        if(!document.getElementById(target)){
            createUploaderFrame(target);
        }
        fobj.target = target;
        fobj.action = fobj.action.replace('ajax=true', '');
        showLoadingMsg('<fmt:message key="MO_sendingRequestMsg"/>', true);
        fobj.submit();
        return true;
    }
    var url = fobj.action;
    var method = fobj.method ? fobj.method : 'GET';
    var params = getFormValues(fobj);
    var container = getContainer();
    url  = addParam(url,"_ajxnoca=1");    //form submission will not use cache
    ajxReq(url, params, container, method);
    delete xhr;
    return false;
};

var customClick = function (e) {

    if (!e) var e = event ? event : window.event;
    var targ = e.target
    if (!targ && e.srcElement) targ = e.srcElement;

    if (targ.nodeType == 3) {// defeat Safari bug
        targ = targ.parentNode;
    }
    if (!document.attachEvent)
        if (targ.onclick) e.returnValue = targ.onclick();

    if ((targ.tagName == "a" || targ.tagName == "A")) {
        e.returnValue = zClickLink(targ.id, targ);
        if (!e.returnValue) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }

            e.cancelBubble = true;
            e.stopped = true;
        }
        return e.returnValue;

    } else {
        var tname = targ.tagName;
        var ttype = targ.type;
        if(tname.match(/input/ig) && ttype.match(/submit/ig)){ //submit button; add clicked=true to it
            targ._wasClicked = true;                                                          //ajxForm submit will send only clicked btns to server
        }
        return true;
    }
};

var fetchIt = function(url, container, method) {
    var xhr = getXHR();
    if (!xhr) {
        url = convertToParamUrl(url);
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
            window.location = url + (query ? (url.indexOf('?') >= 0 ? '?' : '&') + query : '');
            return;
        }
    }
    //if hash URL then use hash based request call
    if((!query && url.indexOf("?") < 0 ) && url.indexOf("#") >= 0){
        return checkHash(url,method,true);
    }

    url = addParam(url, 'ajax=true'); //parts[0] + (url.indexOf('?') < 0 ? '?ajax=true' : '&ajax=true') + (parts[1] ? "#" + parts[1] : '');

    if((new Date().getTime() - lastRendered) > INAVTITIY_TIMEOUT ){ //Let's expire the cache now.
        ajxCache.expire();
    }

    //If get emthod then see in cached and use it
    method = method ? method : "GET";

    if(!justPrefetch ){
        if(url.indexOf('_back') > 0 && window.prevUrl){
            url = window.prevUrl;
        }
        window.prevUrl = window.currentUrl;
        window.currentUrl = (query ? addParam(url,query) : url);

    }


    if(((method == "GET" || method == "get")) && url.indexOf("_ajxnoca=1") < 0 && MAX_CACHE_REQUEST > 0){
           var xhr = ajxCache.get([url,query].join("?"));
           if(xhr){
                parseResponse(xhr, container,url);
                return;
           }
    }


    if(!justPrefetch){
        loading = true;
        container = container ? container : document.getElementById('maincontainer');
        showLoadingMsg('<fmt:message key="MO_loadingMsg"/>', true);
    }
    var xhr = getXHR();
    if (xhr) {
        xhr.onreadystatechange = function() {
            if(reqTimer){
                clearTimeout(reqTimer);
            }
            if(xhr.readyState == 4){
                if((method == "GET" || method == "get") && url.indexOf("_ajxnoca=1") < 0 && MAX_CACHE_REQUEST > 0){
                    ajxCache.set([url,query].join("?"),xhr,justPrefetch);
                }
                lastRendered = new Date().getTime();
                if(!justPrefetch){
                    parseResponse(xhr, container,url);
                }
            }
        };
        xhr.open(method, url, true);
        if (method == "POST" || method == "post") {
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            //xhr.setRequestHeader("Content-length", query.length);
            //xhr.setRequestHeader("Connection", "close");
        }
        xhr.send(query);
        reqCount++;
        reqTimer  = setTimeout(function(){ requestTimeout(xhr) },15000); //Try till 15 seconds, give up otherwise
    } else {
        return false;
    }
};

var parseResponse = function (request, container,url) {
    if (request.readyState == 4) {
        var match = url.match(/#([a-zA-Z0-9]+)/);
        if(!match){
            match = url.match(/st=([a-zA-Z0-9]+)/);
        }
        if(match){
            setActiveTab(match[1]);
        }
        if (request.status == 200) {
            var data = request.responseText;
            if (data) {
                container.innerHTML = data;
                var scripts = container.getElementsByTagName("script");
                for (var i = 0; i < scripts.length; i++) {
                    if (!scripts[i].src) {
                        eval(scripts[i].innerHTML);
                    }
                }
            }
            showLoadingMsg(null, false);
        } else {
            showLoadingMsg('<fmt:message key="error"/> : ' + request.status, true, 'Critical');
        }
        loading = false;
        getContainer().style.visibility = 'visible';
        delete request;
    }
};

var registerOnclickHook = function () {
    if (document.attachEvent) {
        document.attachEvent("onclick", customClick, false);
    } else if (document.addEventListener) {
        document.addEventListener("click", customClick, true);
    }
};

var showLoadingMsg = function(msg, show, status, timeout, divId, isActionMsg) {
    var msgDiv = document.getElementById((divId || 'msgDiv'));
    status = 'Status' + (status ? status.replace("Status","") : 'Info');
    if (msgDiv) {
        if(window.scrollY > 50){
            msgDiv.style.top = window.scrollY + "px";
        }
        var useShowHide = isActionMsg ? true: false;
        if (msg && show) {
            if(msgDiv.style.display == 'none' || isActionMsg) {
                msgDiv.style.display = 'block';
                useShowHide = true;
            }else{
                msgDiv.className = "shown";
            }

            msgDiv.innerHTML = "<div class='table LoadingDiv"+(isActionMsg ? 'D':'' )+" "+status+"'><div class='table-row'><span class='table-cell loadingIcon"+(isActionMsg ? 'D':'' )+"'></span><span class='table-cell'>" + msg + "</span></div></div>";

            if (timeout) {
                setTimeout(function() {
                    if(useShowHide){
                        msgDiv.style.display = 'none';
                    }else{
                        msgDiv.className = "hidden";
                    }
                }, timeout);
            }


        } else {
            //msgDiv.style.display = 'none';
                setTimeout(function() {
                    if(useShowHide){
                            msgDiv.style.display = 'none';
                    }else{
                        msgDiv.className = "hidden";
                    }
                }, timeout || 300);

           // document.getElementById('curDiv').style.display = 'none';
        }
    }
};
var selectDay = function(datestr) {
    var cell = document.getElementById("cell" + datestr);
    list = document.getElementById("listempty");
    list.style.display = "none";

    if (cell) {
        if (currentDate) {
            var list = document.getElementById("list" + currentDate);
            if (list == null) list = document.getElementById("listempty");
            list.style.display = "none";
            if(document.getElementById("cell" + currentDate))
            document.getElementById("cell" + currentDate).className = "zo_cal_mday" + ((currentDate == _today) ? ' zo_cal_mday_today' : '');
        }
        cell.className = 'zo_cal_mday_select';
        var nlist = document.getElementById("list" + datestr);
        if (nlist == null) nlist = document.getElementById("listempty");
        nlist.style.display = "block";
        currentDate = datestr;
        return false;
    }
};

var openURL = function(url) {
    window.location = url.replace(/date=......../, "date=" + currentDate);
};

var toggleElem = function(elem, me, minMsg, maxMsg) {
    if (!elem) return false;
    var s = document.getElementById(elem).style;
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
    if(url.indexOf("&"+param) > -1 || url.indexOf("?"+param) > -1){
        return url;
    }

    if(url.indexOf("?") < 0){
        var parts = url.split("#");
        url = parts[0] + "?" + (param) + (parts[1] ? "#" + parts[1] : '');
    }else{
        url = url.replace("?","?"+param+"&");
    }

    return url;
};

var checkAll = function(cb, checked) {
    if (cb.length)
        for (i = 0; i < cb.length; i++)
            cb[i].checked = checked;
    else
        cb.checked = checked;
};

var updateOrientation = function() {
    currentWidth = window.innerWidth;
    var orient = (currentWidth == 480) ? "landscape" : "portrait";
    document.body.setAttribute("orient", orient);
};

var requestTimeout = function (xhr){
   xhr.abort();
   loading = false;
   showLoadingMsg('<fmt:message key="MO_requestTimedOut"/>', true,'Critical',3000);
};
var getContainer = function(id) {
    id = id ? id : 'maincontainer';
    return document.getElementById(id);
};

//Init vals
var MAX_CACHE_REQUEST = 50; // No of ajx get requests to cache
var CACHE_DATA_LIFE = 20000; // miliseconds to keep the cache alive
var INAVTITIY_TIMEOUT = 60000; // Inactivity time in miliseconds after which the whole cache will be cleaned

var loading = false;
var reqCount = 0;
var reqTimer = null;
var lastRendered = new Date().getTime();
window.currentUrl = '${pageContext.request.requestURL}?ajax=true&${pageContext.request.queryString}';
var ajxCache = new AjxCache(CACHE_DATA_LIFE);

if(document.location.hash){
    var match = document.location.hash.match(/(#[a-zA-Z0-9]+)/ig);
    if(match){
        setActiveTab(match[0]);
    }
}
<c:if test="${ua.isiPhone || ua.isiPod}">
    window.addEventListener("load", function() {
        setTimeout(function() {
            updateOrientation();
            window.scrollTo(0,1);
        }, 300);
    }, false);
    window.onscroll = function() {
        var h = document.getElementById('appbar').style.height || 50;
        if(window.scrollY < h ){
            document.getElementById('msgDiv').style.top = h+"px";
            document.getElementById('msgbar').style.top = h+"px";
        }else{
            document.getElementById('msgDiv').style.top = window.scrollY + "px";
            document.getElementById('msgbar').style.top = window.scrollY + "px";
        }
    };
</c:if>

<c:if test="${scriptTag}">
//-->
</script>
</c:if>    