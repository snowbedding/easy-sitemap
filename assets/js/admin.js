/**
 * Easy Sitemap Admin JavaScript
 */

(function($) {
	'use strict';

	$(document).ready(function() {

		// Initialize admin functionality
		initShortcodeGenerator();


		/**
		 * Initialize Shortcode Generator
		 */
		function initShortcodeGenerator() {
			var $output = $('#esg_output');

			if (!$output.length) {
				return;
			}

			function buildShortcode() {
				var parts = ['[easy_sitemap'];

				// Basic settings
				var postType = $('#esg_post_type').val();
				var limit = parseInt($('#esg_limit').val(), 10) || 1000;
				var orderby = $('#esg_orderby').val() || 'date';
				var order = $('input[name="esg_order"]:checked').val() || 'DESC';

				// Content filtering
				var include = ($('#esg_include').val() || '').trim();
				var exclude = ($('#esg_exclude').val() || '').trim();
				var category = ($('#esg_category').val() || '').trim();
				var tag = ($('#esg_tag').val() || '').trim();
				var taxonomy = ($('#esg_taxonomy').val() || '').trim();
				var term = ($('#esg_term').val() || '').trim();
				var author = $('#esg_author').val() ? parseInt($('#esg_author').val(), 10) : '';
				var dateFrom = $('#esg_date_from').val() || '';
				var dateTo = $('#esg_date_to').val() || '';

				// Display options - re-fetch values each time to ensure accuracy
				var hierarchical = $('#esg_hierarchical').prop('checked');
				var depth = parseInt($('#esg_depth').val(), 10) || 0;
				var showDates = $('#esg_show_dates').prop('checked');
				var showExcerpts = $('#esg_show_excerpts').prop('checked');
				var showImages = $('#esg_show_images').prop('checked');
				var columns = parseInt($('#esg_columns').val(), 10) || 1;
				var customClass = ($('#esg_class').val() || '').trim();



				// Add attributes to shortcode (only non-default values)
				if (postType) parts.push('post_type="' + postType + '"');
				if (limit !== 1000) parts.push('limit="' + limit + '"');
				if (orderby !== 'date') parts.push('orderby="' + orderby + '"');
				if (order !== 'DESC') parts.push('order="' + order + '"');

				if (include) parts.push('include="' + include.replace(/\s*,\s*/g, ',').trim() + '"');
				if (exclude) parts.push('exclude="' + exclude.replace(/\s*,\s*/g, ',').trim() + '"');
				if (category) parts.push('category="' + category.replace(/\s*,\s*/g, ',').trim() + '"');
				if (tag) parts.push('tag="' + tag.replace(/\s*,\s*/g, ',').trim() + '"');
				if (taxonomy) parts.push('taxonomy="' + taxonomy.trim() + '"');
				if (term) parts.push('term="' + term.replace(/\s*,\s*/g, ',').trim() + '"');
				if (author) parts.push('author="' + author + '"');
				if (dateFrom) parts.push('date_from="' + dateFrom + '"');
				if (dateTo) parts.push('date_to="' + dateTo + '"');

				if (hierarchical) parts.push('hierarchical="1"');
				if (depth > 0) parts.push('depth="' + depth + '"');
				if (showDates) parts.push('show_dates="1"');
				if (showExcerpts) parts.push('show_excerpts="1"');
				if (showImages) parts.push('show_images="1"');
				if (columns > 1) parts.push('columns="' + columns + '"');
				if (customClass) parts.push('class="' + customClass + '"');

				var shortcode = parts.join(' ') + ']';
				$output.val(shortcode);
			}

			// Bind events to all form controls with proper selectors
			var selectors = [
				'#esg_post_type',
				'#esg_limit',
				'#esg_orderby',
				'input[name="esg_order"]',
				'#esg_include',
				'#esg_exclude',
				'#esg_category',
				'#esg_tag',
				'#esg_taxonomy',
				'#esg_term',
				'#esg_author',
				'#esg_date_from',
				'#esg_date_to',
				'#esg_hierarchical',
				'#esg_depth',
				'#esg_show_dates',
				'#esg_show_excerpts',
				'#esg_show_images',
				'#esg_columns',
				'#esg_class'
			];

			$(document).on('change input', selectors.join(', '), function() {
				buildShortcode();
			});


			// Copy button functionality with improved error handling
			$(document).on('click', '#esg_copy_button', function() {
				var $textarea = $('#esg_output');
				var $button = $(this);

				try {
					// Select the text
					$textarea.select();

					// Try to copy using the modern clipboard API first
					if (navigator.clipboard && window.isSecureContext) {
						navigator.clipboard.writeText($textarea.val()).then(function() {
							showCopySuccess($button);
						}).catch(function() {
							fallbackCopy($textarea, $button);
						});
					} else {
						fallbackCopy($textarea, $button);
					}
				} catch (err) {
					console.log('Copy failed:', err);
					showCopyError($button);
				}
			});

			function fallbackCopy($textarea, $button) {
				try {
					document.execCommand('copy');
					showCopySuccess($button);
				} catch (err) {
					showCopyError($button);
				}
			}

			function showCopySuccess($button) {
				var originalText = $button.text();
				$button.text(easySitemapAdmin.copied || 'Copied!').addClass('button-primary');
				setTimeout(function() {
					$button.text(easySitemapAdmin.copy || 'Copy Shortcode').removeClass('button-primary');
				}, 2000);
			}

			function showCopyError($button) {
				var originalText = $button.text();
				$button.text('Copy failed').addClass('button-secondary');
				setTimeout(function() {
					$button.text(easySitemapAdmin.copy || 'Copy Shortcode').removeClass('button-secondary');
				}, 2000);
			}

			// Initialize on load
			buildShortcode();
		}




		/**
		 * Initialize tooltips
		 */
		$('.easy-sitemap-tooltip').each(function() {
			var $element = $(this);
			var tooltip = $element.data('tooltip');

			if (tooltip) {
				$element.attr('title', tooltip);
			}
		});

		// Add keyboard navigation for tabs
		$('.nav-tab-wrapper .nav-tab').on('keydown', function(e) {
			if (e.keyCode === 37) { // Left arrow
				e.preventDefault();
				$(this).prev('.nav-tab').focus().click();
			} else if (e.keyCode === 39) { // Right arrow
				e.preventDefault();
				$(this).next('.nav-tab').focus().click();
			}
		});

	});

})(jQuery);
