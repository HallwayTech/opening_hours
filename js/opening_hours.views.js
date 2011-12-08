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

  initialize: function (options) {
    _.bindAll(this);

    this.firstDayOfWeek = options.firstDayOfWeek;
    this.nid = options.nid;
  },

  render: function (options) {
    var dateRange = Drupal.OpeningHours.formatDateRange(options.week.dates[0], options.week.dates[6]),
        dateHeaders = [],
        dateColumns = [],
        columnsContainer,
        mainView = this;

    // Create and render a DayView for each day in the week.
    _.each(options.week.dates, function (date) {
      var dateStr = date.getISODate(),
          view = new Drupal.OpeningHours.DayView({
            date: date,
            firstDayOfWeek: mainView.firstDayOfWeek,
            instances: options.dayInstances[dateStr],
            nid: mainView.nid
          });

      // Render a header for the date as well as the actual date display.
      dateHeaders.push(Drupal.OpeningHours.formatDate(date, 'DD d. MM'));
      dateColumns.push(view.render().el);
    });

    // Render the main template.
    $(this.el).html(this.template({
      'weekNumber': $.datepicker.iso8601Week(options.week.dates[0]),
      'year': options.week.dates[0].getFullYear(),
      'dateHeaders': dateHeaders,
      'fromDate': dateRange[0],
      'toDate': dateRange[1]
    }));

    columnsContainer = this.$('tbody tr');

    // I can't find a way to put the columns in via the template, so we
    // add them to the DOM dynamically, even though that's a lot slower.
    _.each(dateColumns, function (column) {
      columnsContainer.append(column);
    });

    return this;
  }
});

/**
 * A view of a single day, mainly a container for the instances inside it.
 */
Drupal.OpeningHours.DayView = Backbone.View.extend({
  className: 'day-view',
  tagName: 'td',

  events: {
    dblclick: 'addNewInstance'
  },

  initialize: function (options) {
    _.bindAll(this);

    this.date = options.date;
    this.nid = options.nid;
    this.instances = options.instances;
    this.instanceViews = _.map(this.instances, function (instance) {
      return new Drupal.OpeningHours.InstanceDisplayView({
        date: options.date,
        firstDayOfWeek: options.firstDayOfWeek,
        nid: options.nid,
        instance: instance,
      });
    });
  },

  addNewInstance: function (event) {
    var view = new Drupal.OpeningHours.InstanceEditView({
      date: this.date,
      nid: this.nid
    });

    view.render();

    event.preventDefault();
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

  events: {
    dblclick: 'editInstance'
  },

  initialize: function (options) {
    _.bindAll(this, ['render']);

    this.date = options.date;
    this.instance = options.instance;
  },

  editInstance: function (event) {
    var view = new Drupal.OpeningHours.InstanceEditView({
      instance: this.instance,
      nid: this.nid
    });

    view.render();

    // We don't want this event to propagate, since if it does, the
    // dayView will catch it and try to create a new instance.
    event.preventDefault();
    event.stopPropagation();
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

/**
 * Display a single opening hours instance.
 */
Drupal.OpeningHours.InstanceEditView = Backbone.View.extend({
  className: 'instance-edit-view',
  template: _.template($("#oho-instance-edit-template").html()),

  initialize: function (options) {
    _.bindAll(this);

    this.date = options.date || new Date();
    this.firstDayOfWeek = options.firstDayOfWeek;
    this.nid = options.nid;

    // If we're editing an existing instance.
    if (options.instance) {
      this.title = Drupal.t('Edit opening hours instance');
      this.instance = options.instance;
    }
    else {
      this.title = Drupal.t('Add new opening hours instance');
      this.instance = new Drupal.OpeningHours.Instance({
        date: this.date.getISODate(),
        nid: this.nid
      });
    }
  },

  render: function (options) {
    var buttons = {}, dialogInstance,
        instance = this.instance,
        view = this;

    // Render the editing form from the template.
    $(this.el).html(this.template({
      date: instance.get('date'),
      start_time: instance.get('start_time'),
      end_time: instance.get('end_time'),
      notice: instance.get('notice')
    }));

    // Set the placeholder text from the title on all text fields.
    this.$('[type=text]').each(function () {
      if (this.title) {
        this.placeholder = this.title;
      }
    });

    // Configure buttons for the dialog.
    buttons[Drupal.t('Save')] = function () {
      view.saveInstance();
    };

    dialogInstance = $('<div></div>')
      .html(this.el)
      .dialog({
        buttons: buttons,
        draggable: false,
        modal: true,
        resizable: false,
        title: this.title,
        width: 600
      });


    return this;
  },

  saveInstance: function () {
    var form = this.$('form');

    this.instance.set({
      date: form.find('.date').val(),
      start_time: form.find('.start_time').val(),
      end_time: form.find('.end_time').val(),
      notice: form.find('.notice').val()
    });

    this.instance.save();

  }
});

});

