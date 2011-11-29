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
  <h2><%- header %></h2>
  <h3>
    <span class="date from"><%- fromDate %></span>
    <% if (toDate) { %>
      – <span class="date to"><%- toDate %></span> 
    <% } %>
  </h3>

  <div class="days"></div>
</script>

