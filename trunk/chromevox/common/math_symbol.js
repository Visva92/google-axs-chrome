// Copyright 2013 Google Inc.
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
 * @fileoverview Initialize Unicode character mappings.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('cvox.MathSymbol');

goog.require('cvox.MathAtom');
goog.require('cvox.MathUtil');


/**
 * Create a unicode mapping.
 * @param {Array.<Object>} atoms Array of symbol mappings.
 * @constructor
 */
cvox.MathSymbol = function(atoms) {

  this.UNICODE_MAP_ = new Array;
  this.HTML_ENTITY_MAP_ = {};

  this.domains = [];
  this.rules = [];
  this.initUnicodeMap_(atoms);

  // In the unlikely event we want to initialize with a mapping
  // different from the usual, we pass the mapping.
  this.initHtmlEntityMap_(this.UNICODE_MAP_);

};



/**
 * Ensures a uniform parsing of an HTML number string.
 * @param {string} number to be parsed.
 * @return {?number} An integer representing the parsed unicode string.
 * @private
 */
cvox.MathSymbol.parseUnicode_ = function(number) {
  if (number.match(/^0x(\d|[a-fA-F])+/)) {
    return parseInt(number.match(/^0x(\d|[a-fA-F])+/), 16);
  } else if (number.match(/^&#\d+;$/)) {   // decimal case
    return parseInt(number.match(/\d+/), 10);
  } else if (number.match(/^&#x(\d|[a-fA-F])+;$/)) {
    return parseInt(number.match(/(\d|[a-fA-F])+/), 16);
  } else if (number.match(/^(\d|[a-fA-F])+$/)) { // any other case is hex
    return parseInt(number.match(/(\d|[a-fA-F])+/), 16);
  } else {
    return null;
  }
};

/**
 * Initializes the mapping for the Unicode symbol translation.
 * @param {Array.<Object>} atoms Array of symbol mappings.
 * @private
 */
cvox.MathSymbol.prototype.initUnicodeMap_ = function(atoms) {

  var domains = [];
  var rules = [];

  for (var i = 0, uni; uni = atoms[i]; i++) {
    var uniObject = cvox.MathAtom.make(uni.key, uni.category, uni.mappings);
    var index = cvox.MathSymbol.parseUnicode_(uniObject.getKey());
    if (index) {
      domains = cvox.MathUtil.union(domains, uniObject.allDomains());
      rules = cvox.MathUtil.union(rules, uniObject.allRules());
      this.UNICODE_MAP_[index] = uniObject;
    }
  }
  this.domains = domains;
  this.rules = rules;
};


/**
 * Initializes the mapping for the HTML Entity translation.
 * @param {Object} mapping A mapping of unicode codes to atoms.
 * @private
 */
cvox.MathSymbol.prototype.initHtmlEntityMap_ = function(mapping) {

  for (var i in cvox.MathSymbol.HTML_ENTITY_TO_CODE_) {
    var index = cvox.MathSymbol.parseUnicode_(
      cvox.MathSymbol.HTML_ENTITY_TO_CODE_[i]);

    if (index) {
      var atom = this.UNICODE_MAP_[index];

      if (atom) {
        this.HTML_ENTITY_MAP_[i] = atom;
      } else {
        // No unicode mapping for HTML entity.
      }
    }
  }
};


/**
 *  Retrieves the Atom object for a given symbol.
 * @param {string} name Key for a symbol.
 * @return {?cvox.MathAtom} The Atom if it exists.
 */
cvox.MathSymbol.prototype.getSymbolByName = function(name) {
  // HTML entity case
  if (name.match(/^&[a-zA-Z]+;$/)) {
    return this.HTML_ENTITY_MAP_[name];
  } else {
    var index = cvox.MathSymbol.parseUnicode_(name);
    if (index) {
      return this.UNICODE_MAP_[index];
    }
  }
  return null;
};


/**
 *  Retrieves the Atom object for a given code.
 *  @param {number} code Integer code for a symbol in decimal.
 * @return {?cvox.MathAtom} The Atom if it exists.
 */
cvox.MathSymbol.prototype.getSymbolByCode = function(code) {
  return this.UNICODE_MAP_[code];
};



// TODO (sorge) move to data file.
/**
 * Mapping of HTML entities to unicode values. See URL
 * en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references
 * @type {Object.<string,string>}
 * @private
 */
cvox.MathSymbol.HTML_ENTITY_TO_CODE_ = {
  '&quot;': '0x0022',
  '&amp;': '0x0026',
  '&apos;': '0x0027',
  '&lt;': '0x003C',
  '&gt;': '0x003E',
  '&nbsp;': '0x00A0',
  '&iexcl;': '0x00A1',
  '&cent;': '0x00A2',
  '&pound;': '0x00A3',
  '&curren;': '0x00A4',
  '&yen;': '0x00A5',
  '&brvbar;': '0x00A6',
  '&sect;': '0x00A7',
  '&uml;': '0x00A8',
  '&copy;': '0x00A9',
  '&ordf;': '0x00AA',
  '&laquo;': '0x00AB',
  '&not;': '0x00AC',
  '&shy;': '0x00AD',
  '&reg;': '0x00AE',
  '&macr;': '0x00AF',
  '&deg;': '0x00B0',
  '&plusmn;': '0x00B1',
  '&PlusMinus;': '0x00B1',
  '&sup2;': '0x00B2',
  '&sup3;': '0x00B3',
  '&acute;': '0x00B4',
  '&micro;': '0x00B5',
  '&para;': '0x00B6',
  '&middot;': '0x00B7',
  '&cedil;': '0x00B8',
  '&sup1;': '0x00B9',
  '&ordm;': '0x00BA',
  '&raquo;': '0x00BB',
  '&frac14;': '0x00BC',
  '&frac12;': '0x00BD',
  '&frac34;': '0x00BE',
  '&iquest;': '0x00BF',
  '&Agrave;': '0x00C0',
  '&Aacute;': '0x00C1',
  '&Acirc;': '0x00C2',
  '&Atilde;': '0x00C3',
  '&Auml;': '0x00C4',
  '&Aring;': '0x00C5',
  '&AElig;': '0x00C6',
  '&Ccedil;': '0x00C7',
  '&Egrave;': '0x00C8',
  '&Eacute;': '0x00C9',
  '&Ecirc;': '0x00CA',
  '&Euml;': '0x00CB',
  '&Igrave;': '0x00CC',
  '&Iacute;': '0x00CD',
  '&Icirc;': '0x00CE',
  '&Iuml;': '0x00CF',
  '&ETH;': '0x00D0',
  '&Ntilde;': '0x00D1',
  '&Ograve;': '0x00D2',
  '&Oacute;': '0x00D3',
  '&Ocirc;': '0x00D4',
  '&Otilde;': '0x00D5',
  '&Ouml;': '0x00D6',
  '&times;': '0x00D7',
  '&Oslash;': '0x00D8',
  '&Ugrave;': '0x00D9',
  '&Uacute;': '0x00DA',
  '&Ucirc;': '0x00DB',
  '&Uuml;': '0x00DC',
  '&Yacute;': '0x00DD',
  '&THORN;': '0x00DE',
  '&szlig;': '0x00DF',
  '&agrave;': '0x00E0',
  '&aacute;': '0x00E1',
  '&acirc;': '0x00E2',
  '&atilde;': '0x00E3',
  '&auml;': '0x00E4',
  '&aring;': '0x00E5',
  '&aelig;': '0x00E6',
  '&ccedil;': '0x00E7',
  '&egrave;': '0x00E8',
  '&eacute;': '0x00E9',
  '&ecirc;': '0x00EA',
  '&euml;': '0x00EB',
  '&igrave;': '0x00EC',
  '&iacute;': '0x00ED',
  '&icirc;': '0x00EE',
  '&iuml;': '0x00EF',
  '&eth;': '0x00F0',
  '&ntilde;': '0x00F1',
  '&ograve;': '0x00F2',
  '&oacute;': '0x00F3',
  '&ocirc;': '0x00F4',
  '&otilde;': '0x00F5',
  '&ouml;': '0x00F6',
  '&divide;': '0x00F7',
  '&oslash;': '0x00F8',
  '&ugrave;': '0x00F9',
  '&uacute;': '0x00FA',
  '&ucirc;': '0x00FB',
  '&uuml;': '0x00FC',
  '&yacute;': '0x00FD',
  '&thorn;': '0x00FE',
  '&yuml;': '0x00FF',
  '&OElig;': '0x0152',
  '&oelig;': '0x0153',
  '&Scaron;': '0x0160',
  '&scaron;': '0x0161',
  '&Yuml;': '0x0178',
  '&fnof;': '0x0192',
  '&circ;': '0x02C6',
  '&tilde;': '0x02DC',
  '&Alpha;': '0x0391',
  '&Beta;': '0x0392',
  '&Gamma;': '0x0393',
  '&Delta;': '0x0394',
  '&Epsilon;': '0x0395',
  '&Zeta;': '0x0396',
  '&Eta;': '0x0397',
  '&Theta;': '0x0398',
  '&Iota;': '0x0399',
  '&Kappa;': '0x039A',
  '&Lambda;': '0x039B',
  '&Mu;': '0x039C',
  '&Nu;': '0x039D',
  '&Xi;': '0x039E',
  '&Omicron;': '0x039F',
  '&Pi;': '0x03A0',
  '&Rho;': '0x03A1',
  '&Sigma;': '0x03A3',
  '&Tau;': '0x03A4',
  '&Upsilon;': '0x03A5',
  '&Phi;': '0x03A6',
  '&Chi;': '0x03A7',
  '&Psi;': '0x03A8',
  '&Omega;': '0x03A9',
  '&alpha;': '0x03B1',
  '&beta;': '0x03B2',
  '&gamma;': '0x03B3',
  '&delta;': '0x03B4',
  '&epsilon;': '0x03B5',
  '&zeta;': '0x03B6',
  '&eta;': '0x03B7',
  '&theta;': '0x03B8',
  '&iota;': '0x03B9',
  '&kappa;': '0x03BA',
  '&lambda;': '0x03BB',
  '&mu;': '0x03BC',
  '&nu;': '0x03BD',
  '&xi;': '0x03BE',
  '&omicron;': '0x03BF',
  '&pi;': '0x03C0',
  '&rho;': '0x03C1',
  '&sigmaf;': '0x03C2',
  '&sigma;': '0x03C3',
  '&tau;': '0x03C4',
  '&upsilon;': '0x03C5',
  '&phi;': '0x03C6',
  '&chi;': '0x03C7',
  '&psi;': '0x03C8',
  '&omega;': '0x03C9',
  '&thetasym;': '0x03D1',
  '&upsih;': '0x03D2',
  '&piv;': '0x03D6',
  '&ensp;': '0x2002',
  '&emsp;': '0x2003',
  '&thinsp;': '0x2009',
  '&zwnj;': '0x200C',
  '&zwj;': '0x200D',
  '&lrm;': '0x200E',
  '&rlm;': '0x200F',
  '&ndash;': '0x2013',
  '&mdash;': '0x2014',
  '&lsquo;': '0x2018',
  '&rsquo;': '0x2019',
  '&sbquo;': '0x201A',
  '&ldquo;': '0x201C',
  '&rdquo;': '0x201D',
  '&bdquo;': '0x201E',
  '&dagger;': '0x2020',
  '&Dagger;': '0x2021',
  '&bull;': '0x2022',
  '&hellip;': '0x2026',
  '&permil;': '0x2030',
  '&prime;': '0x2032',
  '&Prime;': '0x2033',
  '&lsaquo;': '0x2039',
  '&rsaquo;': '0x203A',
  '&oline;': '0x203E',
  '&frasl;': '0x2044',
  '&euro;': '0x20AC',
  '&image;': '0x2111',
  '&weierp;': '0x2118',
  '&real;': '0x211C',
  '&trade;': '0x2122',
  '&alefsym;': '0x2135',
  '&larr;': '0x2190',
  '&uarr;': '0x2191',
  '&rarr;': '0x2192',
  '&darr;': '0x2193',
  '&harr;': '0x2194',
  '&crarr;': '0x21B5',
  '&lArr;': '0x21D0',
  '&uArr;': '0x21D1',
  '&rArr;': '0x21D2',
  '&dArr;': '0x21D3',
  '&hArr;': '0x21D4',
  '&forall;': '0x2200',
  '&part;': '0x2202',
  '&exist;': '0x2203',
  '&empty;': '0x2205',
  '&nabla;': '0x2207',
  '&isin;': '0x2208',
  '&notin;': '0x2209',
  '&ni;': '0x220B',
  '&prod;': '0x220F',
  '&sum;': '0x2211',
  '&minus;': '0x2212',
  '&lowast;': '0x2217',
  '&radic;': '0x221A',
  '&prop;': '0x221D',
  '&infin;': '0x221E',
  '&ang;': '0x2220',
  '&and;': '0x2227',
  '&or;': '0x2228',
  '&cap;': '0x2229',
  '&cup;': '0x222A',
  '&int;': '0x222B',
  '&there4;': '0x2234',
  '&sim;': '0x223C',
  '&cong;': '0x2245',
  '&asymp;': '0x2248',
  '&ne;': '0x2260',
  '&equiv;': '0x2261',
  '&le;': '0x2264',
  '&ge;': '0x2265',
  '&sub;': '0x2282',
  '&sup;': '0x2283',
  '&nsub;': '0x2284',
  '&sube;': '0x2286',
  '&supe;': '0x2287',
  '&oplus;': '0x2295',
  '&otimes;': '0x2297',
  '&perp;': '0x22A5',
  '&sdot;': '0x22C5',
  '&lceil;': '0x2308',
  '&rceil;': '0x2309',
  '&lfloor;': '0x230A',
  '&rfloor;': '0x230B',
  '&lang;': '0x2329',
  '&rang;': '0x232A',
  '&loz;': '0x25CA',
  '&spades;': '0x2660',
  '&clubs;': '0x2663',
  '&hearts;': '0x2665',
  '&diams;': '0x2666'
};