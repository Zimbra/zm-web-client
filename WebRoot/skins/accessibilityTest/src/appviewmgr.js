(function(){
	skin.override(['ZmAppViewMgr.prototype.setViewComponents', 'ZmAppViewMgr.prototype.addComponents'], function(viewId, components, show, app) {

		var r = arguments.callee.func.apply(this,arguments);

		if (true || viewId === ZmAppViewMgr.GLOBAL || viewId === ZmAppViewMgr.APP)
			return r;

		var view = this._view[viewId];
		var labelid = ZmId.getButtonId(ZmId.APP,
									   (view.isTabView ?
										view.tabParams.id : view.app));

		// create a 'tab' component if none exists, which provides a
		// 'main' landmark
		if (!components.tab) {
			var tab = new DwtComposite({ parent: this._shell,
										 className: 'A11yMainPanel' });
			A11yUtil.setElementRole(tab.getHtmlElement(), 'main');
			tab.getHtmlElement().setAttribute('aria-labelledby', labelid);

			components.tab = tab;
		}

		// Some screen readers let users navigate by DOM position, so we want
		// to specify which components go first in the DOM. They're all absolutely
		// positioned anyway, so this won't affect the layout
		// For DE3041, we specifically want the toolbar to go after the main component
		var domOrder = ["main","topToolbar"];
		var componentNames = AjxUtil.keys(components);

		AjxUtil.foreach(domOrder, function(key) {
			if (AjxUtil.arrayRemove(componentNames, key)) {
				componentNames.push(key);
			}
		});

		components.tab.getHtmlElement().setAttribute('aria-hidden', !show);

		// we want all components (and their toolbars) to be nested
		// within a main landmark region
		for (var i=0; i < componentNames.length; i++) {
			var cid = componentNames[i];

			if (cid === 'tab') {
				continue;
			} else if (components[cid].parent == this._shell) {
				if (window.console)
					console.log('reparenting %s of %s', cid, viewId);

				components[cid].reparent(components.tab);
			} else {
				if (window.console)
					console.log('not reparenting %s of %s', cid, viewId);
			}
		}

	});
	
	skin.override('ZmAppViewMgr.prototype._setViewVisible', function(viewId, show) {
		var r = arguments.callee.func.apply(this, arguments);

		var view = this._view[viewId || this._currentViewId] || this._emptyView;
		var tab = view.component.tab;

		if (tab) {
			tab.getHtmlElement().setAttribute('aria-hidden', !show);
		}

		if (!appCtxt.isChildWindow) {
			var appid = view.tabParams ? view.tabParams.id : view.app;
			var button = appCtxt.getAppChooser().getButton(appid);

			if (button) {
				tab = this._view[viewId].component.tab;
				if (tab) {
					var tabid = tab.getHTMLElId();
					button.getHtmlElement().setAttribute('aria-controls', tabid);
				}
			} else if (window.console) {
				console.log('warn no tab button for %s', viewId);
			}
		}

		return r;
	});

	A11yUtil.mustNotScroll(Dwt.byId("skin_outer"));

	skin.override("ZmAppCtxt.prototype.setShell", function(shell){
		arguments.callee.func.apply(this,arguments);
		A11yUtil.mustNotScroll(shell.getHtmlElement());
		A11yUtil.setTableRolePresentation([shell._busyOverlay, shell._veilOverlay, shell._curtainOverlay]);
	});

	skin.override("ZmAppViewMgr.prototype.pushView", function(viewId, force) {
		var r = arguments.callee.func.apply(this,arguments);
		var view = this._view[viewId] || this._emptyView;
		var tp = view && view.tabParams;
		if (tp) {
			this._viewByTabId[tp.id] = viewId; // Update viewByTabId so tabs can be closed by their buttons
		}
		return r;
	});

	skin.override("ZmAppViewMgr.prototype._fitToContainer", function() {
		A11yUtil.normalizeScrolls();
		arguments.callee.func.apply(this,arguments);
	});

})();
