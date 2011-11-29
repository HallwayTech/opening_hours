/**
 * @file
 * JavaScript code for the opening hours admin interface.
 */

// We create the routers after document.ready to ensure their templates
// are available.
jQuery(function($) {
"use strict";

Drupal.OpeningHours.AdminRouter = Backbone.Router.extend({
  routes: {
    '': 'today'
  },

  initialize: function (options) {
    this.container = options.container;
    this.firstDayOfWeek = options.firstDayOfWeek;
    this.weekDayNames = options.weekDayNames;

    // Instantiate our main admin view.
    this.adminMainView = new Drupal.OpeningHours.AdminMainView({
      firstDayOfWeek: this.firstDayOfWeek
    });
  },

  today: function () {
    this.container.html(this.adminMainView.render({
      week: new Drupal.OpeningHours.Week(null, this.firstDayOfWeek)
    }).el);
  }
});

});
