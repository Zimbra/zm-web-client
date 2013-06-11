/**
 * Controller which manages the state of the app views in the application.
 * All hiding / showing  / positioning / sizing of the list, overview and item panels goes through this
 * controller.
 *
 * @see ZtAppView
 * @author Macy Abbey <cdamon@zimbra.com>
 */

Ext.define('ZCS.controller.ZtAppViewController', {
	extend: 'Ext.app.Controller',

	config: {
		refs: {
			appview: '.appview',
			listpanelToggle: 'itempanel #listpanelToggle'
		},

		control : {
			appview: {
				registerOverviewPanel: 'doOverviewRegistration',
				registerListPanel: 'doListPanelRegistration',
				registerItemPanel: 'doItemPanelRegistration'
			},
			listpanelToggle: {
				tap: function () {
					this.showListPanel();
				}
			}

		}
	},

	/**
	 * Controls whether the list panel start as shown when the app first loads,
	 * and when the user switches between apps.
	 */
	showListPanelAtStart: true,

	launch: function () {

		this.appViews = {};

		Ext.each(ZCS.constant.APPS, function(app) {
			if (ZCS.session.getSetting(ZCS.constant.APP_SETTING[app])) {
				//Init our bookkeeping object.
                if (app !== ZCS.constant.APP_CALENDAR) {
                    this.appViews[app] = {
                        itemPanel: null,
                        overviewPanel: null,
                        listPanel: null,
                        positioningConfig: null
                    };
                }
                else {
                    this.appViews[app] = {
                        itemPanel: null,
                        overviewPanel: null,
                        positioningConfig: null
                    };
                }
			}
		}, this);

		this.orientation = Ext.Viewport.getOrientation();

		//Respond to events which should change the state of the list panel's toggle button.
		ZCS.app.on('updatelistpanelToggle', function (title, app) {
			this.overviewTitle = title;
			this.updatelistpanelToggle(title, app);
		}, this);

		//Respond to orientation change events, which should reposition, resize and change the state
		//of the list panel and overview panels.
		Ext.Viewport.on('orientationchange', function (viewport, newOrientation, width, height) {
			this.orientation = Ext.Viewport.getOrientation();
			this.resetPanelSize(width, height);
			this.updateModalnessOfOverlays();
			this.updatelistpanelToggle(this.overviewTitle);
			ZCS.app.fireEvent('orientationChange');
		}, this);

		//Handle show overview panel events.
		ZCS.app.on('showOverviewPanel', function () {
			this.showOverviewPanel();
		}, this);

		//Handle hide overview panel events.
		ZCS.app.on('hideOverviewPanel', function () {
			this.hideOverviewPanel();
		}, this);

		//Handle hide list panel events.
		ZCS.app.on('hideListPanel', function () {
			this.hideListPanel();
		}, this);

		//Handle changing apps.
		ZCS.app.on('applicationSwitch', function (newApp) {
			var oldApp = ZCS.session.getActiveApp(),
				oldAppView = this.appViews[oldApp],
				newAppView = this.appViews[newApp];

            if (oldApp !== ZCS.constant.APP_CALENDAR) {
			    oldAppView.listPanel.hide();
            }
			oldAppView.overviewPanel.hide();

            if (newApp !== ZCS.constant.APP_CALENDAR) {
                if (this.showListPanelAtStart) {
                    newAppView.listPanel.show();
                }
            }

            newAppView.itemPanel.show();
		}, this);
	},

	/**
	 * Register an overview panel for the app view.
	 */
	doOverviewRegistration: function (config, appview, positioningConfig) {
		var width = this.getNavigationWidth(positioningConfig),
			sheetConfig = this.getNavigationSheetConfig(config, positioningConfig);

		sheetConfig.hidden = true;
		//The overview should always be modal and hide on tap, the list panel varies by orientation and device.
		sheetConfig.modal = true;
		sheetConfig.hideOnMaskTap = true;


		sheetConfig.width = width;
		sheetConfig.height = this.getAppViewPanelHeight();

		var overviewPanel = Ext.Viewport.add(sheetConfig);

		this.appViews[appview.getApp()].overviewPanel = overviewPanel;
		this.appViews[appview.getApp()].positioningConfig = positioningConfig;
	},

	/**
	 * Register a list panel for the app view.
	 */
	doListPanelRegistration: function (config, appview, positioningConfig) {
		var width = this.getNavigationWidth(positioningConfig),
			sheetConfig = this.getNavigationSheetConfig(config, positioningConfig);

		sheetConfig.width = width;
		sheetConfig.height = this.getAppViewPanelHeight();

		if (this.showListPanelAtStart && appview.getApp() === ZCS.session.getActiveApp()) {
			sheetConfig.left = 0;
			sheetConfig.hidden = false;
		} else {
			sheetConfig.hidden = true;
		}

		var listPanel = Ext.Viewport.add(sheetConfig);

		this.appViews[appview.getApp()].listPanel = listPanel;
		this.appViews[appview.getApp()].positioningConfig = positioningConfig;
	},


	/**
	 * Register an item panel for the app view.
	 */
	doItemPanelRegistration: function (config, appview, positioningConfig) {
        var width = '100%',
            navigationWidth;

        if (appview.getApp() !== ZCS.constant.APP_CALENDAR) {

            width = this.getItemPanelWidth(positioningConfig);
            navigationWidth = this.getNavigationWidth(positioningConfig);

            //If the item navigation is supposed to displace the item panel, make it so.
            this.appViews[appview.getApp()].placeHolder = appview.add({
                xtype: 'container',
                width: navigationWidth,
                hidden: !this.showPlaceholder(positioningConfig)
            });
        }

		config.width = width;

		var itemPanel = appview.add(config);

		this.appViews[appview.getApp()].itemPanel = itemPanel;
		this.appViews[appview.getApp()].positioningConfig = positioningConfig;
	},

	/**
	 * Shows the list panel for the currently active app view.
	 */
	showListPanel: function () {
		var activeApp = ZCS.session.getActiveApp(),
			appViewConfig = this.appViews[activeApp];

		appViewConfig.listPanel.show();
	},

	/**
	 * Shows the overview panel.
	 */
	showOverviewPanel: function () {
		var activeApp = ZCS.session.getActiveApp(),
			appViewConfig = this.appViews[activeApp],
			listPanelZIndex = appViewConfig.listPanel.getZIndex();

		appViewConfig.overviewPanel.setZIndex(listPanelZIndex + 1);

		appViewConfig.overviewPanel.show();
	},

	/**
	 * Hides the overview panel.
	 */
	hideOverviewPanel: function () {
		var activeApp = ZCS.session.getActiveApp(),
			appViewConfig = this.appViews[activeApp];

		appViewConfig.overviewPanel.hide();
	},

	/**
	 * Hides the list panel.
	 */
	hideListPanel: function () {
		var activeApp = ZCS.session.getActiveApp(),
			appViewConfig = this.appViews[activeApp];

		if (!this.alwaysShowListPanel(appViewConfig.positioningConfig)) {
			appViewConfig.listPanel.hide();
		}
	},

	/**
	 * Updates the button on the itempanel view to have the
	 * name of the currently selected thing in the list panel.
	 *
	 * @param {String} buttonText
	 */
	updatelistpanelToggle: function (buttonText, app) {
		var activeApp = app || ZCS.session.getActiveApp(),
			appViewConfig = this.appViews[activeApp],
			itemPanel = appViewConfig.itemPanel;

		if (!this.showPlaceholder(appViewConfig.positioningConfig)) {
			itemPanel.updatelistpanelToggle(buttonText);
		} else {
			itemPanel.updatelistpanelToggle(null);
		}
	},

	/**
	 * Recomputes the size of all navigation elements since they are taller in portrait
	 * than landscape.
	 */
	resetPanelSize: function (width, height) {
		Ext.Object.each(this.appViews, function (app, appViewConfig) {
			var overlayModalness = !this.showPlaceholder(appViewConfig.positioningConfig),
				overlayWidth = this.getNavigationWidth(appViewConfig.positioningConfig, width),
				height = this.getAppViewPanelHeight(height),
				itemPanelWidth = this.getItemPanelWidth(appViewConfig.positioningConfig, width);

			appViewConfig.itemPanel.setWidth(itemPanelWidth);

			//Resize the height and width of these panels because
			//they are not controlled by a layout manager.
			appViewConfig.overviewPanel.setWidth(overlayWidth);
			appViewConfig.placeHolder.setWidth(overlayWidth);
			appViewConfig.overviewPanel.setHeight(height);
			appViewConfig.listPanel.setWidth(overlayWidth);
			appViewConfig.listPanel.setHeight(height);

		}, this);
	},

	/**
	 * Resets the modal behaviors of the navigation elements since we may transition
	 * from modal to non-modal and vice versa.
	 *
	 * For example, if we were in landscape tablet, but transitioned to portrait tablet,
	 * then our overview panel would become modal, and the placeholder would be removed.
	 *
	 */
	updateModalnessOfOverlays: function () {
		Ext.Object.each(this.appViews, function (app, appViewConfig) {
			var overlayModalness = this.makeOverlaysModal(appViewConfig.positioningConfig),
				showPlaceholder = this.showPlaceholder(appViewConfig.positioningConfig),
				alwaysShowListPanel = this.alwaysShowListPanel(appViewConfig.positioningConfig);

			appViewConfig.overviewPanel.setModal(true);
			appViewConfig.overviewPanel.setHideOnMaskTap(true);

			appViewConfig.listPanel.setModal(overlayModalness);
			appViewConfig.listPanel.setHideOnMaskTap(overlayModalness);

			if (showPlaceholder) {
				appViewConfig.placeHolder.show();
			} else {
				appViewConfig.placeHolder.hide();
			}

			if (alwaysShowListPanel && app === ZCS.session.getActiveApp()) {
				appViewConfig.listPanel.show();
			}

		}, this);
	},

	showPlaceholder: function (positioningConfig) {
		var orientationConfig = positioningConfig[this.getDeviceType()][this.orientation];

		return orientationConfig.itemNavigationReservesSpace;
	},

	makeOverlaysModal: function (positioningConfig) {
		return !this.showPlaceholder(positioningConfig);
	},

	alwaysShowListPanel: function (positioningConfig) {
		var orientationConfig = positioningConfig[this.getDeviceType()][this.orientation];

		return orientationConfig.itemNavigationAlwaysShown;
	},

	/**
	 * @private
	 */
	getNavigationWidth: function (positioningConfig, width) {
		var orientationConfig = positioningConfig[this.getDeviceType()][this.orientation],
			width = (width || Ext.Viewport.element.getWidth()) * orientationConfig.navigationWidth;

		return width;
	},

	/**
	 * @private
	 */
	getItemPanelWidth: function (positioningConfig) {
		var orientationConfig = positioningConfig[this.getDeviceType()][this.orientation];

		if (orientationConfig.itemNavigationReservesSpace) {
			return (100 - orientationConfig.navigationWidth * 100) + '%';
		} else {
			return '100%';
		}
	},

	getNavigationSheetConfig: function (config, positioningConfig) {
		return {
			xtype: 'sheet',
			layout: 'fit',
			items: [
				config
			],
			modal: this.makeOverlaysModal(positioningConfig),
			enter: 'left',
			exit: 'left',
			masked: false,
			centered: false,
			hideOnMaskTap: this.makeOverlaysModal(positioningConfig),
			style: 'padding: 0; position: absolute;font-size:81%;',
			padding: 0,
			top: this.getNavigationTopPosition()
		};
	},

	getNavigationTopPosition: function () {
		return '3.2em';
	},

	getAppViewPanelHeight: function (height) {
		return (height || Ext.Viewport.element.getHeight()) - 51;
	},

	getDeviceType: function () {
		//Tablet is default for testing in a browser.
		var dt = Ext.os.deviceType;

		if (dt === 'Desktop') {
			return 'tablet';
		} else {
			return dt.toLowerCase();
		}
	}
});
