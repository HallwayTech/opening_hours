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

