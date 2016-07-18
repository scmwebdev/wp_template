;(function($) {

	var WPForms = {

		/**
		 * Start the engine.
		 *
		 * @since 1.2.3
		 */
		init: function() {

			// Document ready
			$(document).ready(WPForms.ready);

			// Page load
			$(window).on('load', WPForms.load);

			WPForms.bindUIActions();
		},

		/**
		 * Document ready.
		 *
		 * @since 1.2.3
		 */
		ready: function() {

			// Payments: Update Total field(s) with latest calculation
			$('.wpforms-payment-total').each(function(index, el) {
				WPForms.calculateTotalUpdate(this);
			})

			WPForms.loadValidation();
			WPForms.loadDatePicker();
			WPForms.loadTimePicker();
			WPForms.loadInputMask();
			WPForms.loadCreditCardValidation();
		},

		/**
		 * Page load.
		 *
		 * @since 1.2.3
		 */
		load: function() {

		},

		//--------------------------------------------------------------------//
		// Initializing
		//--------------------------------------------------------------------//

		/**
		 * Load jQuery Validation.
		 *
		 * @since 1.2.3
		 */
		loadValidation: function() {

			// Only load if jQuery validation library exists
			if (typeof $.fn.validate !== 'undefined') { 

				// Payments: Validate method for Credit Card Number
				if(typeof $.fn.payment !== 'undefined') { 
					$.validator.addMethod( "creditcard", function(value, element) {
						//var type  = $.payment.cardType(value);
						var valid = $.payment.validateCardNumber(value);
						return this.optional(element) || valid;
					}, "Please enter a valid credit card number.");
					// @todo validate CVC and expiration
				}

				// Payments: Validate method for currency
				// @link https://github.com/jzaefferer/jquery-validation/blob/master/src/additional/currency.js
				$.validator.addMethod( "currency", function(value, element, param) {
					var isParamString = typeof param === "string",
						symbol = isParamString ? param : param[0],
						soft = isParamString ? true : param[1],
						regex;
					symbol = symbol.replace( /,/g, "" );
					symbol = soft ? symbol + "]" : symbol + "]?";
					regex = "^[" + symbol + "([1-9]{1}[0-9]{0,2}(\\,[0-9]{3})*(\\.[0-9]{0,2})?|[1-9]{1}[0-9]{0,}(\\.[0-9]{0,2})?|0(\\.[0-9]{0,2})?|(\\.[0-9]{1,2})?)$";
					regex = new RegExp(regex);
					return this.optional(element) || regex.test(value);
				}, "Please use a valid currency format");

				// Validate method for file extensions
				$.validator.addMethod( "extension", function(value, element, param) {
					param = typeof param === "string" ? param.replace( /,/g, "|" ) : "png|jpe?g|gif";
					return this.optional(element) || value.match( new RegExp( "\\.(" + param + ")$", "i" ) );
				}, $.validator.format("File type is not allowed") );

				// Validate method for file size
				// @link https://github.com/jzaefferer/jquery-validation/pull/1512
				$.validator.addMethod("maxsize", function(value, element, param) {
					var maxSize = param,
						optionalValue = this.optional(element),
						i, len, file;
					if (optionalValue) {
						return optionalValue;
					}
					if (element.files && element.files.length) {
						i = 0;
						len = element.files.length;
						for (; i < len; i++) {
							file = element.files[i];
							if (file.size > maxSize) {
								return false;
							}
						}
					}
					return true;
				}, $.validator.format("File exceeds max size allowed"));

				// Finally load jQuery Validation library for our forms
				$('.wpforms-validate').each(function() {
					var form   = $(this),
						formID = form.data('formid');

					if (typeof window['wpforms_'+formID] != "undefined" && window['wpforms_'+id].hasOwnProperty('validate')) {	
						properties = window['wpforms_'+id].validate;
					} else if ( typeof wpforms_validate != "undefined") {
						properties = wpforms_validate;
					} else {
						properties = {
							errorClass: 'wpforms-error',
							validClass: 'wpforms-valid',
							errorPlacement: function(error, element) {
								if (element.attr('type') == 'radio' || element.attr('type') == 'checkbox' ) {
									element.parent().parent().parent().append(error);
								} else {
									error.insertAfter(element);
								}
							}
						}
					}
					form.validate( properties );
				});
			}
		},

		/**
		 * Load jQuery Date Picker.
		 *
		 * @since 1.2.3
		 */
		loadDatePicker: function() {

			// Only load if jQuery datepicker library exists
			if (typeof $.fn.pickadate !== 'undefined') { 
				$('.wpforms-datepicker').each(function() {
					var element = $(this),
						form    = element.closest('.wpforms-form'),
						formID  = form.data('formid');

					if (typeof window['wpforms_'+formID] != "undefined" && window['wpforms_'+id].hasOwnProperty('pickadate') ) {	
						properties = window['wpforms_'+id].pickadate;
					} else if ( typeof wpforms_pickadate != "undefined") {
						properties = wpforms_pickadate;
					} else {
						properties = {
							today: false,
							clear: false,
							close: false,
							format: element.data('format')
						}
					}
					element.pickadate(properties)
				});
			};
		},

		/**
		 * Load jQuery Time Picker.
		 *
		 * @since 1.2.3
		 */
		loadTimePicker: function() {

			// Only load if jQuery timepicker library exists
			if (typeof $.fn.pickatime !== 'undefined') { 
				$('.wpforms-timepicker').each(function() {
					var element = $(this),
						form    = element.closest('.wpforms-form'),
						formID  = form.data('formid');

					if (typeof window['wpforms_'+formID] != "undefined" && window['wpforms_'+id].hasOwnProperty('pickatime') ) {	
						properties = window['wpforms_'+id].pickadate;
					} else if ( typeof wpforms_pickatime != "undefined") {
						properties = wpforms_pickatime;
					} else {
						properties = {
							clear: false,
							format: element.data('format'),
							interval: element.data('interval')		
						}
					}
					element.pickatime(properties);
				});
			}
		},

		/**
		 * Load jQuery input masks.
		 *
		 * @since 1.2.3
		 */
		loadInputMask: function() {

			// Only load if jQuery input mask library exists
			if (typeof $.fn.inputmask !== 'undefined') { 
				$('.wpforms-masked-input').inputmask();
			};
		},

		/**
		 * Payments: Load credit card validation.
		 *
		 * @since 1.2.3
		 */
		loadCreditCardValidation: function() {

			// Only load if jQuery payment library exists
			if(typeof $.fn.payment !== 'undefined') { 
				$('.wpforms-field-credit-card-cardnumber').payment('formatCardNumber');
				$('.wpforms-field-credit-card-cardcvc').payment('formatCardCVC');
			};
		},

		//--------------------------------------------------------------------//
		// Binds
		//--------------------------------------------------------------------//

		/**
		 * Element bindings.
		 *
		 * @since 1.2.3
		 */
		bindUIActions: function() {

			// Pagebreak navigation
			$(document).on('click', '.wpforms-page-button', function(event) {
				event.preventDefault();
				WPForms.pagebreakNav($(this));
			});

			// Payments: Update Total field(s) when latest calculation.
			$(document).on('change input', '.wpforms-payment-price', function(event) {
				WPForms.calculateTotalUpdate(this);
			});

			// OptinMonster: initialize again after OM is finished.
			// This is to accomodate moving the form in the DOM.
			$(document).on('OptinMonsterAfterInject', function(event) {
				WPForms.ready();
			});
		},


		pagebreakNav: function(el) {

			var $this      = $(el),
				valid      = true,
				action     = $this.data('action'),
				page       = $this.data('page'),
				page2      = page;
				next       = page+1,
				prev       = page-1,
				formID     = $this.data('formid'),
				$form      = $this.closest('.wpforms-form'),
				$page      = $form.find('.wpforms-page-'+page),
				$submit    = $form.find('.wpforms-submit-container');
				$indicator = $form.find('.wpforms-page-indicator');

			// Toggling between pages
			if ( action == 'next' ){
				// Validate
				if (typeof $.fn.validate !== 'undefined') { 
					$page.find('input.wpforms-field-required, select.wpforms-field-required, textarea.wpforms-field-required, .wpforms-field-required input').each(function(index, el) {
						var field = $(el);
						if ( field.valid() ) {
						} else {
							valid = false;
						}
					});
					// Scroll to first/top error on page
					var $topError = $page.find('.wpforms-error').first();
					if ($topError.length) {
						$('html, body').animate({
							scrollTop: $topError.offset().top-75
						}, 750, function() {
							$topError.focus();
						});
					}
				}
				// Move to next page
				if (valid) {
					page2 = next;
					$page.hide();
					var $nextPage = $form.find('.wpforms-page-'+next);
					$nextPage.show();
					if ( $nextPage.hasClass('last') ) {
						$submit.show();
					}
					// Scroll to top of the form
					$('html, body').animate({
						scrollTop: $form.offset().top-75
					}, 1000);
				}
			} else if ( action == 'prev' ) {
				// Move to prev page
				page2 = prev;
				$page.hide();
				$form.find('.wpforms-page-'+prev).show();
				$submit.hide();
				// Scroll to top of the form
				$('html, body').animate({
					scrollTop: $form.offset().top-75
				}, 1000);
			}

			if ( $indicator ) {
				var theme = $indicator.data('indicator'),
					color = $indicator.data('indicator-color');
				if ('connector' === theme || 'circles' === theme) {
					$indicator.find('.wpforms-page-indicator-page').removeClass('active');
					$indicator.find('.wpforms-page-indicator-page-'+page2).addClass('active');
					$indicator.find('.wpforms-page-indicator-page-number').removeAttr('style');
					$indicator.find('.active .wpforms-page-indicator-page-number').css('background-color', color);
					if ( 'connector' == theme) {
						$indicator.find('.wpforms-page-indicator-page-triangle').removeAttr('style');
						$indicator.find('.active .wpforms-page-indicator-page-triangle').css('border-top-color', color);
					}
				} else if ('progress' === theme) {
					var $pageTitle = $indicator.find('.wpforms-page-indicator-page-title'),
						$pageSep   = $indicator.find('.wpforms-page-indicator-page-title-sep'),
						totalPages = ($('.wpforms-page').length),
						width = (page2/totalPages)*100;
					$indicator.find('.wpforms-page-indicator-page-progress').css('width', width+'%');
					$indicator.find('.wpforms-page-indicator-steps-current').text(page2);
					if ($pageTitle.data('page-'+page2+'-title')) {
						$pageTitle.css('display','inline').text($pageTitle.data('page-'+page2+'-title'));
						$pageSep.css('display','inline');
					} else {
						$pageTitle.css('display','none');
						$pageSep.css('display','none');
					}
				}
			}
		},

		//--------------------------------------------------------------------//
		// Other functions
		//--------------------------------------------------------------------//

		/**
		 * Payments: Calculate total.
		 *
		 * @since 1.2.3
		 */
		calculateTotal: function(el) {

			var $form = $(el),
				total = 0.00;
			$('.wpforms-payment-price').each(function(index, el) {
				var amount = 0,
					$this  = $(this);
				if ($this.attr('type') === 'text') {
					amount = $this.val();
				} else if ($this.attr('type') === 'radio' && $this.is(':checked')) {
					amount = $this.data('amount');
				}
				if (amount != 0) {
					amount = amount.replace(/[^0-9.]/gi,'');
					amount = parseFloat(amount).toFixed(2).replace(/(\d)(?=(\d{6})+\.)/g, "$1,");
					total  = parseFloat(total)+parseFloat(amount);
				}
			});
			return parseFloat(total).toFixed(2);
		},

		/**
		 * Payments: Update Total field(s) with latest calculation.
		 *
		 * @since 1.2.3
		 */
		calculateTotalUpdate: function(el) {

			var $form = $(el).closest('.wpforms-form'),
				total = WPForms.calculateTotal($form);
			if (isNaN(total)) {
				total = '0.00';
			}
			$form.find('.wpforms-payment-total').each(function(index, el) {
				if ($(this).attr('type') == 'hidden') {
					$(this).val('$'+total);
				} else {
					$(this).text('$'+total);
				}
			});
		}
	}

	WPForms.init();

	window.wpforms = WPForms;

})(jQuery);