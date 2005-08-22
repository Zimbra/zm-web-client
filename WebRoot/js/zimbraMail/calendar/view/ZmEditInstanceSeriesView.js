/*
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
*/

function ZmEditInstanceSeriesView (parent, recurranceInstance) {
	DwtComposite.call(this,parent,"ZmEditInstanceSeriesView");
	this._formId = Dwt.getNextId();
	this._form = new XForm(this.getForm(this._formId), null, recurranceInstance, this);
	this._form.setController(this);
	this._recInstance = recurranceInstance;
	this.render();
}

ZmEditInstanceSeriesView.prototype = new DwtComposite();
ZmEditInstanceSeriesView.prototype.constructor = ZmEditInstanceSeriesView;

ZmEditInstanceSeriesView.prototype.render = function () {
	this._form.draw();
};

ZmEditInstanceSeriesView.prototype.getDragHandleId = function () {
	if (this._dragHandleId == null) {
		this._dragHandleId =  this._formId + "_dialogTitle";
	}
	return this._dragHandleId;
};

ZmEditInstanceSeriesView.prototype.getForm = function (formId) {
	if (this._xform != null) return this._xform;
	this._xform = {
		numCols:1,
		id: formId,
		items: [
				//{ref:"title", cssClass: "title", id:"dialogTitle", type: _OUTPUT_},
				//{type:_SPACER_, height:10},
		    {ref: "message", type: _OUTPUT_},
 		    {type:_SPACER_, height:15},
		    {type:_GROUP_, numCols:5, cssStyle:"width:100%",  relevant:"instance.operation != ZmAppt.MODE_DELETE",
			 items: [
				{type:_DWT_BUTTON_, label:ZmMsg.openInstance, onActivate:"this.getFormController().buttonHit(event)"},
				{type:_CELL_SPACER_, width:2},
			    {type:_DWT_BUTTON_, label:ZmMsg.openSeries, onActivate:"this.getFormController().buttonHit(event)"}, 
				{type:_CELL_SPACER_, width:2},
		        {type:_DWT_BUTTON_, label:ZmMsg.cancel, onActivate:"this.getFormController().buttonHit(event)"}
				]
			},
		    {type:_GROUP_, numCols:3, cssStyle:"width:100%", relevant:"instance.operation == ZmAppt.MODE_DELETE",
			 items: [
		{type:_DWT_BUTTON_, width:"95px", label:ZmMsg.deleteInstance, onActivate:"this.getFormController().buttonHit(event)"},
			     {type:_DWT_BUTTON_, label:ZmMsg.deleteSeries, onActivate:"this.getFormController().buttonHit(event)"}, 
		         {type:_DWT_BUTTON_, label:ZmMsg.cancel, onActivate:"this.getFormController().buttonHit(event)"}
				]
			}

		]
	}
	return this._xform;
};

// this is the item
ZmEditInstanceSeriesView.prototype.buttonHit = function (event, form, item) {
	this.notifyListeners(DwtEvent.BUTTON_PRESSED, event);
};

ZmEditInstanceSeriesView.prototype.setData = function (obj) {
	this._recInstance = obj;
	this._form.setInstance(obj);
};
