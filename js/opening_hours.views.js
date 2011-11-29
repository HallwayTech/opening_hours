/**
 * @file
 * Backbone views for rendering the admin interface for opening hours.
 */

// We create the views after document.ready to ensure their templates
// are available.
jQuery(function($) {
"use strict";

/**
 * This view is the primary view that controls the other admin views.
 */
Drupal.OpeningHours.AdminMainView = Backbone.View.extend({
  className: 'admin-main-view',
  template: _.template($("#oho-admin-main-template").html()),

  render: function (options) {
    console.log('Week passed to redner', options.week);
    var dateRange = Drupal.OpeningHours.formatDateRange(options.week.dates[0], options.week.dates[6]);

    $(this.el).html(this.template({
      'header': 'Testing 1-2-3',
      'fromDate': dateRange[0],
      'toDate': dateRange[1]
    }));

    return this;
  }
});

});

