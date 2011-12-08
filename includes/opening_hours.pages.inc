<?php
/**
 * @file
 * Page callbacks for the opening hours module.
 */

/**
 * Page for editing the opening hours for a specific node.
 */
function opening_hours_node_edit_page($node) {
  drupal_set_title(t('Opening hours for @title', array('@title' => $node->title)));

  drupal_add_css(drupal_get_path('module', 'jquery_ui') . '/jquery.ui/themes/default/ui.all.css');
  drupal_add_css(drupal_get_path('module', 'opening_hours') . '/css/opening_hours.admin.css');
  opening_hours_add_js('admin', $node->nid);

  return theme('opening_hours_admin');
}

/**
 * The CRUD API for communication with Backbone.
 */
function opening_hours_crud_api_page() {
  $output = array();

  switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
      if (!user_access('edit opening hours for content')) {
        header('HTTP/1.1 403 Forbidden');
        exit('Client does not have permissions to edit opening hours.');
      }

      $instance = _opening_hours_get_instance_from_request();

      // We can hardly save an instance that doesn't have the required data.
      if (!$instance) {
        header('HTTP/1.1 400 Bad Request');
        exit('Required fields were missing or invalid.');
      }

      if (drupal_write_record('opening_hours', $instance) === SAVED_NEW) {
        $output[] = $instance;
      }

      break;
    case 'GET':
      if (!empty($_REQUEST['from_date']) && !empty($_REQUEST['to_date']) && !empty($_REQUEST['nid'])) {
        $output = opening_hours_instance_load_multiple($_REQUEST['nid'], $_REQUEST['from_date'], $_REQUEST['to_date']);
      }
  }

  drupal_set_header('Content-Type: application/json');
  echo json_encode($output);
  exit();
}

/**
 * The CRUD API for a specific instance ID.
 */
function opening_hours_instance_id_api_page($instance) {
  $output = array();

  switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
      $output[] = $instance;
      break;
    case 'PUT':
      break;
    case 'DELETE':
      break;
  }

  drupal_set_header('Content-Type: application/json');
  echo json_encode($output);
  exit();
}

/**
 * Helper function to get and sanitise instance from request input.
 */
function _opening_hours_get_instance_from_request() {
  $instance = json_decode(file_get_contents("php://input"));

  // At the very least, we must have nid, date, start_time and end_time set.
  if (empty($instance->nid) || empty($instance->date) ||
      empty($instance->start_time) || empty($instance->end_time)) {
    return;
  }

  return $instance;
}

