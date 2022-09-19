/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { window, Storage } from '@ephox/dom-globals';
import * as FakeStorage from 'tinymce/core/api/util/FakeStorage';

/**
 * @class tinymce.util.LocalStorage
 * @static
 * @version 4.0
 * @example
 * tinymce.util.LocalStorage.setItem('key', 'value');
 * var value = tinymce.util.LocalStorage.getItem('key');
 */

let localStorage: Storage;

// IE11 with certain strict security settings will explode when trying to access localStorage
// so we need to do a try/catch and a simple stub here. #TINY-1782

try {
  localStorage = window.localStorage;
} catch (e) {
  localStorage = FakeStorage.create();
}

export default localStorage;
