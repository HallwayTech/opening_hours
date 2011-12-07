<?php
/**
 * @file
 * Template for the opening hours admin interface.
 *
 * Is not really a template in Drupal-sense, mainly a container for the
 * markup necessary to render the opening hours interface.
 */
?>
<div id="opening-hours-admin">
  <p class="placeholder"><?php print t('Loading administration interface…'); ?></p>
</div>

<script type="text/template" id="oho-admin-main-template">
  <h2><?php print t('Week !week, !year', array(
    '!week' => '<%- weekNumber %>',
    '!year' => '<%- year %>',
  )); ?></h2>
  <h3>
    <span class="date from"><%- fromDate %></span>
    <% if (toDate) { %>
      – <span class="date to"><%- toDate %></span> 
    <% } %>
  </h3>

  <table class="days">
    <thead>
      <tr>
        <% _.each(dateHeaders, function (header) { %><th><%= header %></th><% }); %>
      </tr>
    </thead>
    <tbody><tr></tr></tbody>
  </table>
</script>

<script type="text/template" id="oho-instance-display-template">
  <span class="start_time"><%= start_time %></span> –
  <span class="end_time"><%= end_time %></span>
  <p class="notice"><%= notice %></p>
</script>

