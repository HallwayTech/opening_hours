/**
 * @file
 * JavaScript code for presenting opening hours.
 */

(function ($) {
  "use strict";

  // View prototype to manage each week presentation’s state.
  Drupal.OpeningHours.WeekPresentationView = function (options) {
    var self = this;

    self.constructor = function () {
      self.dataStore = {};
      self.el = $(options.el);
      self.options = options;
      self.week = options.week;

      // Set up binding for navigation.
      self.el.find('.prev').click(self.goToPreviousWeek);
      self.el.find('.next').click(self.goToNextWeek);

      return self;
    };

    // Get data for the current week.
    self.getData = function (callback) {
      $.ajax({
        data: {
          from_date: self.week.dates[0].getISODate(),
          to_date: self.week.dates[6].getISODate(),
          nid: self.options.nid
        },
        dataType: 'json',
        success: function (data) {
          // Set up an empty dataStore array for each day in the week.
          _.each(self.week.dates, function (date) {
            self.dataStore[date.getISODate()] = [];
          });

          // Store the received data in the dataStore.
          _.each(data, function (instance) {
            self.dataStore[instance.date].push(instance);
          });

          if (callback) {
            callback();
          }
        },
        url: Drupal.settings.basePath + 'opening_hours/instances'
      });
    };

    self.goToPreviousWeek = function (event) {
      var date = new Date(self.week.dates[0].getTime());

      // Subtract seven days to get the first date of the previous week,
      // and use the router to navigate back to that.
      date.setDate(date.getDate() - 7);

      // Change the date of the view and re-render it.
      self.week = new Drupal.OpeningHours.Week(date.getISODate(), self.week.firstDayOfWeek);
      self.render();

      event.preventDefault();
    };

    self.goToNextWeek = function (event) {
      var date = new Date(self.week.dates[6].getTime());

      // Add one day to the last date of the previous week,
      // and use the router to navigate back to that.
      date.setDate(date.getDate() + 1);

      // Change the date of the view and re-render it.
      self.week = new Drupal.OpeningHours.Week(date.getISODate(), self.week.firstDayOfWeek);
      self.render();

      event.preventDefault();
    };

    // Render the week as soon as data is available.
    self.render = function () {
      // Fade out the element while we're waiting on data.
      self.el.fadeOut('fast');
      // Wait till we have data available before rendering.
      self.getData(function (data) {
        var daysContainer = self.el.find('.days');

        // Clean out previously rendered week, if any.
        daysContainer.empty();

        // Fill in the header.
        self.el.find('.week_num').text($.datepicker.iso8601Week(self.week.dates[0]));
        self.el.find('.from_date').text($.datepicker.formatDate('d/m', self.week.dates[0]));
        self.el.find('.to_date').text($.datepicker.formatDate('d/m', self.week.dates[6]));

        // Render each date.
        _.each(self.week.dates, function (date) {
          var dateStr = date.getISODate(),
              renderedInstances = [];

          // Render each instance for this day.
          _.each(self.dataStore[dateStr], function (instance) {
            renderedInstances.push(self.options.instanceTemplate({
              start_time: instance.start_time,
              end_time: instance.end_time,
              notice: instance.notice
            }));

          });

          daysContainer.append(self.options.dayTemplate({
            name: $.datepicker.formatDate('DD', date),
            instances: renderedInstances.join("") || Drupal.t('closed')
          }));
        });
        
        // Fade back in when we're done rendering.
        self.el.fadeIn('fast');

        self.el.removeClass('placeholder');
      });
    };

    return self.constructor();
  };

  // When the document is ready, set up our app.
  $(function () {
    var curDate = new Date().getISODate(),
        dayTemplate = _.template($('#oho-day-presentation-template').html()),
        instanceTemplate = _.template($('#oho-instance-presentation-template').html()),
        week = new Drupal.OpeningHours.Week(curDate, Drupal.settings.OpeningHours.firstDayOfWeek);

    // Set up WeekPresentationView instances for each presentation
    // present on the page.
    $('.opening-hours-week').each(function () {
      var view = new Drupal.OpeningHours.WeekPresentationView({
        date: curDate,
        dayTemplate: dayTemplate,
        el: this,
        firstDayOfWeek: Drupal.settings.OpeningHours.firstDayOfWeek,
        instanceTemplate: instanceTemplate,
        nid: parseInt($(this).attr('data-nid'), 10),
        week: week
      });

      view.render();

      // Save the view instance for later reference.
      $.data(this, 'weekPresentationViewInstance', view);
    });
  });

}(jQuery));

