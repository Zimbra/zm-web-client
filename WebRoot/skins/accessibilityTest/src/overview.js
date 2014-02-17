(function(){

	skin.classListener('ZmOverview', function() {
		ZmOverview.prototype.a11yRole = 'navigation';
		ZmOverview.prototype.a11yFocusable = true;
		ZmOverview.prototype.a11yTitle = ZmMsg.overviewTitle;
		ZmOverview.prototype.a11yFocusesChild = true;
	});

	// DE2920: always hide the sync option
	skin.override.append("ZmFolderTreeController.prototype.resetOperations", function(parent){
		var button = parent.getOp(ZmOperation.SYNC_OFFLINE_FOLDER);
		if (button) {
			button.setVisible(false);
		}	
	});

	// DE2874: Display a status message when a folder is emptied
	skin.override("ZmOrganizer.prototype.empty", function(doRecursive, batchCmd){
		doRecursive = doRecursive || false;

		var isEmptyOp = ((this.type == ZmOrganizer.FOLDER || this.type == ZmOrganizer.ADDRBOOK) &&
						 (this.nId == ZmFolder.ID_SPAM ||
						  this.nId == ZmFolder.ID_TRASH ||
						  this.nId == ZmFolder.ID_CHATS ||
						  this.nId == ZmOrganizer.ID_SYNC_FAILURES));

		// make sure we're not emptying a system object (unless it's SPAM/TRASH/SYNCFAILURES)
		if (this.isSystem() && !isEmptyOp) { return; }

		var params = {action:"empty", batchCmd:batchCmd};
		params.attrs = (this.nId == ZmFolder.ID_TRASH)
			? {recursive:true}
			: {recursive:doRecursive};

		if (this.isRemote()) {
			params.id = this.getRemoteId();
		}

		// Add an actionText so a status will be displayed. This is our only change
		params.actionText = ZmMsg.folderEmptied;

		this._organizerAction(params);
	});
})();
