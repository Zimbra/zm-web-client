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
			listpanelToggle: 'itempanel #listpanelToggle',
			appsMenu: 'appsmenu',
			organizerEdit: 'organizeredit',
			appContainer: 'ztmain'
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
			},
			'folderlist': {
				showAppsMenu: 'doShowAppsMenu'
			},
			'caltoolbar': {
				showAppsMenu: 'doShowAppsMenu'
			},
			'appsmenu list': {
				itemtap: 'onAppMenuItemTap'
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
			if (ZCS.util.isAppEnabled(app)) {
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
			var newDimensions = this.resetPanelSize(width, height);
			this.updateModalnessOfOverlays(newDimensions);
			this.updatelistpanelToggle(this.overviewTitle);
			this.getAppsMenu().setDimensions();
			this.getOrganizerEdit().setDimensions();
			ZCS.app.fireEvent('orientationChange', newDimensions);
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

		//Handle show list panel events.
		ZCS.app.on('showListPanel', function () {
			this.showListPanel();
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
                    if (newApp === ZCS.constant.APP_CONTACTS) {
                        /**
                         * When user taps on the 'Contacts' tab, load contacts from the system Contacts
                         * folder only.
                         */
                        ZCS.app.getContactListController().loadContacts();
                    }
                    newAppView.listPanel.show();
                }
            }
            else {
                // Fix for bug: 83607 - Loads read/unread appointments
                ZCS.app.getCalendarController().loadCalendar();
            }

            newAppView.itemPanel.show();
		}, this);
	},

	doShowAppsMenu: function (button, e) {
		this.hideOverviewPanel();
		this.getAppsMenu().show();
	},

	onAppMenuItemTap: function (list, index, target, record, e) {
		var mainAppContainer = this.getAppContainer(),
			appName = record.get('app');

		if (appName == 'signout') {
			mainAppContainer.fireEvent('logout');
		} else if (appName != 'settings') {
			mainAppContainer.setActiveItem('[app='+appName+']');
			this.getAppsMenu().hide();
		}
	},

	/**
	 * Register an overview panel for the app view.
	 */
	doOverviewRegistration: function (config, appview, positioningConfig) {
		var width = this.getNavigationWidth(positioningConfig),
			sheetConfig = this.getOverviewSheetConfig(config, positioningConfig);

		sheetConfig.hidden = true;
		//The overview should always be modal and hide on tap, the list panel varies by orientation and device.
		sheetConfig.modal = true;
		sheetConfig.hideOnMaskTap = true;


		sheetConfig.width = width;
		sheetConfig.height = this.getOverviewPanelHeight();


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
		sheetConfig.height = '100%';

		if (this.showListPanelAtStart && appview.getApp() === ZCS.session.getActiveApp()) {
			sheetConfig.left = 0;
			sheetConfig.hidden = false;
		} else {
			sheetConfig.hidden = true;
		}

		var listPanel = appview.add(sheetConfig);

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
		var newDimensions = {};

		Ext.Object.each(this.appViews, function (app, appViewConfig) {
			var overlayModalness = !this.showPlaceholder(appViewConfig.positioningConfig),
				overlayWidth = this.getNavigationWidth(appViewConfig.positioningConfig, width),
				overviewHeight = this.getOverviewPanelHeight(),
				itemPanelWidth = this.getItemPanelWidth(appViewConfig.positioningConfig, width);

			appViewConfig.itemPanel.setWidth(itemPanelWidth);

			//Resize the height and width of these panels because
			//they are not controlled by a layout manager.
			appViewConfig.overviewPanel.setWidth(overlayWidth);
			if (appViewConfig.placeHolder) {
				appViewConfig.placeHolder.setWidth(overlayWidth);
			}

			appViewConfig.overviewPanel.setHeight(overviewHeight);


			newDimensions[app] = {
				listPanel: {
					width: overlayWidth
				},
				itemPanel: {
					width: itemPanelWidth
				},
				placeHolder: {
					width: overlayWidth
				},
				overviewPanel: {
					width: overlayWidth,
					height: overviewHeight
				}
			};

		}, this);

		return newDimensions;
	},

	/**
	 * Resets the modal behaviors of the navigation elements since we may transition
	 * from modal to non-modal and vice versa.
	 *
	 * For example, if we were in landscape tablet, but transitioned to portrait tablet,
	 * then our overview panel would become modal, and the placeholder would be removed.
	 *
	 */
	updateModalnessOfOverlays: function (newDimensions) {
		Ext.Object.each(this.appViews, function (app, appViewConfig) {
			var overlayModalness = this.makeOverlaysModal(appViewConfig.positioningConfig),
				showPlaceholder = this.showPlaceholder(appViewConfig.positioningConfig),
				alwaysShowListPanel = this.alwaysShowListPanel(appViewConfig.positioningConfig),
				listPanelPosition,
				placeHolderPosition,
				overviewPanelPosition;

			appViewConfig.overviewPanel.setModal(true);
			appViewConfig.overviewPanel.setHideOnMaskTap(true);

			if (appViewConfig.listPanel) {
				appViewConfig.listPanel.setModal(overlayModalness);
				appViewConfig.listPanel.setHideOnMaskTap(overlayModalness);
			}

			if (appViewConfig.placeHolder) {
				if (showPlaceholder) {
					appViewConfig.placeHolder.show();
				} else {
					appViewConfig.placeHolder.hide();
				}
			}

            if (appViewConfig.listPanel) {
    			if (alwaysShowListPanel && app === ZCS.session.getActiveApp()) {
    				appViewConfig.listPanel.show();
    			} else {
                    appViewConfig.listPanel.hide();
                }
            }


			if (appViewConfig.listPanel && appViewConfig.listPanel.getPosition) {
				var listPanelPosition = appViewConfig.listPanel.getPosition();
				newDimensions[app].listPanel.top = listPanelPosition.top;
				newDimensions[app].listPanel.left = listPanelPosition.left;
			}

			if (appViewConfig.placeHolder && appViewConfig.placeHolder.getPosition) {
				var placeHolderPosition = appViewConfig.placeHolder.getPosition();
				newDimensions[app].placeHolder.top = placeHolderPosition.top;
				newDimensions[app].placeHolder.left = placeHolderPosition.left;
			}



		}, this);
	},

	showPlaceholder: function (positioningConfig) {
		var orientationConfig = positioningConfig[ZCS.util.getDeviceType()][this.orientation];

		return orientationConfig.itemNavigationReservesSpace;
	},

	makeOverlaysModal: function (positioningConfig) {
		return !this.showPlaceholder(positioningConfig);
	},

	alwaysShowListPanel: function (positioningConfig) {
		var orientationConfig = positioningConfig[ZCS.util.getDeviceType()][this.orientation];

		return orientationConfig.itemNavigationAlwaysShown;
	},

	/**
	 * @private
	 */
	getNavigationWidth: function (positioningConfig, width) {
		var orientationConfig = positioningConfig[ZCS.util.getDeviceType()][this.orientation],
			width = (width || Ext.Viewport.element.getWidth()) * orientationConfig.navigationWidth;

		return width;
	},

	/**
	 * @private
	 */
	getItemPanelWidth: function (positioningConfig) {
		var orientationConfig = positioningConfig[ZCS.util.getDeviceType()][this.orientation];

		if (orientationConfig.itemNavigationReservesSpace) {
			return (100 - orientationConfig.navigationWidth * 100) + '%';
		} else {
			return '100%';
		}
	},

	getNavigationSheetConfig: function (config, positioningConfig) {
		return this.getSheetConfig(
			config,
			positioningConfig
		);
	},


	getOverviewSheetConfig: function (config, positioningConfig) {
		return this.getSheetConfig(
			config,
			positioningConfig
		);
	},


	getSheetConfig: function (config, positioningConfig) {
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
			padding: 0,
			top: 0
		};
	},

	getOverviewPanelHeight: function (height) {
		return (height || Ext.Viewport.element.getHeight());
	}
});
