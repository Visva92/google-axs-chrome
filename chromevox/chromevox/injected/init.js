// Copyright 2010 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Initializes the injected content script.
 *
 * @author clchen@google.com (Charles Chen)
 */

goog.provide('cvox.ChromeVoxInit');

goog.require('cvox.ApiImplementation');
goog.require('cvox.ChromeVox');
goog.require('cvox.ChromeVoxEventWatcher');
goog.require('cvox.ChromeVoxJSON');
goog.require('cvox.ChromeVoxKbHandler');
goog.require('cvox.ChromeVoxNavigationManager');
goog.require('cvox.ChromeVoxSearch');
goog.require('cvox.Earcons');
goog.require('cvox.Host');
goog.require('cvox.LiveRegions');
goog.require('cvox.Msgs');
goog.require('cvox.TraverseContent');
goog.require('cvox.Tts');

/**
 * Initializes cvox.ChromeVox.
 */
cvox.ChromeVox.init = function() {
  cvox.ChromeVox.host = new cvox.Host();
  cvox.ChromeVox.host.init();

  // Setup globals
  cvox.ChromeVox.isActive = true;
  cvox.ChromeVox.traverseContent = new cvox.TraverseContent();
  cvox.ChromeVox.navigationManager =
      new cvox.ChromeVoxNavigationManager();
  cvox.ChromeVox.markInUserCommand =
      cvox.ChromeVoxUserCommands.markInUserCommand;

  cvox.ChromeVox.tts = new cvox.Tts();
  cvox.ChromeVox.earcons = new cvox.Earcons();
  cvox.ChromeVox.msgs = new cvox.Msgs();

  var queueMode = cvox.AbstractTts.QUEUE_MODE_FLUSH;

  // Initialize common components
  cvox.ChromeVoxSearch.init();

  // Start the event watchers
  cvox.ChromeVoxEventWatcher.init(document);

  // Provide a way for modules that can't depend on cvox.ChromeVoxUserCommands
  // to execute commands.
  cvox.ChromeVox.executeUserCommand = function(commandName) {
    cvox.ChromeVoxUserCommands.commands[commandName]();
  };

  // If we're the top-level frame, speak the title of the page +
  // the active element if it is a user control.
  if (window.top == window) {
    var message = document.title;
    if (message) {
      cvox.ChromeVox.tts.speak(message, queueMode, null);
      queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
    }
  } else {
    // If we're not the top-level frame, we should queue all initial
    // speech so it comes after the main frame's title announcement.
    queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
  }

  // Initialize live regions and speak alerts.
  if (cvox.LiveRegions.init(new Date(), queueMode)) {
    queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
  }

  // If this iframe has focus, speak the current focused element.
  if (document.hasFocus()) {
    var activeElem = document.activeElement;
    if (cvox.DomUtil.isControl(activeElem)) {
      cvox.ChromeVox.navigationManager.syncToNode(activeElem);
      cvox.ChromeVox.navigationManager.setFocus();
      var description = cvox.DomUtil.getControlDescription(activeElem);
      description.speak(queueMode);
      queueMode = cvox.AbstractTts.QUEUE_MODE_QUEUE;
    }
  }

  cvox.ChromeVox.host.onPageLoad();
  cvox.ApiImplementation.init();
};

/**
 * Reinitialize ChromeVox, if the extension is disabled and then enabled
 * again, but our injected page script has remained.
 */
cvox.ChromeVox.reinit = function() {
  cvox.ChromeVox.host.reinit();
  cvox.ChromeVox.init();
};

/**
 * Process PDFs created with Chrome's built-in PDF plug-in, which has an
 * accessibility hook.
 */
cvox.ChromeVox.processEmbeddedPdfs = function() {
  var es = document.querySelectorAll('embed[type="application/pdf"]');
  if ((es.length == 1) &&
      (document.head.getAttribute('addedByChromeVox') == 'true')) {
    window.location.href = 'chrome-extension://' + 'bdcfgfeioooifpgmbfjpopbcbgdmehnb' +
        'chromevox/background/pdf_viewer.html#' + es[0].src;
  }
  for (var i = 0; i < es.length; i++) {
    var e = es[i];
    if (typeof e.accessibility === 'function') {
      var infoJSON = e.accessibility();
      var info = cvox.ChromeVoxJSON.parse(infoJSON);

      if (!info.copyable)
        continue;
      if (!info.loaded) {
        setTimeout(cvox.ChromeVox.processEmbeddedPdfs, 100);
        continue;
      }

      var div = document.createElement('DIV');

      // Document Styles
      div.style.position = 'relative';
      div.style.background = '#CCC';
      div.style.paddingTop = '1pt';
      div.style.paddingBottom = '1pt';
      div.style.width = '100%';
      div.style.minHeight = '100%';

      var displayPage = function(i) {
        var json = e.accessibility(i);
        var page = cvox.ChromeVoxJSON.parse(json);
        var pageDiv = document.createElement('DIV');
        var pageAnchor = document.createElement('A');

        // Page Achor Setup
        pageAnchor.name = 'page' + i;

        // Page Styles
        pageDiv.style.position = 'relative';
        pageDiv.style.background = 'white';
        pageDiv.style.margin = 'auto';
        pageDiv.style.marginTop = '20pt';
        pageDiv.style.marginBottom = '20pt';
        pageDiv.style.height = page.height + 'pt';
        pageDiv.style.width = page.width + 'pt';
        pageDiv.style.boxShadow = '0pt 0pt 10pt #333';

        // Text Nodes
        var texts = page.textBox;
        for (var j = 0; j < texts.length; j++) {
          var text = texts[j];
          var textSpan = document.createElement('Span');

          // Text Styles
          textSpan.style.position = 'absolute';
          textSpan.style.left = text.left + 'pt';
          textSpan.style.top = text.top + 'pt';
          textSpan.style.fontSize = text.fontSize + 'pt';

          // Text Content
          for (var k = 0; k < text.textNodes.length; k++) {
            var node = text.textNodes[k];
            if (node.type == 'text') {
              textSpan.appendChild(document.createTextNode(node.text));
            } else if (node.type == 'url') {
              var a = document.createElement('A');
              a.href = node.url;
              a.appendChild(document.createTextNode(node.text));
              textSpan.appendChild(a);
            }
          }

          pageDiv.appendChild(textSpan);
        }
        div.appendChild(pageAnchor);
        div.appendChild(pageDiv);

        if (i < info.numberOfPages - 1) {
          setTimeout(function() { displayPage(i + 1); }, 0);
        } else {
          e.parentNode.replaceChild(div, e);
        }
      };

      setTimeout(function() { displayPage(0); }, 0);
    }
  }
};

window.setTimeout(cvox.ChromeVox.init, 0);