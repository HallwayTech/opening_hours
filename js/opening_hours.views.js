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

  goToPreviousWeek: function (event) {
    var date = new Date(this.currentWeek.dates[0].getTime());

    // Subtract seven days to get the first date of the previous week,
    // and use the router to navigate back to that.
    date.setDate(date.getDate() - 7);
    this.goToDate(date.getISODate());

    event.preventDefault();
  },

  goToCurrentWeek: function (event) {
    Drupal.OpeningHours.adminApp.navigate('', true);

    event.preventDefault();
  },

  goToNextWeek: function (event) {
    var date = new Date(this.currentWeek.dates[6].getTime());

    // Add one day to the last date of the previous week,
    // and use the router to navigate back to that.
    date.setDate(date.getDate() + 1);
    this.goToDate(date.getISODate());

    event.preventDefault();
  },

  // Switches admin view to a specific date.
  goToDate: function (dateStr) {
    Drupal.OpeningHours.adminApp.navigate('date/' + dateStr, true);
  },

  render: function (options) {
    var dateRange = Drupal.OpeningHours.formatDateRange(options.week.dates[0], options.week.dates[6]),
        dateHeaders = [],
        dateColumns = [],
        columnsContainer,
        elem = $(this.el),
        mainView = this;

    // Clear out any previous content before rendering.
    elem.empty();

    this.currentWeek = options.week;

    // Create and render a DayView for each day in the week.
    _.each(options.week.dates, function (date) {
      var dateStr = date.getISODate(),
          view = new Drupal.OpeningHours.DayView({
            date: date,
            firstDayOfWeek: mainView.firstDayOfWeek,
            models: options.dayInstances[dateStr],
            nid: mainView.nid
          });

      // Render a header for the date as well as the actual date display.
      dateHeaders.push(Drupal.OpeningHours.formatDate(date, 'DD d. MM'));
      dateColumns.push(view.render().el);
    });

    // Render the main template.
    elem.html(this.template({
      'dateHeaders': dateHeaders,
      'fromDate': dateRange[0],
      'toDate': dateRange[1],
      'weekNumber': $.datepicker.iso8601Week(options.week.dates[0]),
      'year': options.week.dates[0].getFullYear()
    }));

    // Set up bindings for navigation buttons.
    elem.find('.prev-week').click(this.goToPreviousWeek);
    elem.find('.current-week').click(this.goToCurrentWeek);
    elem.find('.next-week').click(this.goToNextWeek);

    // Make it possible to select a date by clicking the date header.
    elem.find('.dateheader').click(function (event) {
      $('<div></div>').datepicker('dialog', options.week.dates[0], mainView.goToDate, {
        modal: true
      }, event);

      event.preventDefault();
    });


    // I can't find a way to put the columns in via the template, so we
    // add them to the DOM dynamically, even though that's a lot slower.
    columnsContainer = elem.find('tbody tr');
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
    this.models = options.models;
    this.instanceViews = _.map(this.models, function (model) {
      return new Drupal.OpeningHours.InstanceDisplayView({
        date: options.date,
        firstDayOfWeek: options.firstDayOfWeek,
        nid: options.nid,
        model: model
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
    this.model = options.model;

    this.model.bind('change', this.render);
    this.model.bind('remove', this.remove);
  },

  editInstance: function (event) {
    var view = new Drupal.OpeningHours.InstanceEditView({
      model: this.model,
      nid: this.nid
    });

    view.render();

    // We don't want this event to propagate, since if it does, the
    // dayView will catch it and try to create a new instance.
    event.preventDefault();
    event.stopPropagation();
  },

  render: function (options) {
    var model = this.model;

    $(this.el).html(this.template({
      start_time: model.get('start_time'),
      end_time: model.get('end_time'),
      notice: model.get('notice')
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
    if (options.model) {
      this.newInstance = false;
      this.title = Drupal.t('Edit opening hours instance');
      this.model = options.model;

      this.model.bind('remove', this.remove);
    }
    else {
      // Default repeat end date is in six months.
      var endDate = new Date();
      endDate.setTime(this.date.getTime());
      endDate.setMonth(endDate.getMonth() + 6);

      this.newInstance = true;
      this.title = Drupal.t('Add new opening hours instance');

      // Make up a new instance.
      this.model = new Drupal.OpeningHours.Instance({
        date: this.date.getISODate(),
        nid: this.nid,
        // Standard repeat ends in six months.
        repeat_end_date: endDate.getISODate()
      });
    }

    return this;
  },

  // Close dialogs and remove view from DOM.
  remove: function () {
    $(this.el).remove();

    if (this.dialogInstance){
      this.dialogInstance.dialog("destroy").remove();
      this.dialogInstance = null;
    }

    return this;
  },

  render: function (options) {
    var buttons = {}, dialogInstance,
        model = this.model,
        today = new Date(),
        view = this;

    // Render the editing form from the template.
    $(this.el).html(this.template({
      isNew: model.isNew(),
      date: model.get('date'),
      start_time: model.get('start_time'),
      end_time: model.get('end_time'),
      repeat_end_date: model.get('repeat_end_date'),
      notice: model.get('notice')
    }));

    // Set the placeholder text from the title on all text fields.
    this.$('[type=text]').each(function () {
      if (this.title) {
        this.placeholder = this.title;
      }
    });

    // If we don't have the editing dialog open already, create it.
    if (!this.dialogInstance) {
      // Configure buttons for the dialog.
      buttons[Drupal.t('Save')] = this.saveButton;

      buttons[Drupal.t('Discard changes')] = function () {
        view.remove();
        $(this).dialog("destroy").remove();
        view.hasActiveDialog = false;
      };

      // For existing instances, we also offer a delete button.
      if (this.model.id) {
        buttons[Drupal.t('Delete this instance')] = function () {
          var wrapper = this;

          view.model.destroy({
            error: function () {
              console.log('fail');
            },
            success: function () {
              view.remove();
              $(wrapper).dialog("destroy").remove();
              view.hasActiveDialog = false;

              // Navigate to the date to show the change.
              Drupal.OpeningHours.adminApp.navigate('date/' + view.model.get('date'), true);
            }
          });

          return false;
        };
      }

      this.dialogInstance = $('<div></div>')
        .html(this.el)
        .dialog({
          buttons: buttons,
          close: function () { view.remove(); },
          draggable: false,
          height: 350,
          modal: true,
          resizable: false,
          title: this.title,
          width: 600
        });
    }

    // Enable the datepicker on the date field.
    this.$('.date').datepicker();

    // Set the repeat value and configure bindings for hiding/showing
    // the end date based on the repeat setting.
    this.$('.repeat select')
      .val(view.model.get('repeat_rule'));

    this.$('.repeat select')
      .change(function () {
        var $elem = $(this);

        if ($elem.val() === 'weekly') {
          $elem.siblings('.end').fadeIn();
        }
        else {
          $elem.siblings('.end').fadeOut();
        }
      })
      .change();

    // Repeat end date must be between today and in two years.
    this.$('.repeat-end-date').datepicker({
      minDate: today,
      maxDate: new Date().setFullYear(today.getFullYear + 2)
    });

    // Enable the timeEntry helpers on both time fields.
    this.$('.start_time, .end_time').timeEntry({
      show24Hours: true,
      spinnerImage: false,
      timeSteps: [1, 15, 1]
    });

    return this;
  },

  // Callback for when the save button is pressed.
  saveButton: function () {
    var changedAttributes,
        form = this.$('form'),
        formValues = {
          start_time: form.find('.start_time').val(),
          end_time: form.find('.end_time').val(),
          repeat_rule: form.find('.repeat select').val(),
          repeat_end_date: form.find('.repeat-end-date').val(),
          notice: form.find('.notice').val()
        };

    // Only allow changing the date for new instances.
    if (this.newInstance) {
      formValues.date = form.find('.date').val();
    }

    // Figure out which field values have actually changed.
    changedAttributes = this.model.changedAttributes(formValues);

    // If our data hasn't changed, changedAttributes will be false.
    // In this case, do nothing;
    if (!changedAttributes) {
      return this;
    }

    // Save the data via Backbone.sync.
    this.model.save(formValues, {
      error: {
        // TODO: Handle this.
      },
      success: this.saveSucceeded
    });

    return this;
  },

  // Callback for when a save succeeds.
  saveSucceeded: function () {
    // When instance is saved, navigate to it, so the user can see
    // something has happened.
    Drupal.OpeningHours.adminApp.navigate('date/' + this.model.get('date'), true);

    this.remove();

    return this;
  }
});

});

