/**
 * Easy Sitemap Frontend JavaScript
 */

(function($) {
	'use strict';

	$(document).ready(function() {

		// Initialize sitemap functionality
		initSitemapSearch();
		initSitemapFilters();
		initLazyLoading();

		/**
		 * Initialize search functionality
		 */
		function initSitemapSearch() {
			$('.easy-sitemap-search input[type="text"]').on('input', function() {
				var searchTerm = $(this).val().toLowerCase();
				var $sitemap = $(this).closest('.easy-sitemap');
				var $items = $sitemap.find('.easy-sitemap-item');

				if (searchTerm.length === 0) {
					$items.show();
					$sitemap.find('.easy-sitemap-no-results').remove();
					return;
				}

				var visibleCount = 0;
				$items.each(function() {
					var $item = $(this);
					var text = $item.text().toLowerCase();

					if (text.indexOf(searchTerm) !== -1) {
						$item.show();
						visibleCount++;
					} else {
						$item.hide();
					}
				});

				// Show/hide no results message
				$sitemap.find('.easy-sitemap-no-results').remove();
				if (visibleCount === 0) {
					$sitemap.append('<p class="easy-sitemap-no-results">' +
						easySitemapData.strings.noResults || 'No results found.' +
						'</p>');
				}
			});
		}

		/**
		 * Initialize filter functionality
		 */
		function initSitemapFilters() {
			$('.easy-sitemap-filter').on('change', function() {
				var $sitemap = $(this).closest('.easy-sitemap');
				var filters = {};

				// Collect filter values
				$sitemap.find('.easy-sitemap-filter').each(function() {
					var $filter = $(this);
					var filterType = $filter.data('filter-type');
					var value = $filter.val();

					if (value) {
						filters[filterType] = value;
					}
				});

				// Apply filters
				filterSitemapItems($sitemap, filters);
			});
		}

		/**
		 * Filter sitemap items
		 */
		function filterSitemapItems($sitemap, filters) {
			var $items = $sitemap.find('.easy-sitemap-item');

			$items.each(function() {
				var $item = $(this);
				var show = true;

				// Check each filter
				$.each(filters, function(filterType, value) {
					switch(filterType) {
						case 'date':
							var itemDate = $item.find('.easy-sitemap-date').text();
							if (itemDate && itemDate.indexOf(value) === -1) {
								show = false;
								return false;
							}
							break;
						case 'category':
							var itemCategory = $item.closest('.easy-sitemap-category').text();
							if (itemCategory && itemCategory.toLowerCase().indexOf(value.toLowerCase()) === -1) {
								show = false;
								return false;
							}
							break;
						case 'author':
							var itemAuthor = $item.data('author');
							if (itemAuthor && itemAuthor.toLowerCase().indexOf(value.toLowerCase()) === -1) {
								show = false;
								return false;
							}
							break;
					}
				});

				$item.toggle(show);
			});
		}

		/**
		 * Initialize lazy loading for large sitemaps
		 */
		function initLazyLoading() {
			$('.easy-sitemap[data-lazy-load="true"]').each(function() {
				var $sitemap = $(this);
				var page = 1;
				var loading = false;

				// Add load more button
				if (!$sitemap.find('.easy-sitemap-load-more').length) {
					$sitemap.append('<button class="easy-sitemap-load-more button">' +
						(easySitemapData.strings.loadMore || 'Load More') +
						'</button>');
				}

				$sitemap.on('click', '.easy-sitemap-load-more', function(e) {
					e.preventDefault();

					if (loading) return;

					loading = true;
					var $button = $(this);
					var originalText = $button.text();

					$button.text(easySitemapData.strings.loading || 'Loading...').prop('disabled', true);

					// AJAX load more items
					$.ajax({
						url: easySitemapData.ajaxUrl,
						type: 'POST',
						data: {
							action: 'easy_sitemap_load_more',
							page: page + 1,
							sitemap_id: $sitemap.data('sitemap-id'),
							nonce: easySitemapData.nonce
						},
						success: function(response) {
							if (response.success && response.data.html) {
								$sitemap.find('.easy-sitemap-list').append(response.data.html);
								page++;

								if (!response.data.has_more) {
									$button.remove();
								} else {
									$button.text(originalText).prop('disabled', false);
								}
							} else {
								$button.text(easySitemapData.strings.noMore || 'No more items').prop('disabled', true);
							}
						},
						error: function() {
							$button.text(easySitemapData.strings.error || 'Error loading items').prop('disabled', false);
						},
						complete: function() {
							loading = false;
						}
					});
				});
			});
		}

		/**
		 * Handle keyboard navigation
		 */
		$(document).on('keydown', '.easy-sitemap-search input[type="text"]', function(e) {
			if (e.keyCode === 13) { // Enter key
				e.preventDefault();
			}
		});

		/**
		 * Add ARIA labels for accessibility
		 */
		$('.easy-sitemap-search input[type="text"]').attr('aria-label',
			easySitemapData.strings.searchLabel || 'Search sitemap');

		$('.easy-sitemap-filter').each(function() {
			var label = $(this).prev('label').text() || $(this).data('label');
			if (label) {
				$(this).attr('aria-label', label);
			}
		});

		/**
		 * Handle print functionality
		 */
		$('.easy-sitemap-print').on('click', function(e) {
			e.preventDefault();
			window.print();
		});

	});

})(jQuery);
