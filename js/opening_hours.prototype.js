/**
 * @file
 * Extensions for JavaScript core prototypes.
 *
 * Polyfills missing functionality.
 */

// Array.indexOf was only introduced to Internet Explorer in version 9,
// so we'll probably have this workaround for some time.
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    "use strict";
    if (this === void 0 || this === null) {
      throw new TypeError();
    }
    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0) {
      return -1;
    }
    var n = 0;
    if (arguments.length > 0) {
      n = Number(arguments[1]);
      if (n !== n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }
    if (n >= len) {
      return -1;
    }
    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  };
}

(function(){
"use strict";

  /**
  * Pad a number with a zero if less than 10.
  */
  function pad(n) {
    if (n < 1) {
      return n;
    }

    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.getISODate !== 'function') {
    /**
    * Format date in ISO 8601-format.
    */
    Date.prototype.getISODate = function (type) {
      return this.getFullYear()+ '-' + pad(this.getMonth() + 1) + '-' + pad(this.getDate());
    };
  }

  if (typeof Date.prototype.setISODate !== 'function') {
    // Crude validation for the date input.
    var dateValidator = /^\d\d\d\d-[01]\d-[0-3]\d$/;

    /**
    * Set date from a ISO-formatted string, ie. 2011-11-28.
    */
    Date.prototype.setISODate = function (input) {
      if (dateValidator.test(input)) {
        var parts = input.split('-');
        // setYear uses two-digit years, setFullYear is what we want.
        this.setFullYear(parts[0]);

        // set the hour to noon to avoid timezone issues.
        this.setHours(12);

        // setDate is a bit of a misnomer. It actually sets the day number
        // (1-31), not the full date.
        this.setDate(parts[2]);

        // It's important to set the date before the month, since it
        // might in some cases cause wraparound if current date is 31st,
        // and the month we're changing to doesn't have a 31st.

        // setMonth is zero-based (January is month zero), so we subtract
        // one before setting it.
        this.setMonth(parseInt(parts[1], 10) - 1);
      } else {
        throw 'Input to Date.setISODate was not well-formed. It should be in ISO format, eg. 2011-11-28';
      }

      return this;
    };
  }

}());

