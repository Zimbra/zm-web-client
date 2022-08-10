/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Promise from 'tinymce/core/api/util/Promise';
import Errors from './Errors';
import Utils from './Utils';
import { Blob } from '@ephox/dom-globals';

/**
 * Handles loading images though a proxy for working around cors.
 */

const appendApiKey = function (url: string, apiKey: string) {
  const separator = url.indexOf('?') === -1 ? '?' : '&';
  if (/[?&]apiKey=/.test(url) || !apiKey) {
    return url;
  } else {
    return url + separator + 'apiKey=' + encodeURIComponent(apiKey);
  }
};

const requestServiceBlob = function (url: string, apiKey: string) {
  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    'tiny-api-key': apiKey
  };

  return Utils.requestUrlAsBlob(appendApiKey(url, apiKey), headers, false).then(function (result) {
    return result.status < 200 || result.status >= 300 ? Errors.handleServiceErrorResponse(result.status, result.blob) : Promise.resolve(result.blob);
  });
};

function requestBlob(url: string, withCredentials: boolean) {
  return Utils.requestUrlAsBlob(url, {}, withCredentials)
    .then(function (result) {
      return result.status < 200 || result.status >= 300 ? Errors.handleHttpError(result.status) : Promise.resolve(result.blob);
    });
}

const getUrl = function (url: string, apiKey: string, withCredentials: boolean): Promise<Blob> {
  return apiKey ? requestServiceBlob(url, apiKey) : requestBlob(url, withCredentials);
};

export default {
  getUrl
};