/**
 * @file
 * Extensions for JavaScript core prototypes.
 *
 * Polyfills missing functionality.
 */

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
        // setMonth is zero-based (January is month zero), so we subtract
        // one before setting it.
        this.setMonth(parseInt(parts[1], 10) - 1);
        // setDate is a bit of a misnomer. It actually sets the day number
        // (1-31), not the full date.
        this.setDate(parts[2]);
        // set the hour to noon to avoid timezone issues.
        this.setHours(12);
      } else {
        throw 'Input to Date.setISODate was not well-formed. It should be in ISO format, eg. 2011-11-28';
      }

      return this;
    };
  }

}());

