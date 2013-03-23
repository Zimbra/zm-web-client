/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
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
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * @author Ed Spencer
 * @class Ext.data.reader.Array
 *
 * Data reader class to create an Array of {@link Ext.data.Model} objects from an Array.
 * Each element of that Array represents a row of data fields. The
 * fields are pulled into a Record object using as a subscript, the `mapping` property
 * of the field definition if it exists, or the field's ordinal position in the definition.
 *
 * Example code:
 *
 *     Employee = Ext.define('Employee', {
 *         extend: 'Ext.data.Model',
 *         config: {
 *             fields: [
 *                 'id',
 *                 {name: 'name', mapping: 1}, // "mapping" only needed if an "id" field is present which
 *                 {name: 'occupation', mapping: 2} // precludes using the ordinal position as the index.
 *             ]
 *         }
 *     });
 *
 *     var myReader = new Ext.data.reader.Array({
 *         model: 'Employee'
 *     }, Employee);
 *
 * This would consume an Array like this:
 *
 *     [ [1, 'Bill', 'Gardener'], [2, 'Ben', 'Horticulturalist'] ]
 *
 * @constructor
 * Create a new ArrayReader
 * @param {Object} meta Metadata configuration options.
 */
Ext.define('Ext.data.reader.Array', {
    extend: 'Ext.data.reader.Json',
    alternateClassName: 'Ext.data.ArrayReader',
    alias : 'reader.array',

    // For Array Reader, methods in the base which use these properties must not see the defaults
    config: {
        totalProperty: undefined,
        successProperty: undefined
    },

    /**
     * @private
     * Returns an accessor expression for the passed Field from an Array using either the Field's mapping, or
     * its ordinal position in the fields collection as the index.
     * This is used by buildExtractors to create optimized on extractor function which converts raw data into model instances.
     */
    createFieldAccessExpression: function(field, fieldVarName, dataName) {
        var me     = this,
            mapping = field.getMapping(),
            index  = (mapping == null) ? me.getModel().getFields().indexOf(field) : mapping,
            result;

        if (typeof index === 'function') {
            result = fieldVarName + '.getMapping()(' + dataName + ', this)';
        } else {
            if (isNaN(index)) {
                index = '"' + index + '"';
            }
            result = dataName + "[" + index + "]";
        }
        return result;
    }
});