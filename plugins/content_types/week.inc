<?php
/**
 * @file
 * CTools plugin providing a Panels content type for displaying opening hours.
 */

/**
 * Array describing the plugin to CTools/Panels.
 */
$plugin = array(
  'title' => t('Opening hours by week'),
  'description' => t('Shows opening hours for the current week for the node in question with arrows for displaying future weeks as well.'),
  'single' => TRUE,
  'content_types' => array('list'),
  'required context' => new ctools_context_required(t('Node'), 'node'),
  'category' => t('Node'),
);

/**
 * Render the block
 */
function opening_hours_week_content_type_render($subtype, $conf, $panel_args, $context) {
  $node = isset($context->data) ? $context->data : NULL;

  $block = new stdClass();
  $block->title = t('Opening hours');

  $block->content = theme('opening_hours_week', $node);

  return $block;
}
