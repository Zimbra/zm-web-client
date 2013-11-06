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
 * @class ZCS.view.ZtBubbleArea
 *
 * This is an area which can have 'bubbles' added to it.
 * It can be used as a field in forms
 * It contains a bubble area and a menu icon to invoke a dropdown
 * The label field is used to show the menu icon.
 * For components that specify a labelField, the label will be placed on top of
 * the bubble area  with the menu icon on its right.
 * For components that do not specify a label (eg placed in a grid cell) the label containing
 * the icon will be placed to the right side of the bubble area.
 */
Ext.define('ZCS.view.ux.ZtBubbleArea', {
    extend: 'Ext.Container',
    requires: [
        'Ext.util.MixedCollection'
    ],
    alias: 'widget.bubblearea',

    //Setting sencha touch config options.
    config: {
        cls: [
            'x-field',
            'zcs-bubblearea'
        ],

        /**
         * @required
         *
         * @cfg {String} bubbleDisplayField
         *
         * The field to use as the display field for bubbles
         */
        bubbleDisplayField: undefined,

        label: null,

        labelWidth: 100,

        layout: {
            type: 'hbox'
        },

        /**
         * @cfg {boolean} readOnly
         *
         * Controls whether this area has an input or not.
         */
        readOnly: false,

        /**
         * @cfg {boolean} preventDuplicates
         *
         * Specifies if the dropdown should prevent selecting / adding
         * duplicate bubbles.
         */
        preventDuplicates: true,

        /**
         * @cfg {Function} getBubbleModelFromInput
         *
         * A function which when passed a string input, will return a bubble model,
         * if a falsy value is returned, it will be assumed the input should not
         * be made into a bubble.
         */
        getBubbleModelFromInput: null,

        /**
        * @cfg {Number} defaultInputWidth
        *
        *  The default width of the actual input inside of this component.  It starts small
        *  so that it can fit on the same line as a lot of bubbles.
        */
        defaultInputWidth: 30,


        inputCharacterWidthIncrement: 20,

        name: null,

        listeners: {
            initialize: function() {
                var me = this;

                if (!me.getReadOnly()) {
                    me.inputField = me.down('#inputField');
                    me.element.on('tap', function (e, el) {
                        me.focusInput();
                        return true;
                    });
                }
            }
        }
    },

    /**
     * @cfg An additional css class to apply to a bubble.
     */
    bubbleCls: '',

    /**
     * @private
     *
     * @cfg The tpl to use for bubbles.
     */
    bubbleTpl: ZCS.template.Bubble,

    /**
     * @required
     * {Array<Ext.data.Model>} An array of bubbles to start in the area.  Do not rely on this object being kept in
     *              sync with the bubble area.  Instead use getBubbles to retrieve the current bubbles.
     *
     * @attr {} record The data to store along with this bubble.  It will be return in getBubbles. Note this must contain the field in bubbleDisplayField.
     */
    initialBubbles: undefined,

    /**
     * @private
     *
     * The close trigger selector
     */
    closeTriggerSelector: '.bubble-close-icon',

    /**
     * @private
     *
     * Internal collection holding all bubble data passed in that has not been deleted by the user.
     */
    bubbles : null,

    /**
     * @private
     *
     * Internal collection holding all bubble elements
     */
    bubbleElements : null,

    autoScroll: true,

    /**
     * @template
     *
     * Implement this function to do some custom validation logic when a new bubble is added by the user.
     */
    validBubble: function (newBubbleModel) {
        if (false) {
            return 'Some error message here';
        }

        return true;
    },

    /**
     * Make sure the parent form considers this container a form field for things like validation and resetting.
     *
     */
    isField: true,

    /**
     * @template
     *
     * Implement this function to conditionally decide to automatically make a bubble from the input
     * on input blur or on enter/hide press.
     */
    shouldAutoBubble: function () {
        return true;
    },

    constructor: function(cfg) {
        var me = this,
            inputField = this.getInputField();

        if (cfg.readOnly) {
            me.fieldBodyCls += ' zcs-read-only';
        }

        me.bubbles = new Ext.util.MixedCollection();

        me.bubbleElements = new Ext.util.MixedCollection();

        me.emptyTextHtml =  '<span class="emptyText">' + cfg.emptyText + '</span>';

        me.html = !cfg.readOnly ? me.emptyTextHtml : '';

        //Setup the area with a label
        cfg.items = [{
            xtype: 'component',
            html: '<span>' + cfg.label + '</span>',
            cls: 'x-form-label x-form-label-nowrap',
            width: cfg.label ? cfg.labelWidth || 100 : 0
        }, {
            xtype: 'container',
            itemId: 'mainContents',
            cls: 'bubble-main-contents',
            flex: 1,
            items: cfg.readOnly ? [] : [inputField]
        }];

        me.callParent(arguments);
        me.initConfig(cfg);

        if (me.initialBubbles) {
            Ext.Array.each(me.initialBubbles, function (bubble) {
                me.addBubble(bubble);
            });

            this.fireEvent('initialBubblesAdded');
        }
        this.inputField = this.down('#inputField');
    },

    /**
     * This will get called by the parent form's reset function call.
     *
     */
    reset: function () {
        var mainContents = this.down('#mainContents');
        mainContents.removeAll();
        this.bubbles.clear();
        this.bubbleElements.clear();

        if (!this.getReadOnly()) {
            mainContents.add(this.getInputField());
        }

        this.inputField = this.down('#inputField');
    },

    /**
     * Clears the input area of text.
     *
     */
    clearInput: function() {
        this.getInput().dom.value = '';
    },

    /**
     * Focus the input.
     */
    focusInput: function() {
        this.getInput().dom.focus();
    },

    getInput: function () {
        return this.inputField.element.down('input');
    },

    /**
     *
     * Add an array of bubbles to the area.
     *
     * @param {Ext.data.Model[]} bubbleModels The models to add.
     */
    addBubbles: function(bubbleModels) {
        var me = this;
        Ext.Array.each(bubbleModels, function (model) {
            me.addBubble(model);
        });
    },

    /**
     *
     * Adds a bubble to the area.
     *
     * @param {Ext.data.Model} bubbleModel  The is the object that will be returned from getBubbles.
     *
     */
    addBubble: function(bubbleModel) {

        if (this.hasBubble(bubbleModel) && this.getPreventDuplicates()) {
            return;
        }

        var valid = this.validBubble(bubbleModel);
        if (typeof valid === 'string') {
            this.setError(valid);
            return;
        } else if (!valid) {
            //TODO: use Zt localization
            this.setError('Error');
            return;
        }

        var me = this,
            numberOfBubbles = me.bubbles.length,
            tplData = Ext.apply(bubbleModel, {
                bubbleCls: me.bubbleCls,
                bubbleName: bubbleModel.get(me.getBubbleDisplayField())
            }),
            bubbleElement,
            newBubble = {
                xtype: 'component',
                cls: 'bubble-comp',
                tpl: me.bubbleTpl,
                data: bubbleModel,
                listeners: {
                    initialize: function () {
                        var thisBubble = this;

                        if (!me.getReadOnly()) {
                            thisBubble.closeTrigger = Ext.get(this.element.down(me.closeTriggerSelector));

                            thisBubble.closeTrigger.on('tap', function (e) {
                                e.stopEvent();
                                me.removeBubble(thisBubble);
                                return false;
                            });
                        }

                        this.element.on('tap', function (event, node, options, eOpts) {
                            me.fireEvent('bubbleTap', thisBubble, {
                                field:      me,
                                bubble:     thisBubble,
                                menuName:   ZCS.constant.MENU_RECIPIENT
                            });
                        });
                    }
                }
            };

        if (me.bubbleElements.getCount() === 0) {
            me.down('#mainContents').setHtml('');
        }

        bubbleElement = me.down('#mainContents').insert(numberOfBubbles, newBubble);

        bubbleElement.data = bubbleModel;
        bubbleElement.bubbleModel = bubbleModel;

        me.bubbles.add(bubbleModel);

        me.bubbleElements.add(bubbleElement);

        me.fireEvent('bubbleAdded', bubbleModel);
        if (me.inputField) {
           me.inputField.validate();
        }
    },

    /**
     *
     * Used to check if the bubble area already has a bubble added to it or not.
     *
     * @param {Ext.data.Model} bubbleModel
     *           A model which the bubble area may already have inside of it.
     *
     * @returns {bool} True if this bubble area already has had the bubbleModel added to it.
     */
    hasBubble: function (bubbleModel) {
        var hasBubble = false;
        this.bubbles.each(function (bubble) {
            if (bubble.get('id') === bubbleModel.get('id')) {
                hasBubble = true;
            }
        });
        return hasBubble;
    },

    /**
     * Retrieve all bubbles in this area.
     *
     * @returns {Object} The objects passed into addBubble that have no been removed by the user.
     */
    getBubbles: function() {
        return this.bubbles.getRange();
    },

    /**
     * @private
     * Retreive all bubble elements in the area.
     */
    getBubbleElements: function() {
        return this.bubbleElements.getRange();
    },

    /**
     *
     * Adds a new set of bubbles to the area.
     *
     * @param {Ext.data.Model[]} bubbleModels The models to add.
     */
    setBubbles: function(bubbles) {
        var me = this;

        // remove old bubbles
        me.bubbleElements.each(function(item) {
            this.removeBubble(item);
        }, me);

        me.addBubbles(bubbles);
    },

    /**
     * @private
     *
     * Removes a bubble from the area.
     *
     * @param {Ext.Component} The bubble component to remove.
     */
    removeBubble: function(bubble) {
        var me = this;

        me.down('#mainContents').remove(bubble);
        me.bubbleElements.remove(bubble);
        me.bubbles.remove(bubble.bubbleModel);

        me.fireEvent('bubbleRemoved', bubble.bubbleModel);
        if (me.inputField) {
           me.inputField.validate();
        }
    },

    /**
     * @private
     *
     *  Remove the last bubble in the area.
     */
    removeLastBubble: function() {
        var bubbles = this.getBubbles(),
            lastBubble,
            numBubbles = bubbles ? bubbles.length : 0;

        if (numBubbles > 0) {
            lastBubble = this.bubbleElements.getAt(numBubbles - 1);
            this.removeBubble(lastBubble);
        }
    },

    /**
     * @private
     *
     * @return {Object}   The configuration for the input field used by this bubble area.
     */
    getInputField: function() {
        var me = this;

        return {
            itemId: 'inputField',
            xtype: 'component',
            html: '<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off"/>',
            cls: 'input-comp',
            // Setting isFormField true will make this component be included in the list of fields
            // when the parent form is validating its children .
            isFormField: true,
            width: 30,
            listeners: {
                initialize: function () {
                    this.validate = function () {
                        var result = this.isValid();
                        return result;
                    };

                    this.isValid = function () {
                        var  bubbles = me.getBubbles();
                        if (!me.allowBlank && bubbles.length === 0) {
                            return false;
                        }
                        return true;
                    };

                    this.isDirty = function () {
                        // This function is required because of the setting isFormField: true
                        // We are not using the dirty feature yet, so for now the function is just a placeholder
                        return false;
                    };

                    var inputEl = this.element.down('input');

                    if (!me.getReadOnly()) {
                        inputEl.on('keyup', function (e, el) {
                            var parentBox = me.down('#mainContents').element.getBox(false, false),
                                parentDimensions = {
                                    width: parentBox.width,
                                    left: parentBox.left
                                },
                                inputValue = this.dom.value,
                                isSpace = e.browserEvent.keyCode === 32,
                                isSemiColon = e.browserEvent.keyCode === 186,
                                isDelete = e.browserEvent.keyCode === 8,
                                isEnter = e.browserEvent.keyCode === 13,
                                isTab = e.browserEvent.keyCode === 9,
                                isHide = e.browserEvent.keyCode === 10;

                            if (isEnter || isHide || isSpace || isSemiColon) {
                                if (me.shouldAutoBubble()) {
                                    if (this.dom.value) {
                                        if (isSemiColon) {
                                            inputValue = inputValue.substring(0, inputValue.length - 1);
                                        }
                                        me.considerBubblingInput(inputValue);
                                    }
                                }
                            } else {
                                me.resizeInput(this, isDelete, parentDimensions);

                                if (isDelete && this.getValue() === '' && !this.lastLength) {
                                    me.removeLastBubble();
                                }
                                me.fireEvent('inputKeyup', e, el);
                            }

                            //Set this, since we're in keyup, the next keyup needs to know if the input
                            //was empty before it happened or if the keyup caused it to happen.
                            this.lastLength = this.getValue().length;
                        });

                        inputEl.on('blur', function (e, el) {
                            if (this.dom.value) {
                                if (me.shouldAutoBubble()) {
                                    me.considerBubblingInput(this.dom.value);
                                }
                            }
                            this.setWidth(me.getDefaultInputWidth() + this.getValue().length * me.getInputCharacterWidthIncrement());
                            me.fireEvent('inputBlur', e, el);
                        });
                    }
                }
            }
        };
    },

    /**
     * @private
     * Resizes the input
     */
    resizeInput: function (input, isDelete, parentDimensions) {
        var inputDimensions,
            rightSideWidthBuffer = 10,
            minimumWidth = this.getDefaultInputWidth(),
            sizeIncrement = this.getInputCharacterWidthIncrement(),
            maxSpace = parentDimensions.width - rightSideWidthBuffer,
            consumedSpace,
            newWidth,
            inputDimensions = input.getBox(false, false),
            leftPosition = inputDimensions.left - parentDimensions.left;

        //Shrink the input if the user clicked delete.
        if (isDelete) {
            if (inputDimensions.width > minimumWidth + sizeIncrement) {
                input.setWidth(inputDimensions.width - sizeIncrement);
            }
        } else {
            //Make sure we don't expand passed the right side of the form.
            consumedSpace = Math.min(maxSpace, leftPosition + inputDimensions.width + sizeIncrement);
            newWidth =  consumedSpace - leftPosition;
            input.setWidth(newWidth);
        }
    },

    /**
     * @private
     * Will turn the contents of the input into a bubble if it passes the configured criteria.
     */
    considerBubblingInput: function (input) {
        if (this.getGetBubbleModelFromInput()) {
            var model = this.getGetBubbleModelFromInput()(input);
            if (model) {
                this.addBubble(model);
                this.clearInput();
            }
            this.focusInput();
        }
    }
});
