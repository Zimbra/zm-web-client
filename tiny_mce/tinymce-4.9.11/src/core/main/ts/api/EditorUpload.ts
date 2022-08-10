/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Uploader from '../file/Uploader';
import ImageScanner from '../file/ImageScanner';
import BlobCache from './file/BlobCache';
import UploadStatus from '../file/UploadStatus';
import ErrorReporter from '../ErrorReporter';
import { Arr } from '@ephox/katamari';
import { HTMLImageElement, Blob } from '@ephox/dom-globals';
import { Editor } from 'tinymce/core/api/Editor';
import Settings from 'tinymce/core/api/Settings';

/**
 * Handles image uploads, updates undo stack and patches over various internal functions.
 *
 * @private
 * @class tinymce.EditorUpload
 */

export default function (editor: Editor) {
  const blobCache = BlobCache();
  let uploader, imageScanner;
  const uploadStatus = UploadStatus();
  const urlFilters: Array<(img: HTMLImageElement) => boolean> = [];

  const aliveGuard = function (callback) {
    return function (result) {
      if (editor.selection) {
        return callback(result);
      }

      return [];
    };
  };

  const cacheInvalidator = function (): string {
    return '?' + (new Date()).getTime();
  };

  // Replaces strings without regexps to avoid FF regexp to big issue
  const replaceString = function (content: string, search: string, replace: string): string {
    let index = 0;

    do {
      index = content.indexOf(search, index);

      if (index !== -1) {
        content = content.substring(0, index) + replace + content.substr(index + search.length);
        index += replace.length - search.length + 1;
      }
    } while (index !== -1);

    return content;
  };

  const replaceImageUrl = function (content: string, targetUrl: string, replacementUrl: string): string {
    content = replaceString(content, 'src="' + targetUrl + '"', 'src="' + replacementUrl + '"');
    content = replaceString(content, 'data-mce-src="' + targetUrl + '"', 'data-mce-src="' + replacementUrl + '"');

    return content;
  };

  const replaceUrlInUndoStack = function (targetUrl: string, replacementUrl: string) {
    Arr.each(editor.undoManager.data, function (level) {
      if (level.type === 'fragmented') {
        level.fragments = Arr.map(level.fragments, function (fragment) {
          return replaceImageUrl(fragment, targetUrl, replacementUrl);
        });
      } else {
        level.content = replaceImageUrl(level.content, targetUrl, replacementUrl);
      }
    });
  };

  const openNotification = function () {
    return editor.notificationManager.open({
      text: editor.translate('Image uploading...'),
      type: 'info',
      timeout: -1,
      progressBar: true
    });
  };

  const replaceImageUri = function (image: HTMLImageElement, resultUri: string) {
    blobCache.removeByUri(image.src);
    replaceUrlInUndoStack(image.src, resultUri);

    editor.$(image).attr({
      'src': Settings.shouldReuseFileName(editor) ? resultUri + cacheInvalidator() : resultUri,
      'data-mce-src': editor.convertURL(resultUri, 'src')
    });
  };

  const uploadImages = function (callback) {
    if (!uploader) {
      uploader = Uploader(uploadStatus, {
        url: Settings.getImageUploadUrl(editor),
        basePath: Settings.getImageUploadBasePath(editor),
        credentials: Settings.getImagesUploadCredentials(editor),
        handler: Settings.getImagesUploadHandler(editor)
      });
    }

    return scanForImages().then(aliveGuard(function (imageInfos) {
      let blobInfos;

      blobInfos = Arr.map(imageInfos, function (imageInfo) {
        return imageInfo.blobInfo;
      });

      return uploader.upload(blobInfos, openNotification).then(aliveGuard(function (result) {
        const filteredResult = Arr.map(result, function (uploadInfo, index) {
          const image = imageInfos[index].image;

          if (uploadInfo.status && Settings.shouldReplaceBlobUris(editor)) {
            replaceImageUri(image, uploadInfo.url);
          } else if (uploadInfo.error) {
            ErrorReporter.uploadError(editor, uploadInfo.error);
          }

          return {
            element: image,
            status: uploadInfo.status
          };
        });

        if (callback) {
          callback(filteredResult);
        }

        return filteredResult;
      }));
    }));
  };

  const uploadImagesAuto = function (callback?) {
    if (Settings.isAutomaticUploadsEnabled(editor)) {
      return uploadImages(callback);
    }
  };

  const isValidDataUriImage = function (imgElm: HTMLImageElement) {
    if (Arr.forall(urlFilters, (filter) => filter(imgElm)) === false) {
      return false;
    }

    if (imgElm.getAttribute('src').indexOf('data:') === 0) {
      const dataImgFilter = Settings.getImagesDataImgFilter(editor);
      return dataImgFilter(imgElm);
    }

    return true;
  };

  const addFilter = (filter: (img: HTMLImageElement) => boolean) => {
    urlFilters.push(filter);
  };

  const scanForImages = function () {
    if (!imageScanner) {
      imageScanner = ImageScanner(uploadStatus, blobCache);
    }

    return imageScanner.findAll(editor.getBody(), isValidDataUriImage).then(aliveGuard(function (result) {
      result = Arr.filter(result, function (resultItem) {
        // ImageScanner internally converts images that it finds, but it may fail to do so if image source is inaccessible.
        // In such case resultItem will contain appropriate text error message, instead of image data.
        if (typeof resultItem === 'string') {
          ErrorReporter.displayError(editor, resultItem);
          return false;
        }
        return true;
      });

      Arr.each(result, function (resultItem) {
        replaceUrlInUndoStack(resultItem.image.src, resultItem.blobInfo.blobUri());
        resultItem.image.src = resultItem.blobInfo.blobUri();
        resultItem.image.removeAttribute('data-mce-src');
      });

      return result;
    }));
  };

  const destroy = function () {
    blobCache.destroy();
    uploadStatus.destroy();
    imageScanner = uploader = null;
  };

  const replaceBlobUris = function (content: string) {
    return content.replace(/src="(blob:[^"]+)"/g, function (match, blobUri) {
      const resultUri = uploadStatus.getResultUri(blobUri);

      if (resultUri) {
        return 'src="' + resultUri + '"';
      }

      let blobInfo = blobCache.getByUri(blobUri);

      if (!blobInfo) {
        blobInfo = Arr.foldl(editor.editorManager.get(), function (result, editor) {
          return result || editor.editorUpload && editor.editorUpload.blobCache.getByUri(blobUri);
        }, null);
      }

      if (blobInfo) {
        const blob: Blob = blobInfo.blob();
        return 'src="data:' + blob.type + ';base64,' + blobInfo.base64() + '"';
      }

      return match;
    });
  };

  editor.on('setContent', function () {
    if (Settings.isAutomaticUploadsEnabled(editor)) {
      uploadImagesAuto();
    } else {
      scanForImages();
    }
  });

  editor.on('RawSaveContent', function (e) {
    e.content = replaceBlobUris(e.content);
  });

  editor.on('getContent', function (e) {
    if (e.source_view || e.format === 'raw') {
      return;
    }

    e.content = replaceBlobUris(e.content);
  });

  editor.on('PostRender', function () {
    editor.parser.addNodeFilter('img', function (images) {
      Arr.each(images, function (img) {
        const src = img.attr('src');

        if (blobCache.getByUri(src)) {
          return;
        }

        const resultUri = uploadStatus.getResultUri(src);
        if (resultUri) {
          img.attr('src', resultUri);
        }
      });
    });
  });

  return {
    blobCache,
    addFilter,
    uploadImages,
    uploadImagesAuto,
    scanForImages,
    destroy
  };
}