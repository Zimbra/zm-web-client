/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
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
Ext.define('ZCS.view.mail.ZtAssignmentView', {
	extend: 'Ext.Sheet',
	requies: [
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

		listHasOwnHeader: false

	},

	constructor: function (cfg) {
		var me = this;

		cfg.cls = 'zcs-sheet';
		cfg.style = "visibility:hidden; position:absolute; padding:0;";

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
					text: 'Cancel',
					handler: function () {
						this.up('.assignmentview').onClose();
					}
				}]
			}]
		}];

		//Don't add another toolbar if the list has its own header
		if (!cfg.listHasOwnHeader) {
			cfg.items[0].items.push({
				xtype: 'titlebar',
				title: cfg.listTitle,
				docked: 'top'
			});
		}

		//Add either a fully configured list or a list using config options
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

		this.callParent(arguments);

		var tapProducer;

		if (this.down('nestedlist')) {
			tapProducer = this.down('nestedlist');
		} else {
			tapProducer = this.down('list');
		}

		tapProducer.on('itemtap', function (list, index, target, assignmentRecord, e, eOpts) {
			me.fireEvent('assignment', assignmentRecord, me.getRecord());
			e.preventDefault();
			me.onClose();
		});
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

		component.suppressRedraw = true;

		this.popComponentOutOfContainer(component);
		var fromBox = component.element.getPageBox();
		this.setupThisSheet();

		var targetBox = this.down('#animationTarget').element.getPageBox(),
			anim = Ext.create('Ext.Anim');

		component.setHidden(true);

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
			onEnd: function () {
				sheet.setVisibility(true);
				component.setZIndex(sheet.getZIndex() + 1);
				if (sheet.getOnTransitionComplete()) {
					sheet.getOnTransitionComplete()();
				}
			},
			duration: 750
		})
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

		sheet.setWidth(sheetTargetElementBox.width + 1);
		sheet.setHeight(sheetTargetElementBox.height + 1);

		sheet.showBy(this.getTargetElement());

		//Why it's off by 5 I don't know.
		sheet.setLeft(sheet.getLeft() - 5);
		sheet.setTop(sheet.getTop() + 4);
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
		this.shiftedComponent.suppressRedraw = false;
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
	    var args = Ext.Array.from(arguments);

        var viewport = Ext.Viewport,
            parent = this.getParent();

        this.setVisibility(false);

        if (parent !== viewport) {
            viewport.add(this);
        }

        this.show();

        this.on('erased', 'onShowByErased', this, { single: true });
        viewport.on('resize', 'refreshShowBy', this, { args: [component, alignment] });

        this.currentShowByArgs = args;

        this.alignTo(component, alignment);

        ZCS.htmlutil.resetWindowScroll();
    }
});
