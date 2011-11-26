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

  opening_hours_add_js('admin');

  return theme('opening_hours_admin');
}

