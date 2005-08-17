// XFormItem class: "emailaddr (composite item)
//
// this item is used in the Admin UI to display fields such as session token lifetime
// instance values are strings that contain numbers and characters (/^([0-9])+([dhms])?$/;)
// values d, h, m, and s mean 1 day, 1 hour, 1 minute and 1 second
// 1d means 1 day, 4d means 4 days, 4h means 4 hours, etc.
//
function EmailAddr_XFormItem() {}
XFormItemFactory.createItemType("_EMAILADDR_", "emailaddr", EmailAddr_XFormItem, Composite_XFormItem);
EmailAddr_XFormItem.domainChoices = new XFormChoices([], XFormChoices.OBJECT_LIST, "name", "name");
EmailAddr_XFormItem.prototype.numCols = 4;
EmailAddr_XFormItem.prototype.nowrap = true;
EmailAddr_XFormItem.prototype.initializeItems = 
function () {
	Composite_XFormItem.prototype.initializeItems.call(this);
	if(EmailAddr_XFormItem.domainChoices) {
		if(EmailAddr_XFormItem.domainChoices._choiceObject.length >0) {
			if(EmailAddr_XFormItem.domainChoices._choiceObject[0]) {
				this._domainPart = EmailAddr_XFormItem.domainChoices._choiceObject[0].name;
			}	
		}
	}
};

EmailAddr_XFormItem.prototype.items = [
	{type:_TEXTFIELD_,forceUpdate:true, ref:".", labelLocation:_NONE_,relevantBehavior:_PARENT_, cssClass:"admin_xform_name_input", width:100,
		getDisplayValue:function (itemVal) {
			var val = itemVal;
			if(val) {
				var emailChunks = val.split("@");

				if(emailChunks.length > 1 ) {
					val = emailChunks[0];
				} 
				
				this.getParentItem()._namePart = val;
			} 
			return val;	
		},
		elementChanged:function(namePart, instanceValue, event) {
			var val = namePart + "@";
			if(this.getParentItem()._domainPart)
				val += this.getParentItem()._domainPart;
				
			this.getForm().itemChanged(this.getParentItem(), val, event);
		}
	},
	{type:_OUTPUT_, value:"@"},
	{type:_OSELECT1_, ref:".", labelLocation:_NONE_, relevantBehavior:_PARENT_, choices:EmailAddr_XFormItem.domainChoices,
		getDisplayValue:function (itemVal){
			var val = null;
			if(itemVal) {
				var emailChunks = itemVal.split("@");
			
				if(emailChunks.length > 1 ) {
					val = emailChunks[1];
				} 
			}
			if(!val) {
				val = this.getChoices()._choiceObject[0].name;
			}	
			this.getParentItem()._domainPart = val;
			
			return val;
		},
		elementChanged:function(domainPart,instanceValue, event) {
			var val;
			if(this.getParentItem()._namePart) {
				val = this.getParentItem()._namePart + "@" + domainPart;
			} else {
				val = "@" + domainPart;
			}
			this.getForm().itemChanged(this.getParentItem(), val, event);
		}
	}
];

