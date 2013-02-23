/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra, Inc.
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
		 *
		 */
		targetElement: null,

		layout: {
			type: 'hbox',
			align: 'stretch'
		},

		record: null,

		hidden: false,

		assignmentListConfig: null,

		modal: false,

		/**
		 * The data with which to populate the store.
		 */
		listData: null,

		/**
		 * The store's model
		 */
		listDataModel: null,

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
		onAssignmentComplete: null
	},

	constructor: function (cfg) {
		var me = this;

		cfg.style = "visibility: hidden; position: absolute; padding: 0.0em";

		cfg.items = [
			{
				xtype: 'list',
				width: 250,
				store: Ext.create('Ext.data.Store', {
					data: cfg.listData,
					proxy: {
						model: cfg.listDataModel,
						type: 'memory'
					}
				}),
				itemTpl: [
					'{name}'
				]
			}, {
			xtype: 'panel',
			flex: 1,
			padding: '0 15 0 15',
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
					text: 'Cancel',
					handler: function () {
						this.up('.assignmentview').onClose();
					}
				}]
			}]
		}];

		this.callParent(arguments);

		this.down('list').on('select', function (list, assignmentRecord) {
			me.fireEvent('assignment', assignmentRecord, me.getRecord());
			me.onClose();
		});
	},

	showWithComponent: function (component, record) {
		//Clear any previous selections.
		this.down('list').refresh();

		this.setRecord(record);

		this.animateComponentIntoPosition(component);
	},

	animateComponentIntoPosition: function (component) {

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
				height: targetBox.height
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

		sheet.setWidth(sheetTargetElementBox.width);
		sheet.setHeight(sheetTargetElementBox.height);

		sheet.showBy(this.getTargetElement());

		//Why it's off by 5 I don't know.
		sheet.setLeft(sheet.getLeft() - 5);
		sheet.setTop(sheet.getTop() + 5);
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

        ZCS.util.resetWindowScroll();
    }
});