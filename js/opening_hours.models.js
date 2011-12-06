/**
 * @file
 * Backbone models for the opening hours admin interface.
 */

(function ($) {
"use strict";

/**
 * A single opening hours instance, ie. an open period on a specific date.
 */
Drupal.OpeningHours.Instance = Backbone.Model.extend({
  // Make sure our required attributes are present.
  defaults: {
    nid: null,
    date: null,
    start_time: null,
    end_time: null
  },

  initialize: function (attributes, options) {

  }
});

}(jQuery));

