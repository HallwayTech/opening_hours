/**
 * @file
 * Contains the base Drupal.OpeningHours object with utility functions.
 */

(function ($) {
"use strict";

Drupal.OpeningHours = {};

/**
 * Pad a number with a zero if less than 10.
 */
function pad(n) {
  if (n < 1) {
    return n;
  }

  return n < 10 ? '0' + n : n;
}

if (typeof Date.prototype.getWeek !== 'function') {
  /**
   * Get the ISO week number for a date.
   */
  Date.prototype.getWeek = function(firstDayOfWeek) {
    // Default first day of week is monday. Sunday is zero.
    if (!firstDayOfWeek && firstDayOfWeek !== 0) {
      firstDayOfWeek = 1;
    }

    var januaryFirst = new Date(this.getFullYear(), 0, 1),
        januaryFirstWeekDay = januaryFirst.getDay() - firstDayOfWeek,
        // Date difference in seconds.
        delta = (this.getTime() - januaryFirst.getTime()) / 1000,
        // Date difference in days.
        dayCount = delta / 86400,
        // These will be used below.
        nextYear, nextYearWeekDay, weekNumber;

    // This to compensate for the fact that the first day of week might
    // have a numerical value larger than the current - since Sunday is
    // zero. Additionally, weird locales might start the week at another day.
    if (januaryFirstWeekDay < 0) {
      januaryFirstWeekDay = januaryFirstWeekDay + 7;
    }

    // If the year starts before middle of the week, ie. the fourth day,
    // it might be week 52, 53 or 1.
    if (januaryFirstWeekDay < 4) {
      weekNumber = Math.floor((dayCount + januaryFirstWeekDay - 1) / 7) + 1;

      // Week 53 does not occur every year, so figure out if this is
      // applicable in this instance.
      if (weekNumber > 52) {
        nextYear = new Date(this.getFullYear() + 1, 0, 1);
        nextYearWeekDay = nextYear.getDay() - firstDayOfWeek;

        // Same treatment as januaryFirstWeekDay.
        if (nextYearWeekDay < 0) {
          nextYearWeekDay = nextYearWeekDay + 7;
        }

        weekNumber = (nextYearWeekDay < 4) ? 1 : 53;
      }
    }
    else {
      weekNumber = Math.ceil((dayCount + januaryFirstWeekDay - 1) / 7);
    }

    return weekNumber;
  };
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

// Sunday is either the zeroeth or seventh day of the week, depending
// oun the current locale.
var weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

Drupal.OpeningHours.Week = function (dateStr, firstDayOfWeek) {
  var self = this;

  self.constructor = function () {
    self.dateStr = dateStr || new Date().getISODate();
    self.firstDayOfWeek = firstDayOfWeek;
    self.weekDays = self.orderedWeekDays(self.firstDayOfWeek);
    self.dates = self.getDates();
  };

  // Find all the dates our week spans over.
  self.getDates = function () {
    var date = new Date().setISODate(self.dateStr),
        dates = [],
        dayOffset = 0,
        tempDate,
        todaysDayNumber = date.getDay();

    // Determine how far back in time the first day of the week was.
    // This is a bit weird, since the current day number might be larger
    // than the first day number.
    // If today's number is larger, this is fairly easy.
    if (todaysDayNumber < self.firstDayOfWeek) {
      dayOffset = todaysDayNumber - self.firstDayOfWeek;
    }
    // In the other case, we reverse the order of the subtraction.
    else if (todaysDayNumber > self.firstDayOfWeek) {
      dayOffset = self.firstDayOfWeek - todaysDayNumber;
    }

    while (dates.length < 7) {
      tempDate = new Date().setISODate(self.dateStr);

      tempDate.setDate(tempDate.getDate() + dayOffset);

      dates.push(tempDate);
      dayOffset += 1;
    }

    return dates;
  };


  /**
   * Get the weekdays in the order.
   *
   * The day number (0-6) given will be the first. Zero is sunday.
   */
  self.orderedWeekDays = function () {
    var counter = self.firstDayOfWeek,
        order = [];

    while (order.length < 7) {
      order.push(weekdays[counter % 7]);
      counter = counter + 1;
    }

    return order;
  };

  self.constructor();
};

/**
 * Format a date.
 */
Drupal.OpeningHours.formatDate = function (date, format) {
  // Default format.
  if (!format) {
    format = 'd. MM yy';
  }

  return $.datepicker.formatDate(format, date, Drupal.settings.OpeningHours.formatDate);
};

/**
 * Format a date range.
 *
 * Filters the range down to the significant parts, so only the things
 * that are different are shown in the first part of the range.
 */
Drupal.OpeningHours.formatDateRange = function (date1, date2) {
  var d1 = {
        year: date1.getFullYear(),
        month: date1.getMonth(),
        day: date1.getDate(),
      },
      d2 = {
        year: date2.getFullYear(),
        month: date2.getMonth(),
        day: date2.getDate(),
      };

  // If it's the same date, just return that.
  if (d1.year === d2.year && d1.month === d2.month && d1.day === d2.day) {
    return [Drupal.OpeningHours.formatDate(date1)];
  }
  // If it's the same month, return a simple day-range.
  else if (d1.year === d2.year && d1.month === d2.month) {
    return [
      $.datepicker.formatDate('d.', date1, Drupal.settings.OpeningHours.formatDate),
      Drupal.OpeningHours.formatDate(date2)
    ];
  }
  // If it's the same year, return a day-month range.
  else if (d1.year === d2.year) {
    return [
      $.datepicker.formatDate('d. MM', date1, Drupal.settings.OpeningHours.formatDate),
      Drupal.OpeningHours.formatDate(date2)
    ];
  }
  // Otherwise, return the full date range.
  else {
    return [
      Drupal.OpeningHours.formatDate(date1),
      Drupal.OpeningHours.formatDate(date2)
    ];
  }
};

}(jQuery));


