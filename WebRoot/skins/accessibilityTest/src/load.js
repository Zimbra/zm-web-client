(function() {
	var util = comcast.access.util;

	// mark all tables in the skin structure that either have no ID or
	// are of type skin_table as presentational
	var skin_shell = Dwt.byId(ZmId.SKIN_SHELL);
	if (skin_shell) {
		AjxUtil.foreach(skin_shell.getElementsByTagName('TABLE'),
					function(table) {
						if (!table.id || Dwt.hasClass(table, 'skin_table')) {
							util.setElementRole(table, 'presentation');
						}
					});
	}

	/* apply overrides to some pre-existing elements */
	var overrides = [
		{
			id: 'xcnavbar',
			role: 'banner',
			label: ZmMsg.bannerTitle
		},

		{
			id: ZmId.SKIN_QUOTA_INFO,
			role: 'contentinfo',
			label: ZmMsg.quota
		},

		{
			id: ZmId.SKIN_FOOTER,
			role: 'complementary',
			label: ZmMsg.footerTitle
		},

		{
			id: ZmId.SKIN_SEARCH,
			role: 'search'
		},

		{
			id: 'comcast-adsrvc',
			hidden: true
		},

		{
			id: 'skin_td_tree_bottom_ad',
			hidden: true
		}
	];

	AjxUtil.foreach(overrides, function(cfg) {
		var el = Dwt.byId(cfg.id);

		if (el) {
			if (cfg.role) {
				util.setElementRole(el, cfg.role);
			}

			if (cfg.label) {
				el.setAttribute('aria-label', cfg.label);
			}

			el.setAttribute('aria-hidden', Boolean(cfg.hidden));

		} else if (window.console) {
			console.warn('cannot apply overrides to %s: no such element!', cfg.id);
		}
	});

	DwtControl.prototype.constructor = DwtControl;

	skin.appCtxtListener(new AjxCallback(skin, function () {
		var callback = new AjxCallback(this, function () {
			setTimeout(function() { util.say(ZmMsg.a11yWelcomeMessage); }, 5000);
		});

		if (appCtxt.inStartup) {
			appCtxt.getAppController().addPostRenderCallback(callback);
		} else {
			callback.run();
		}
	}));
})();
