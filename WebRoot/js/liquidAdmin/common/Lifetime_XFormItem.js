// XFormItem class: "lifetime (composite item)
//
// this item is used in the Admin UI to display fields such as session token lifetime
// instance values are strings that contain numbers and characters (/^([0-9])+([dhms])?$/;)
// values d, h, m, and s mean 1 day, 1 hour, 1 minute and 1 second
// 1d means 1 day, 4d means 4 days, 4h means 4 hours, etc.
//
function Lifetime_XFormItem() {}
XFormItemFactory.createItemType("_LIFETIME_", "lifetime", Lifetime_XFormItem, Composite_XFormItem);

Lifetime_XFormItem.prototype.TIME_CHOICES = [
 				{value:"d", label:"Days"},
				{value:"h", label:"Hours"},
				{value:"m", label:"Minutes"},
				{value:"s", label:"Seconds"}
];


Lifetime_XFormItem.prototype.items = [
	{type:_TEXTFIELD_, ref:".", labelLocation:_NONE_,relevantBehavior:_PARENT_, cssClass:"admin_xform_number_input", 
		getDisplayValue:function (itemVal) {
			var val = "1";
			if(itemVal != null && itemVal.length >0) {
				if(itemVal.length > 1) {
					val = itemVal.substr(0, itemVal.length-1);				
				} else {
					if(itemVal == "0") {
						val = "0";
					} else {
						val = "1";
					}
				}
			}
			this.getParentItem()._numericPart = val;
			return val;	
		},
		elementChanged:function(numericPart, instanceValue, event) {
			var val = numericPart + this.getParentItem()._stringPart;
			this.getForm().itemChanged(this.getParentItem(), val, event);
		}
	},
	{type:_OSELECT1_, ref:".", labelLocation:_NONE_, relevantBehavior:_PARENT_, choices:Lifetime_XFormItem.prototype.TIME_CHOICES,
		getDisplayValue:function (itemVal){
			var val = "d";
			if(itemVal != null && itemVal.length >0) {
				if(itemVal.length > 1) {
					val = itemVal.substr(itemVal.length-1, 1);
				} else if (itemVal != "0") {
					val = (itemVal == "d" || itemVal == "h" || itemVal== "m" || itemVal == "s") ? itemVal : "d";
				}
			}
			this.getParentItem()._stringPart = val;
			return val;
		},
		elementChanged:function(stringPart,instanceValue, event) {
			var val = this.getParentItem()._numericPart + stringPart;
			this.getForm().itemChanged(this.getParentItem(), val, event);
		}
	}
];

function Lifetime1_XFormItem() {}
XFormItemFactory.createItemType("_LIFETIME1_", "lifetime1", Lifetime1_XFormItem, Composite_XFormItem);

Lifetime1_XFormItem.prototype.TIME_CHOICES = [
 				{value:"d", label:"Days"},
				{value:"h", label:"Hours"}
];


Lifetime1_XFormItem.prototype.items = [
	{type:_TEXTFIELD_, ref:".", labelLocation:_NONE_,relevantBehavior:_PARENT_, cssClass:"admin_xform_number_input", 
		getDisplayValue:function (itemVal) {
			var val = "1";
			if(itemVal != null && itemVal.length >0) {
				if(itemVal.length > 1) {
					val = itemVal.substr(0, itemVal.length-1);				
				} else {
					if(itemVal == "0") {
						val = "0";
					} else {
						val = "1";
					}
				}
			}
			this.getParentItem()._numericPart = val;
			return val;	
		},
		elementChanged:function(numericPart, instanceValue, event) {
			var val = numericPart + this.getParentItem()._stringPart;
			this.getForm().itemChanged(this.getParentItem(), val, event);
		}
	},
	{type:_OSELECT1_, ref:".", labelLocation:_NONE_, relevantBehavior:_PARENT_, choices:Lifetime1_XFormItem.prototype.TIME_CHOICES,
		getDisplayValue:function (itemVal){
			var val = "d";
			if(itemVal != null && itemVal.length >0) {
				if(itemVal.length > 1) {
					val = itemVal.substr(itemVal.length-1, 1);
				} else if (itemVal != "0") {
					val = (itemVal == "d" || itemVal == "h" || itemVal== "m" || itemVal == "s") ? itemVal : "d";
				}
			}
			this.getParentItem()._stringPart = val;
			return val;
		},
		elementChanged:function(stringPart,instanceValue, event) {
			var val = this.getParentItem()._numericPart + stringPart;
			this.getForm().itemChanged(this.getParentItem(), val, event);
		}
	}
];
