/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class is a sheet which present a view to the user that allows them
 * to assign some model on the left to the configured message on the right.
 * It takes the display of the message component and highlights it on the right.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.view.ux.ZtAssignmentView', {
	extend: 'Ext.Sheet',
	requires: [
		'Ext.Anim'
	],
	alias: 'widget.assignmentview',
	config: {
		/**
		 * @cfg {Ext.dom.Element} The element that this assignment view will sit on top of and mask.
		 */
		targetElement: null,

		layout: {
			type: 'hbox',
			align: 'stretch'
		},

		/**
		 * @cfg {Ext.data.Model} The record which is having things assigned to it.
		 */
		record: null,

		hidden: false,

		modal: false,

		/**
		 * @cfg {Object[]} The data with which to populate the store.
		 */
		listData: null,

		/**
		 * @cfg {Ext.data.Model} The store's model
		 */
		listDataModel: null,

		/**
		 * @cfg {String} The title of the list on the left hand side
		 */
		listTitle: null,

		listItemTpl: [
			'{name}'
		],

		/**
		 * @cfg {Object} Config for the whole list
		 */
		list: null,

		/**
		 * @cfg {Number} How long it takes to transition a component from its original location to its
		 *				 assignment overlay position.
		 */
		transitionDuration: 250,

		/**
		 * @cfg {Function}
		 */
		onTransitionComplete: null,

		/**
		 * @cfg {Function}
		 */
		onAssignmentComplete: null,

		listHasOwnHeader: false,

		animatedComponent: null,

		app: null
	},

	constructor: function (cfg) {
		var me = this;

		cfg.cls = 'zcs-sheet';
		cfg.style = "visibility:hidden; position:absolute; padding:0;";

		me.isPhone = Ext.os.deviceType === "Phone";

		if (me.isPhone) {
			cfg.items = [{
				xtype: 'panel',
				layout: 'fit',
				width: '100%',
				cls: 'zcs-assignment-panel',
				items: []
			}];
		} else {
			cfg.items = [{
				xtype: 'panel',
				layout: 'fit',
				width: '30%',
				cls: 'zcs-assignment-panel',
				items: []
			}, {
				xtype: 'panel',
				ui: 'light',
				cls: 'zcs-preview-panel',
				flex: 1,
				padding: '0 1em',
				layout: {
					type: 'vbox',
					align: 'stretch'
				},
				items: [{
					xtype: 'component',
					flex: 1
				}, {
					xtype: 'component',
					itemId: 'animationTarget',
					flex: 1.5
				}, {
					xtype: 'component',
					flex: 1
				}, {
					docked: 'top',
					xtype: 'toolbar',
					items: [
						{xtype: 'spacer'}, {
						xtype: 'button',
						ui: 'neutral',
						text: ZtMsg.cancel,
						handler: function () {
							this.up('.assignmentview').onClose();
						}
					}]
				}]
			}];
		}

		//Don't add another toolbar if the list has its own header
		if (!cfg.listHasOwnHeader) {
			cfg.items[0].items.push({
				xtype: 'titlebar',
				title: cfg.listTitle,
				docked: 'top'
			});
		}

		//Add either a fully configured list or a list using default config options
		cfg.items[0].items.push(cfg.list || {
			xtype: 'list',
			ui: 'dark',
			store: Ext.create('Ext.data.Store', {
				data: cfg.listData,
				proxy: {
					model: cfg.listDataModel,
					type: 'memory'
				}
			}),
			itemTpl: cfg.listItemTpl
		});

		if(me.isPhone) {
            cfg.list.store.getRootNode().insertChild(0, {
                'title':'Cancel',
                'name':'Cancel',
                'displayName':'Cancel',
                'type':'tag',
                'zcsId' : 'cancel',
                'itemCount' : 0,
                'path' : '',
                'disclosure' : false,
                'leaf'  : true
            });
        }
 

		this.callParent(arguments);

		var tapProducer = this.down('nestedlist') || this.down('list'),
			item, eventName;

		tapProducer.on('itemtap', function (list, index, target, organizer, e, eOpts) {
  			item = me.getRecord();
  			if (!target.getDisabled() && organizer.get('zcsId') !== 'cancel') {
  				eventName = item.get('type') + 'Assignment';
  				me.fireEvent(eventName, organizer, item);
  				e.preventDefault();
  				me.onClose();
     		} else if(organizer.get('zcsId') === 'cancel') {
 			    e.preventDefault();
                me.onClose();
  			}
		});

		ZCS.app.on('orientationChange', function (newDimensions) {
			if (this.isHidden() !== null && !this.isHidden()) {
				Ext.defer(this.rePosition, 100, this, [newDimensions]);
			}
		}, this);
	},

	/**
	 * Repositions the assignment view
	 */
	rePosition: function (newDimensions) {
		this.resizeSheet();
		this.positionSheet();
		this.show();

		var appDimensions = newDimensions[ZCS.session.getActiveApp()];
		
		if (!this.isPhone) {
			var targetBox = this.down('#animationTarget').element.getPageBox();

			//TODO - determine how to make the dimensions to use generic.

			this.originalDimensions = appDimensions.itemPanel;

			this.getAnimatedComponent().setWidth(targetBox.width);
			this.getAnimatedComponent().setHeight(targetBox.height);
			this.getAnimatedComponent().setLeft(targetBox.left);
			this.getAnimatedComponent().setTop(targetBox.top);
			this.getAnimatedComponent().show();
		}
	},

	/**
	 * Show the assignment view.
	 *
	 * @param {Ext.Component}  component
	 * @param {Ext.data.Model} record
	 * @param {Number}         contentHeight
	 *
	 */
	showWithComponent: function (component, record, contentHeight) {
		//Clear any previous selections.
		this.down('list').deselectAll();

		this.setRecord(record);

		this.animateComponentIntoPosition(component, contentHeight);
	},

	animateComponentIntoPosition: function (component, contentHeight) {

		var sheet = this;

		if (!this.isPhone) {
			this.popComponentOutOfContainer(component);
			var fromBox = component.element.getPageBox();
		}

		this.setupThisSheet();

		if (!this.isPhone) {
			var targetBox = this.down('#animationTarget').element.getPageBox(),
				anim = Ext.create('Ext.Anim');

			component.setHidden(true);

			component._hidden = true;

			component.on('show', function() {
				sheet.setVisibility(true);
				component.setZIndex(sheet.getZIndex() + 1);
				if (sheet.getOnTransitionComplete()) {
					sheet.getOnTransitionComplete()();
				}
			}, this, { single: true });

			//Pertinent doc, Ext.fx.animation.Abstract
			component.show({
				from: {
					top: fromBox.top,
					left: fromBox.left,
					width: fromBox.width,
					height: fromBox.height
				},
				to: {
					top: targetBox.top,
					left: targetBox.left,
					width: targetBox.width,
					height: Math.min(targetBox.height, contentHeight)
				},
				preserveEndState: true,
				duration: 750
			});

			this.setAnimatedComponent(component);
		} else {
			sheet.setVisibility(true);
			component.setZIndex(sheet.getZIndex() + 1);
			if (sheet.getOnTransitionComplete()) {
				sheet.getOnTransitionComplete()();
			}
		}

	},

	popComponentOutOfContainer: function (component) {
		//Pop the component up into the viewport so it can easily be animated.
		var targetBox = component.element.getPageBox();

		component.element.applyStyles({
			position: 'absolute'
		});

		this.originalParent = component.parent;
		this.originalDimensions = {
			width: component.getWidth(),
			height: component.getHeight(),
			top: component.getTop(),
			left: component.getLeft()
		};

		this.shiftedComponent = component;

		//Set the component properties so the redraw when moving parents happens

		this.updateComponentBox(component, targetBox);

		component.floating = true;

		Ext.Viewport.add(component);

		//Apply the font size scaling that is lost when leaving the tab panel.
		component.element.applyStyles({
			left: targetBox.left,
			top: targetBox.top,
			height: targetBox.height,
			width: targetBox.width,
			"font-size": "0.8em"
		});
	},

	setupThisSheet: function () {
		var sheet = this,
			sheetTargetElement = this.getTargetElement(),
			sheetTargetElementBox = sheetTargetElement.getPageBox();

		this.resizeSheet();

		sheet.showBy(this.getTargetElement());

		this.positionSheet();
	},

	resizeSheet: function () {
		var sheet = this,
			sheetTargetElement = this.getTargetElement(),
			sheetTargetElementBox = sheetTargetElement.getPageBox();

		sheet.setWidth(sheetTargetElementBox.width + 1);
		sheet.setHeight(sheetTargetElementBox.height + 1);
	},

	positionSheet: function () {
		var sheet = this,
			sheetTargetElement = this.getTargetElement(),
			sheetTargetElementBox = sheetTargetElement.getPageBox();

		//Why it's off by 5 I don't know.
		sheet.setLeft(sheetTargetElementBox.left);
		sheet.setTop(sheetTargetElementBox.top);
	},

	updateComponentBox: function (component, targetBox) {
		component.setLeft(targetBox.left);
		component.setTop(targetBox.top);
		component.setHeight(targetBox.height);
		component.height = targetBox.height;
		component.setWidth(targetBox.width);
		component.width = targetBox.width;
	},

	applyAssignmentStore: function (store) {
		this.down('list').setStore(store);
	},

	onClose: function () {
		if (!this.isPhone) {
			this.shiftedComponent.floating = false;
			this.updateComponentBox(this.shiftedComponent, this.originalDimensions);

			this.shiftedComponent.element.applyStyles({
				position: 'relative',
				left: this.originalDimensions.left,
				top: this.originalDimensions.top,
				height: this.originalDimensions.height,
				width: this.originalDimensions.width,
				"font-size": "1em"
			});

			this.originalParent.add(this.shiftedComponent);
		}

		this.setVisibility(false);

		if (this.getOnAssignmentComplete()) {
			this.getOnAssignmentComplete()();
		}
	},

	/**
	 * Does the standard showBy, but does not force visibility at the end.
	 * @adapts Ext.Component.showBy
	 */
	showBy: function (component, alignment) {

        var me = this,
            viewport = Ext.Viewport,
            parent = me.getParent();

        me.setVisibility(false);

        if (parent !== viewport) {
            viewport.add(me);
        }

        me.show();

        me.on({
            hide: 'onShowByErased',
            destroy: 'onShowByErased',
            single: true,
            scope: me
        });
        viewport.on('resize', 'alignTo', me, { args: [component, alignment] });

        me.alignTo(component, alignment);

        ZCS.htmlutil.resetWindowScroll();
    }
});
