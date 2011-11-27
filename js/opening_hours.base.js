/**
 * @file
 * Contains the base Drupal.OpeningHours object with utility functions.
 */

(function ($) {
"use strict";

Drupal.OpeningHours = {};

// Sunday is either the zeroeth or seventh day of the week, depending
// oun the current locale.
var weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

Drupal.OpeningHours.Week = function (date, firstDayOfWeek) {
  var self = this;

  self.constructor = function () {
    self.date = date;
    self.firstDayOfWeek = firstDayOfWeek;
    self.weekDays = self.orderedWeekDays(self.firstDayOfWeek);
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

}(jQuery));

