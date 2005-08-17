MailQuota_XModelItem = function (){}
XModelItemFactory.createItemType("_MAILQUOTA_", "mailquota", MailQuota_XModelItem);
MailQuota_XModelItem.prototype.validateType = XModelItem.prototype.validateNumber;
MailQuota_XModelItem.prototype.getterScope = _MODELITEM_;
MailQuota_XModelItem.prototype.setterScope = _MODELITEM_;
MailQuota_XModelItem.prototype.getter = "getValue";
MailQuota_XModelItem.prototype.setter = "setValue";
MailQuota_XModelItem.prototype.maxInclusive = 2047;
MailQuota_XModelItem.prototype.minInclusive = 0;

MailQuota_XModelItem.prototype.getValue =  function(instance, current, ref) {
	var value = (eval("instance." + ref) != null) ? Number(eval("instance." + ref) / 1048576).toFixed(3) : 0;
	return value;
}

MailQuota_XModelItem.prototype.setValue = function(value, instance, current, ref) {
	var pathParts = new Array();
	var val = Math.round(value * 1048576);
	if(ref.indexOf(".") >= 0) {
		pathParts = ref.split(".");
	} else if (ref.indexOf("/") >=0) {
		pathParts = ref.split("/");
	} else {
		instance[ref] = val
		return val;
	}
	var cnt = pathParts.length-1;
	var obj = instance[pathParts[0]];
	for(var ix=1; ix<cnt; ix++) {
		obj = obj[pathParts[ix]];
	}
	obj[pathParts[cnt]] = val;
	return val;
}

/**
* _MAILQUOTA_2_ XModel item type
**/
MailQuota2_XModelItem = function (){}
XModelItemFactory.createItemType("_MAILQUOTA_2_", "mailquota_2", MailQuota2_XModelItem);
MailQuota2_XModelItem.prototype.getterScope = _MODELITEM_;
MailQuota2_XModelItem.prototype.getter = "getValue";

MailQuota2_XModelItem.prototype.getValue = function(instance, current, ref) {
	var value = this.getAccountValue(instance, current, ref);
	if (value == null) value = this.getCosValue(instance, current, ref);
	if(value <=0) 
		value = LaMsg.Unlimited;
	return value;
}

MailQuota2_XModelItem.prototype.getCosValue = function(instance) {
	var _ref = this.ref.replace("/", ".");
	var value = (eval("instance.cos." + _ref) != null) ? Number(eval("instance.cos." + _ref) / 1048576).toFixed(0) : 0;
	return value;
}
MailQuota2_XModelItem.prototype.getAccountValue = function(instance) {
	var _ref = this.ref.replace("/", ".");
	var value = (eval("instance." + _ref) != null) ? Number(eval("instance." + _ref) / 1048576).toFixed(0) : null;
	return value;
}
