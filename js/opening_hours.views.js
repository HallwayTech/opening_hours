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
    var dateRange = Drupal.OpeningHours.formatDateRange(options.week.dates[0], options.week.dates[6]),
        dateHeaders = [],
        dateColumns = [];

    // Create and render a DayView for each day in the week.
    _.each(options.week.dates, function (date) {
      var dateStr = date.getISODate(),
          view = new Drupal.OpeningHours.DayView({
            date: date,
            instances: options.dayInstances[dateStr]
          });

      // Render a header for the date as well as the actual date display.
      dateHeaders.push(Drupal.OpeningHours.formatDate(date, 'DD d. MM'));
      dateColumns.push($(view.render().el).html());
    });

    // Render the main template.
    $(this.el).html(this.template({
      'header': '',
      'dateHeaders': dateHeaders,
      'dateColumns': dateColumns,
      'fromDate': dateRange[0],
      'toDate': dateRange[1]
    }));

    return this;
  }
});

/**
 * A view of a single day, mainly a container for the instances inside it.
 */
Drupal.OpeningHours.DayView = Backbone.View.extend({
  className: 'day-view',

  initialize: function (options) {
    this.date = options.date;
    this.instances = options.instances;
    this.instanceViews = _.map(this.instances, function (instance) {
      return new Drupal.OpeningHours.InstanceDisplayView({
        date: options.date,
        instance: instance
      });
    });
  },

  render: function (options) {
    var container = $(this.el);

    container.empty();

    // Render the main template.
    $(this.el).html(_.each(this.instanceViews, function (view) {
      container.append(view.render().el);
    }));

    return this;
  }
});

/**
 * Display a single opening hours instance.
 */
Drupal.OpeningHours.InstanceDisplayView = Backbone.View.extend({
  className: 'instance-display-view',
  template: _.template($("#oho-instance-display-template").html()),

  initialize: function (options) {
    _.bindAll(this, ['render']);
    this.date = options.date;
    this.instance = options.instance;
  },

  render: function (options) {
    var instance = this.instance;
  
    $(this.el).html(this.template({
      start_time: instance.get('start_time'),
      end_time: instance.get('end_time'),
      notice: instance.get('notice')
    }));
    
    return this;
  }
});

});

