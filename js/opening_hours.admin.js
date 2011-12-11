/**
 * @file
 * JavaScript code for the opening hours admin interface.
 */

(function ($) {
"use strict";

  // When the document is ready, set up our app.
  $(function () {
    $.datepicker.setDefaults({
      changeMonth: true,
      changeYear: true,
      dayNames: Drupal.settings.OpeningHours.formatDate.dayNames,
      dateFormat: 'yy-mm-dd',
      firstDay: Drupal.settings.OpeningHours.firstDayOfWeek,
      monthNames: Drupal.settings.OpeningHours.formatDate.monthNames
    });

    Drupal.OpeningHours.adminApp = new Drupal.OpeningHours.AdminRouter({
      container: $('#opening-hours-admin'),
      firstDayOfWeek: Drupal.settings.OpeningHours.firstDayOfWeek,
      nid: Drupal.settings.OpeningHours.nid
    });

    // Start the router history tracking.
    Backbone.history.start();
  });

}(jQuery));

