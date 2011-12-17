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
        header('HTTP/1.1 201 Created');
        header('Location: ' . url('opening_hours/instances/' .  $instance->instance_id));
        $output[] = $instance;

        if (!empty($instance->repeat_rule)) {
          opening_hours_repeat_instance_propagate($instance);
        }
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
      $updated_instance = _opening_hours_get_instance_from_request();

      // We can hardly save an instance that doesn't have the required data.
      if (!$updated_instance) {
        header('HTTP/1.1 400 Bad Request');
        exit('Required fields were missing or invalid.');
      }

      // Check that instance_id matches up.
      if ($updated_instance->instance_id != $instance->instance_id) {
        header('HTTP/1.1 400 Bad Request');
        exit('Instance ID mismatch.');
      }

      $output[] = _opening_hours_instance_update($updated_instance, $instance);
      break;
    case 'DELETE':
      _opening_hours_instance_delete($instance);
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

/**
 * Helper function to update an existing instance.
 *
 * Also updates propagated copies, if applicable.
 *
 * @param stdClass $instance
 *   The updated instance object.
 * @param stdClass $original
 *   Original instance data as currently stored in the database.
 * @return stdClass
 *   Returns $instance.
 */
function _opening_hours_instance_update($instance, $original) {
  $query = db_query("
    UPDATE {opening_hours} 
    SET start_time = '%s', end_time = '%s', notice = '%s'
    WHERE instance_id = %d OR original_instance_id = %d
  ", array(
    ':start' => $instance->start_time,
    ':end' => $instance->end_time,
    ':notice' => $instance->notice,
    ':id' => $instance->instance_id,
    ':id2' => $instance->instance_id,
  ));

  return $instance;
}

/**
 * Helper function to delete an existing instance.
 *
 * Also deletes propagated copies, if applicable.
 *
 * @param stdClass $instance
 *   The update instance object.
 */
function _opening_hours_instance_delete($instance, $original) {
  $query = db_query("
    DELETE FROM {opening_hours} 
    WHERE instance_id = %d OR original_instance_id = %d
  ", array(
    ':id' => $instance->instance_id,
    ':id2' => $instance->instance_id,
  ));
}

