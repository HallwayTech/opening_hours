/**
 * @file
 * Backbone collections for managing opening hours instances.
 */

(function ($) {
"use strict";

/**
 * A collection of opening hours instances.
 */
Drupal.OpeningHours.Instances = Backbone.Collection.extend({
  model: Drupal.OpeningHours.Instance,
  url: '/opening_hours/instances'
});

}(jQuery));

