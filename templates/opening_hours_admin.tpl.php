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
  <div class="dateheader">
    <h2><?php print t('Week !week, !year', array(
      '!week' => '<%- weekNumber %>',
      '!year' => '<%- year %>',
    )); ?></h2>
    <h3 class="dateheader">
      <span class="date from"><%- fromDate %></span>
      <% if (toDate) { %>
        – <span class="date to"><%- toDate %></span> 
      <% } %>
    </h3>
  </div>

  <ul class="navigation clear-block">
    <li><a class="prev-week" href="#prev" title="<?php print t('Previous week'); ?>">‹</a>
    <li><a class="current-week" href="#current"><?php print t('Current week'); ?></a>
    <li><a class="next-week" href="#next" title="<?php print t('Next week'); ?>">›</a>
  </ul>

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

<script type="text/template" id="oho-instance-edit-template">
  <form action="." id="oho-instance-edit-form">
    <fieldset class="date-time">
      <input type="text" class="date text" size="9" title="<?php print t('Date'); ?>" value="<%= date %>" />
      <input type="text" class="start_time text" size="7" title="<?php print t('Start time'); ?>" value="<%= start_time %>" />
      to
      <input type="text" class="end_time text" size="7" title="<?php print t('End time'); ?>" value="<%= end_time %>" />
    </fieldset>

    <fieldset class="description">
      <label for="oho-notice"><?php print t('Notice'); ?></label>
      <input type="text" class="notice text" name="oho-notice" id="oho-notice" title="<?php print t('What’s special about this instance?'); ?>" value="<%= notice %>" />
    </fieldset>

  </form>
</script>

