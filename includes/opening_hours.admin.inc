<?php
/**
 * @file
 * Administration page for opening hours.
 */

/**
 * Main admin overview page.
 */
function opening_hours_admin_settings_page() {
  $output = array();

  // Blocked days section.
  $output[] = '<h3>' . t('Blocked days') . '</h3>';
  $output[] = '<p class="description">';
  $output[] = t('Blocked days are days where no opening hours are
    allowed, ie. everythings appears to be closed. You can use this
    functionality to enforce closing days for a large chain of shops or
    similar organisations, to avoid having to enter closing data on
    dozens of pages.');

  $days = array();
  $blocked_query = db_query("SELECT * FROM {opening_hours_blocked_days}");

  while ($row = db_fetch_object($blocked_query)) {
    $days[] = $row->date . ' ' . l(t('Delete'), 'admin/content/opening_hours/blocked_day/' . $row->day_id .  '/delete');
  }

  $output[] = theme('item_list', $days);

  $output[] = l('Add new blocked day', 'admin/content/opening_hours/blocked_day/add');


  return implode("\n", $output);
}

/**
 * Add blocked day form.
 */
function opening_hours_admin_blocked_day_add_form(&$form_state) {
  $form = array();

  $form['date'] = array(
    '#type' => 'date_popup',
    '#title' => t('Date'),
    '#date_format' => 'Y-m-d',
    '#date_year_range' => '-0:+10',
  );

  $form['buttons']['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Save blocked day'),
  );

  return $form;
}

/**
 * Submit handler for blocked day form.
 */
function opening_hours_admin_blocked_day_add_form_submit(&$form, &$form_state) {
  if (drupal_write_record('opening_hours_blocked_days', $form_state['values']) == SAVED_NEW) {
    drupal_set_message(t('Blocked day added'));
  }

  $form_state['redirect'] = 'admin/content/opening_hours';
}

