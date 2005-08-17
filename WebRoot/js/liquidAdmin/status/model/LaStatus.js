function LaStatus(app) {
	LaItem.call(this, LaEvent.S_STATUS);
}

LaStatus.prototype = new LaItem;
LaStatus.prototype.constructor = LaStatus;

LaStatus.loadStatusTable = 
function() {
	var soapDoc = LsSoapDoc.create("GetServiceStatusRequest", "urn:liquidAdmin", null);
	var resp = LsCsfeCommand.invoke(soapDoc, null, null, null, true).firstChild;
	var list = new LaItemList("status", LaStatus);
	list.loadFromDom(resp);
	return list;
}

LaStatus.prototype.initFromDom =
function (node) {
	this.serverName = node.getAttribute("server");
	this.serviceName = node.getAttribute("service");
	this.timestamp = node.getAttribute("t");
	this.time = new Date(Number(this.timestamp)*1000).toLocaleString();
	this.status = node.firstChild.nodeValue;
	DBG.println(LsDebug.DBG3, "serverName=" + this.serverName+"<br>serviceName="+this.serviceName+"<br>time="+this.time+"<br>timestamp="+this.timestamp+"<br>status="+this.status); 
}

LaStatus.PRFX_Server = "status_server";
LaStatus.PRFX_Service = "status_service";
LaStatus.PRFX_Time = "status_time";
LaStatus.PRFX_Status = "status_status";
