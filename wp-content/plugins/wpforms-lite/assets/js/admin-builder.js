;(function($) {

	var s;

	var WPFormsBuilder = {

		settings: {
			spinner: '<i class="fa fa-spinner fa-spin"></i>',
			pagebreakTop: false,
			pagebreakBottom: false
		},

		/**
		 * Start the engine.
		 *
		 * @since 1.0.0
		 */
		init: function() {

			wpforms_panel_switch = true;
			s = this.settings;

			// Document ready
			$(document).ready(WPFormsBuilder.ready);

			// Page load
			$(window).on('load', WPFormsBuilder.load);

			WPFormsBuilder.bindUIActions();
		},

		/**
		 * Page load.
		 *
		 * @since 1.0.0
		 */
		load: function() {

			// Remove Loading overlay
			$('#wpforms-builder-overlay').fadeOut();

			// Maybe display informational informational modal
			if ( wpforms_builder.template_modal_display == '1' && 'fields' == wpf.getQueryString('view') ) {
				$.alert({
					title: wpforms_builder.template_modal_title,
					content: wpforms_builder.template_modal_msg
				})
			}
		},

		/**
		 * Document ready.
		 *
		 * @since 1.0.0
		 */
		ready: function() {

			// Trigger initial save for new forms
			var newForm = wpf.getQueryString('newform');
			if (newForm) {
				WPFormsBuilder.formSave(false);
			}

			// Setup/cache some vars not available before
			s.formID          = $('#wpforms-builder-form').data('id');
			s.formData        = $('#wpforms-builder-form').serializeObject();
			s.pagebreakTop    = $('.wpforms-pagebreak-top').length;
			s.pagebreakBottom = $('.wpforms-pagebreak-bottom').length;
			
			wpforms_builder.saved_state = $('#wpforms-builder-form').serializeJSON();
			
			// If there is a section configured, display it. Otherwise
			// we show the first panel by default.
			$('.wpforms-panel').each(function(index, el) {
				var $this       = $(this);
					$configured = $this.find('.wpforms-panel-sidebar-section.configured').first();

				if ( $configured.length ) {
					var section = $configured.data('section');
					$configured.addClass('active').find('.wpforms-toggle-arrow').toggleClass('fa-angle-down fa-angle-right');
					$this.find('.wpforms-panel-content-section-'+section).show().addClass('active');
				} else {
					$this.find('.wpforms-panel-content-section:first-of-type').show().addClass('active');
					$this.find('.wpforms-panel-sidebar-section:first-of-type').addClass('active').find('.wpforms-toggle-arrow').toggleClass('fa-angle-down fa-angle-right');
				}
			});

			// Drag and drop sortable elements
			WPFormsBuilder.fieldSortable();
			WPFormsBuilder.fieldChoiceSortable('select');
			WPFormsBuilder.fieldChoiceSortable('radio');
			WPFormsBuilder.fieldChoiceSortable('checkbox');
			WPFormsBuilder.fieldChoiceSortable('payment-multiple');

			// Load match heights
			$('.wpforms-template').matchHeight({
				property: 'min-height'
			});

			// Set field group visibility
			$('.wpforms-add-fields-group').each(function(index, el) {
				WPFormsBuilder.fieldGroupToggle($(this),'load');
			});

			// Trim long form titles
			WPFormsBuilder.trimFormTitle();

			// Load Tooltips
			WPFormsBuilder.loadTooltips();

			// Load Tooltips
			WPFormsBuilder.loadColorPickers();

			// Hide/Show reCAPTCHA in form
			WPFormsBuilder.recaptchaToggle();

			// Hide/Show title area
			WPFormsBuilder.titleAreaToggle();

			// Confirmation settings
			WPFormsBuilder.confirmationToggle();

			// Notification settings
			WPFormsBuilder.notificationToggle();

			// Secret preview hotkey
			WPFormsBuilder.previewHotkey();

			// Clone form title to setup page
			$('#wpforms-setup-name').val($('#wpforms-panel-field-settings-form_title').val());
		
			// jquery-confirmd defaults
			jconfirm.defaults = {
				confirmButton: wpforms_builder.ok,
				cancelButton: wpforms_builder.cancel,
				confirmButtonClass: 'confirm',
				cancelButtonClass: 'cancel',
				keyboardEnabled: true,
				closeIcon: true
			};
		},

		/**
		 * Element bindings.
		 *
		 * @since 1.0.0
		 */
		bindUIActions: function() {
			
			// General Panels
			WPFormsBuilder.bindUIActionsPanels();

			// Setup Panel
			WPFormsBuilder.bindUIActionsSetup();

			// Fields Panel
			WPFormsBuilder.bindUIActionsFields();

			// Settings Panel
			WPFormsBuilder.bindUIActionsSettings();

			// Save and Exit
			WPFormsBuilder.bindUIActionsSaveExit();

			// General/ global
			WPFormsBuilder.bindUIActionsGeneral();
		},

		//--------------------------------------------------------------------//
		// General Panels
		//--------------------------------------------------------------------//

		/**
		 * Element bindings for general panel tasks.
		 *
		 * @since 1.0.0
		 */
		bindUIActionsPanels: function() {

			// Toggle Smart Tags
			$(document).on('click', '.toggle-smart-tag-display', function(e) {
				e.preventDefault();
				WPFormsBuilder.smartTagToggle(this);
			});

			$(document).on('click', '.smart-tags-list-display a', function(e) {
				e.preventDefault();
				WPFormsBuilder.smartTagInsert(this);
			});

			// Panel switching
			$(document).on('click', '#wpforms-panels-toggle button, .wpforms-panel-switch', function(e) {
				e.preventDefault();
				WPFormsBuilder.panelSwitch($(this).data('panel'));
			});

			// Panel sections switching
			$(document).on('click', '.wpforms-panel .wpforms-panel-sidebar-section', function(e) {
				WPFormsBuilder.panelSectionSwitch(this, e);
			});
		},

		/**
		 * Smart Tag toggling.
		 *
		 * @since 1.0.1
		 */
		smartTagToggle: function(el) {

			var $this   = $(el),
				$label  = $this.closest('label');

			if ( $this.hasClass('smart-tag-showing') ) {

				// Smart tags are showing, so hide/remove them
				var $list = $label.next('.smart-tags-list-display');
				$list.slideUp(400, function() {
					$list.remove();
				});
				$this.find('span').text(wpforms_builder.smart_tags_show);
			} else {

				// Show all fields or narrow to specific field types
				var allowed = $this.data('fields'),
					type    = $this.data('type');
				if ( allowed.length ) {
					var fields = wpf.getFields(allowed.split(','));
				} else {
					var fields = wpf.getFields();
				}

				// Create smart tags list
				var smartTagList = '<ul class="smart-tags-list-display">';
				
				if (type === 'fields' || type === 'all') {
					if (!fields) {
						smartTagList += '<li class="heading">'+wpforms_builder.fields_unavailable+'</li>';
					} else {
						smartTagList += '<li class="heading">'+wpforms_builder.fields_available+'</li>';
						for(var key in fields) {
							if (fields[key].label) {
								var label = wpf.sanitizeString(fields[key].label);
							} else {
								var label = wpforms_builder.field+' #'+fields[key].id;
							}
							smartTagList += '<li><a href="#" data-type="field" data-meta=\'' + fields[key].id + '\'>'+label+'</a></li>';
						}
					}
				}

				if (type === 'other' || type === 'all') {
					smartTagList += '<li class="heading">'+wpforms_builder.other+'</li>';
					for(var key in wpforms_builder.smart_tags) {
						smartTagList += '<li><a href="#" data-type="other" data-meta=\'' + key+ '\'>'+wpforms_builder.smart_tags[key]+'</a></li>';
					}
				}

				smartTagList += '</ul>';

				$label.after(smartTagList);
				$label.next('.smart-tags-list-display').slideDown();
				$this.find('span').text(wpforms_builder.smart_tags_hide);
			}

			$this.toggleClass('smart-tag-showing');
		},

		/**
		 * Smart Tag insert.
		 *
		 * @since 1.0.1
		 */
		smartTagInsert: function(el) {

			var $this   = $(el),
				$list   = $this.closest('.smart-tags-list-display'),
				$parent = $list.parent(),
				$label  = $parent.find('label'),
				$input  = $parent.find('input[type=text]'),
				meta    = $this.data('meta'),
				type    = $this.data('type');

			if ( ! $input.length ) {
				$input  = $parent.find('textarea');
			}

			// insert smart tag
			if ( type === 'field' ) {
				$input.insertAtCaret('{field_id="'+meta+'"}');
			} else {
				$input.insertAtCaret('{'+meta+'}');
			}
			
			// remove list, all done!
			$list.slideUp(400, function() {
				$list.remove();
			});

			$label.find('.toggle-smart-tag-display span').text(wpforms_builder.smart_tags_show);
		},

		/**
		 * Switch Panels.
		 *
		 * @since 1.0.0
		 */
		panelSwitch: function(panel) {

			var $panel    = $('#wpforms-panel-'+panel),
				$panelBtn = $('.wpforms-panel-'+panel+'-button');

			if (!$panel.hasClass('active')) {
				
				$(document).trigger('wpformsPanelSwitch', panel);
				
				if (!wpforms_panel_switch) {
					return false;
				}

				$('#wpforms-panels-toggle').find('button').removeClass('active');
				$('.wpforms-panel').removeClass('active');
				$panelBtn.addClass('active');
				$panel.addClass('active');

				history.replaceState({}, null, wpf.updateQueryString('view', panel));
			}
		},

		/**
		 * Switch Panel section.
		 *
		 * @since 1.0.0
		 */
		panelSectionSwitch: function(el, e) {
			e.preventDefault();

			var $this           = $(el),
				$panel          = $this.parent().parent(),
				section         = $this.data('section'),
				$sectionButtons = $panel.find('.wpforms-panel-sidebar-section'),
				$sectionButton  = $panel.find('.wpforms-panel-sidebar-section-'+section);

			if ( ! $sectionButton.hasClass('active') ) {
				$sectionButtons.removeClass('active');
				$sectionButtons.find('.wpforms-toggle-arrow').removeClass('fa-angle-down').addClass('fa-angle-right');
				$sectionButton.addClass('active');
				$sectionButton.find('.wpforms-toggle-arrow').toggleClass('fa-angle-right fa-angle-down');
				$panel.find('.wpforms-panel-content-section').hide();
				$panel.find('.wpforms-panel-content-section-'+section).show();
			}
		},

		//--------------------------------------------------------------------//
		// Setup Panel
		//--------------------------------------------------------------------//

		/**
		 * Element bindings for Setup panel.
		 *
		 * @since 1.0.0
		 */
		bindUIActionsSetup: function() {

			// Focus on the form title field when displaying setup panel
			$(window).load(function(e) {
				WPFormsBuilder.setupTitleFocus(e, wpf.getQueryString('view'));
			});
			$(document).on('wpformsPanelSwitch', WPFormsBuilder.setupTitleFocus);
			
			// Select and apply a template
			$(document).on('click', '.wpforms-template-select', function(e) {
				WPFormsBuilder.templateSelect(this, e);
			});

			// "Blank form" text should trigger template selection
			$(document).on('click', '.wpforms-trigger-blank', function(e) {
				e.preventDefault();
				$('#wpforms-template-blank .wpforms-template-select').trigger('click');
			});	

			// Keep Setup title and settings title instances the same
			$(document).on('input', '#wpforms-panel-field-settings-form_title', function() {
				$('#wpforms-setup-name').val($('#wpforms-panel-field-settings-form_title').val());
			});	
			$(document).on('input', '#wpforms-setup-name', function() {
				$('#wpforms-panel-field-settings-form_title').val($('#wpforms-setup-name').val()).trigger('input');
			});			
		},

		/**
		 * Force focus on the form title field when the Setup panel is displaying.
		 *
		 * @since 1.0.0
		 */
		setupTitleFocus: function(e, view) {

			if (typeof view !== 'undefined' && view == 'setup') {
				setTimeout(function (){
					$('#wpforms-setup-name').focus();
				}, 100);
			}
		},

		/**
		 * Select template.
		 *
		 * @since 1.0.0
		 */
		templateSelect: function(el, e) {
			e.preventDefault();

			var $this         = $(el),
				$parent       = $this.parent().parent();
				$formName     = $('#wpforms-setup-name'),
				$templateBtns = $('.wpforms-template-select'),
				formName      = '',
				labelOriginal = $this.html();
				template      = $this.data('template'),
				templateName  = $this.data('template-name-raw'),
				title         = '',
				action        = '';

			// Don't do anything for selects that trigger modal
			if ($parent.hasClass('pro-modal')){
				return;
			}
				
			// Disable all template buttons
			$templateBtns.prop('disabled', true);

			// Display loading indicator
			$this.html(s.spinner+' '+ wpforms_builder.loading);

			// This is an existing form
			if (s.formID) {

				$.confirm({
					title: false,
					content: wpforms_builder.template_confirm,
					backgroundDismiss: false,
					closeIcon: false,
					confirm: function(){

						// Ajax update form
						var data = {
							title   : $formName.val(),
							action  : 'wpforms_update_form_template',
							template: template,
							form_id : s.formID,
							nonce   : wpforms_builder.nonce
						}
						$.post(wpforms_builder.ajax_url, data, function(res) {
							if (res.success){
								window.location.href = res.data.redirect;
							} else {
								console.log(res);
							}
						}).fail(function(xhr, textStatus, e) {
							console.log(xhr.responseText);
						});
					},
					cancel: function(){
						$templateBtns.prop('disabled', false);
						$this.html(labelOriginal);
					}
				});	

			// This is a new form
			} else {

				// Check that form title is provided
				if (!$formName.val()) {
					formName = templateName;
				} else {
					formName = $formName.val();
				}

				// Ajax create new form
				var data = {
					title   : formName,
					action  : 'wpforms_new_form',
					template: template,
					form_id : s.formID,
					nonce   : wpforms_builder.nonce
				}
				$.post(wpforms_builder.ajax_url, data, function(res) {
					if (res.success){
						window.location.href = res.data.redirect;
					} else {
						console.log(res);
					}
				}).fail(function(xhr, textStatus, e) {
					console.log(xhr.responseText);
				});
			}
		},


		//--------------------------------------------------------------------//
		// Fields Panel
		//--------------------------------------------------------------------//

		/**
		 * Element bindings for Fields panel.
		 *
		 * @since 1.0.0
		 */
		bindUIActionsFields: function() {
			
			// Field sidebar tab toggle
			$(document).on('click', '.wpforms-tab a', function(e) {
				e.preventDefault();
				WPFormsBuilder.fieldTabToggle($(this).parent().attr('id'));
			});

			// Field sidebar group toggle
			$(document).on('click', '.wpforms-add-fields-heading', function(e) {
				e.preventDefault();
				WPFormsBuilder.fieldGroupToggle($(this), 'click');
			});

			// Form field preview clicking
			$(document).on('click', '.wpforms-field', function(e) {
				WPFormsBuilder.fieldTabToggle($(this).data('field-id'));
			});

			// Field delete
			$(document).on('click', '.wpforms-field-delete', function(e) {
				e.preventDefault();
				e.stopPropagation();
				WPFormsBuilder.fieldDelete($(this).parent().data('field-id'));
			});

			// Field add
			$(document).on('click', '.wpforms-add-fields-button', function(e) {
				e.preventDefault();
				WPFormsBuilder.fieldAdd($(this).data('field-type'));
			});

			// New field choices should be sortable
			$(document).on('wpformsFieldAdd', function(event, id, type) {
				if (type == 'select' || type == 'radio'  || type == 'checkbox' || type == 'payment-multiple' ) {
					WPFormsBuilder.fieldChoiceSortable(type,'#wpforms-field-option-row-' + id + '-choices ul');
				}
			 });

			// Field choice add new
			$(document).on('click', '.wpforms-field-option-row-choices .add', function(e) {
				WPFormsBuilder.fieldChoiceAdd(e, $(this));
			});

			// Field choice delete
			$(document).on('click', '.wpforms-field-option-row-choices .remove', function(e) {
				WPFormsBuilder.fieldChoiceDelete(e, $(this));
			});

			// Field choices defaults
			$(document).on('change', '.wpforms-field-option-row-choices input[type=radio]', function(e) {
				var $this = $(this), 
					list  = $this.parent().parent();
				$this.parent().parent().find('input[type=radio]').not(this).prop('checked',false);
				WPFormsBuilder.fieldChoiceUpdate(list.data('field-type'),list.data('field-id') );
			});

			// Field choices update preview area
			$(document).on('change', '.wpforms-field-option-row-choices input[type=checkbox]', function(e) {
				var list = $(this).parent().parent();
				WPFormsBuilder.fieldChoiceUpdate(list.data('field-type'),list.data('field-id') );
			});

			// Field choices display value toggle
			$(document).on('change', '.wpforms-field-option-row-show_values input', function(e) {
				$(this).closest('.wpforms-field-option').find('.wpforms-field-option-row-choices ul').toggleClass('show-values');
			});

			// Updates field choices text in almost real time
			$(document).on('focusout', '.wpforms-field-option-row-choices input.label', function(e) {
				var list = $(this).parent().parent();
				WPFormsBuilder.fieldChoiceUpdate(list.data('field-type'),list.data('field-id'));
			});

			// Field Options group toggle
			$(document).on('click', '.wpforms-field-option-group-toggle', function(e) {
				e.preventDefault();
				var $this = $(this);
				$this.parent().toggleClass('wpforms-hide').find('.wpforms-field-option-group-inner').slideToggle();
				$this.find('i').toggleClass('fa-angle-down fa-angle-right');
			});

			// Field Smart Tags display  toggle
			$(document).on('click', '.wpforms-field-option-row-default_value .toggle-smart-tags', function(e) {
				e.preventDefault();
				var $this = $(this);
				$this.toggleClass('smart-tags-hide');
				$this.parent().next('.smart-tags-list').slideToggle();

				if ( $this.hasClass('smart-tags-hide')) {
					$this.find('span').text(wpforms_builder.smart_tags_hide);
				} else {
					$this.find('span').text(wpforms_builder.smart_tags_show);
				}
			});

			// "Default" Field Smart Tag insert
			$(document).on('click', '.wpforms-field-option-row-default_value .smart-tags-list a', function(e) {
				e.preventDefault();
				var $this = $(this),
 					tag   = $this.data('value'),
					field = $this.parent().parent().next('input[type=text]');
				field.val(field.val()+'{'+tag+'}');
			});

			// Display toggle for Address field hide address line 2 option
			$(document).on('change', '.wpforms-field-option-address .format-selected input.hide', function(e) {
				var $this    = $(this),
					id       = $this.parent().parent().data('field-id'),
					subfield = $this.parent().parent().data('subfield');
				$('#wpforms-field-'+id).find('.wpforms-'+subfield).toggleClass('wpforms-hide');
			});

			// Real-time updates for "Show Label" field option
			$(document).on('input', '.wpforms-field-option-row-label input', function(e) {
				var $this = $(this), 
					value = $this.val(),
					id    = $this.parent().data('field-id');
				$('#wpforms-field-'+id).find('.label-title .text').text(value);
			});

			// Real-time updates for "Description" field option
			$(document).on('input', '.wpforms-field-option-row-description textarea', function(e) {
				var $this = $(this), 
					value = $this.val(),
					id    = $this.parent().data('field-id');
				$('#wpforms-field-'+id).find('.description').html(value);
			});

			// Real-time updates for "Required" field option
			$(document).on('change', '.wpforms-field-option-row-required input', function(e) {
				var id = $(this).parent().data('field-id');
				$('#wpforms-field-'+id).toggleClass('required');
			});

			// Real-time updates for "Size" field option
			$(document).on('change', '.wpforms-field-option-row-size select', function(e) {
				var $this = $(this), 
					value = $this.val(),
					id    = $this.parent().data('field-id');
				$('#wpforms-field-'+id).removeClass('size-small size-medium size-large').addClass('size-'+value);
			});

			// Real-time updates for "Placeholder" field option
			$(document).on('input', '.wpforms-field-option-row-placeholder input', function(e) {
				var $this = $(this), 
					value = $this.val(),
					id    = $this.parent().data('field-id');
				$('#wpforms-field-'+id).find('.primary-input').attr('placeholder', value);
			});

			// Real-time updates for "Hide Label" field option
			$(document).on('change', '.wpforms-field-option-row-label_hide input', function(e) {
				var id = $(this).parent().data('field-id');
				$('#wpforms-field-'+id).toggleClass('label_hide');
			});

			// Real-time updates for Sub Label visbility field option
			$(document).on('change', '.wpforms-field-option-row-sublabel_hide input', function(e) {
				var id = $(this).parent().data('field-id');
				$('#wpforms-field-'+id).toggleClass('sublabel_hide');
			});

			// Real-time updates for Name field "Format" option
			$(document).on('change', '.wpforms-field-option-row-format select', function(e) {
				var $this = $(this),
					value = $this.val(),
					id    = $this.parent().data('field-id');
				$('#wpforms-field-'+id).find('.format-selected').removeClass().addClass('format-selected format-selected-'+value);
				$('#wpforms-field-option-'+id).find('.format-selected').removeClass().addClass('format-selected format-selected-'+value);
			})

			// Real-time updates for Address, Date/Time, and Name "Placeholder" field options
			$(document).on('input', '.wpforms-field-option .format-selected input.placeholder', function(e) {
				var $this    = $(this),
					value    = $this.val(),
					id       = $this.parent().parent().data('field-id'),
					subfield = $this.parent().parent().data('subfield');
				$('#wpforms-field-'+id).find('.wpforms-'+ subfield+' input' ).attr('placeholder', value);
			});

			// Consider the field active when a disabled nav button is clicked
			$(document).on('click', '.wpforms-pagebreak-button', function(e) {
				e.preventDefault();
				$(this).closest('.wpforms-field').trigger('click');
			});

			// Real-time updates for "Next" and "Prev" pagebreak field option
			$(document).on('input', '.wpforms-field-option-row-next input', function(e) {
				var $this = $(this), 
					value = $this.val(),
					id    = $this.parent().data('field-id');
				if (value) {
					$('#wpforms-field-'+id).find('.wpforms-pagebreak-next').css('display','inline-block').text(value);
				} else {
					$('#wpforms-field-'+id).find('.wpforms-pagebreak-next').css('display','none').empty();
				}
			});
			$(document).on('input', '.wpforms-field-option-row-prev input', function(e) {
				var $this = $(this), 
					value = $this.val(),
					id    = $this.parent().data('field-id');
				if (value) {
					$('#wpforms-field-'+id).find('.wpforms-pagebreak-prev').css('display','inline-block').text(value);
				} else {
					$('#wpforms-field-'+id).find('.wpforms-pagebreak-prev').css('display','none').empty();
				}
			});

			// Real-time updates for "Page Title" pagebreak field option
			$(document).on('input', '.wpforms-field-option-row-title input', function(e) {
				var $this = $(this), 
					value = $this.val(),
					id    = $this.parent().data('field-id');
				if (value) {
					$('#wpforms-field-'+id).find('.wpforms-pagebreak-title').text('('+value+')');
				} else {
					$('#wpforms-field-'+id).find('.wpforms-pagebreak-title').empty();
				}
			});

			// Real-time updates for "Page Navigation Alignment" pagebreak field option
			$(document).on('change', '.wpforms-field-option-row-nav_align select', function(e) {
				var $this = $(this), 
					value = $this.val();

				if (!value) {
					value = 'center';
				}

				$('.wpforms-pagebreak-buttons').removeClass('wpforms-pagebreak-buttons-center wpforms-pagebreak-buttons-left wpforms-pagebreak-buttons-right wpforms-pagebreak-buttons-split').addClass('wpforms-pagebreak-buttons-'+value);
			});

			// Real-time updates for "Display Previous" pagebreak field option
			$(document).on('change', '.wpforms-field-option-row-prev_toggle input', function(e) {
				var $this      = $(this),
					$group     = $this.closest('.wpforms-field-option-group-inner'),
					$prev      = $group.find('.wpforms-field-option-row-prev'),
					$prevLabel = $prev.find('input');

				$prev.toggleClass('wpforms-hidden');

				if ( $(this).prop('checked') && !$prevLabel.val() ) {
					$prevLabel.val(wpforms_builder.previous);
				} else {
					$prevLabel.val('');
				}
				$prevLabel.trigger('input');
			});

			// Real-time updates for Single Item field "Item Price" option
			$(document).on('input', '.wpforms-field-option-row-price input', function(e) {
				var $this = $(this), 
					value = $this.val(),
					id    = $this.parent().data('field-id');
				$('#wpforms-field-'+id).find('.price').text(value);
			});

			// Real-time updates for payment CC icons
			$(document).on('change', '.wpforms-field-option-credit-card .payment-icons input', function(e) {
				var $this = $(this), 
					card  = $this.data('card')
					id    = $this.parent().data('field-id');
					console.log( card + ' - ' + id );
				$('#wpforms-field-'+id).find('img.icon-'+card).toggleClass('card_hide');
			});

			// Generic updates for various additional placeholder fields
			$(document).on('input', '.wpforms-field-option input.placeholder-update', function(e) {
				var $this    = $(this),
					value    = $this.val(),
					id       = $this.data('field-id'),
					subfield = $this.data('subfield');
				$('#wpforms-field-'+id).find('.wpforms-'+ subfield+' input' ).attr('placeholder', value);
			});

			// Toggle Choice Layout advanced field option
			$(document).on('change', '.wpforms-field-option-row-input_columns select', function(e) {
				var $this    = $(this),
					value    = $this.val(),
					cls      = '',
					id       = $this.parent().data('field-id');
				if ( value === '2' ) {
					cls = 'wpforms-list-2-columns';
				} else if ( value === '3' ) {
					cls = 'wpforms-list-3-columns';
				}
				$('#wpforms-field-'+id).removeClass('wpforms-list-2-columns wpforms-list-3-columns').addClass(cls);
			});

			// Toggle the toggle field
			$(document).on('click', '.wpforms-field-option-row .wpforms-toggle-icon', function(e) {
				var $this  = $(this),
					$check = $this.find('input[type=checkbox]'),
					$label = $this.find('.wpforms-toggle-icon-label');

				$this.toggleClass('wpforms-off wpforms-on');
				$this.find('i').toggleClass('fa-toggle-off fa-toggle-on');
				
				if ($this.hasClass('wpforms-on')) {
					$label.text(wpforms_builder.on);
					$check.prop('checked', true);
				} else {
					$label.text(wpforms_builder.off);
					$check.prop('checked', false);
				}
				$check.trigger('change');
			});

			// Watch for pagebreak field being added and deleted
			$(document).on('wpformsFieldAdd', WPFormsBuilder.fieldPagebreakAdd);
			$(document).on('wpformsFieldDelete', WPFormsBuilder.fieldPagebreakDelete);
		},

		/**
		 * Toggle field group visibility in the field sidebar.
		 *
		 * @since 1.0.0
		 */
		fieldGroupToggle: function(el, action) {
			
			if ( 'click' == action ) {

				var $this      = $(el),
					$buttons   = $this.next('.wpforms-add-fields-buttons'),
					$group     = $buttons.parent(),
					$icon      = $this.find('i'),
					groupName  = $this.data('group'),
					cookieName = 'wpforms_field_group_'+groupName;

				if ($group.hasClass('wpforms-hide')) {
					wpCookies.remove(cookieName);
				} else {
					wpCookies.set(cookieName,'true',2592000); // 1 month
				}
				$icon.toggleClass('fa-angle-down fa-angle-right');
				$buttons.slideToggle();
				$group.toggleClass('wpforms-hide');

			} else if ( 'load' == action ) {

				var $this      = $(el),
					$buttons   = $this.find('.wpforms-add-fields-buttons'),
					$icon      = $this.find('.wpforms-add-fields-heading i'),
					groupName  = $this.find('.wpforms-add-fields-heading').data('group'),
					cookieName = 'wpforms_field_group_'+groupName;

				if (wpCookies.get(cookieName) == 'true') {
					$icon.toggleClass('fa-angle-down fa-angle-right');
					$buttons.hide();
					$this.toggleClass('wpforms-hide');
				}
			}
		},

		/**
		 * Delete field
		 *
		 * @since 1.0.0
		 */
		fieldDelete: function(id) {

			var $field = $('#wpforms-field-'+id),
				type   = $field.data('field-type');

			if ($field.hasClass('no-delete')) {
				$.alert({
					title: wpforms_builder.field_locked,
					content: wpforms_builder.field_locked_msg,
					confirmButton: wpforms_builder.close
				});	
			} else {
				$.confirm({
					title: false,
					content: wpforms_builder.delete_confirm,
					backgroundDismiss: false,
					closeIcon: false,
					confirm: function(){
						$('#wpforms-field-'+id).fadeOut(400, function(){
							$(this).remove();
							$('#wpforms-field-option-'+id).remove();
							$('.wpforms-field, .wpforms-title-desc').removeClass('active');
							WPFormsBuilder.fieldTabToggle('add-fields');
							$(document).trigger('wpformsFieldDelete', [id, type ]);
						});
					}
				});	
			}
		},

		/**
		 * Add new field.
		 *
		 * @since 1.0.0
		 */
		fieldAdd: function(type, options) {

			var defaults = {
				position   : 'bottom',
				placeholder: false,
				scroll     : true,
				defaults   : false,
			};
			options = $.extend( {}, defaults, options);

			var data = {
				action  : 'wpforms_new_field_'+type,
				id      : s.formID,
				type    : type,
				defaults: options.defaults,
				nonce   : wpforms_builder.nonce
			}
			return $.post(wpforms_builder.ajax_url, data, function(res) {
				if (res.success) {

					var totalFields = $('.wpforms-field').length,
						$preview    = $('#wpforms-panel-fields .wpforms-panel-content-wrap'),
						$lastField  = $('.wpforms-field').last(),
						$newField   = $(res.data.preview),
						$newOptions = $(res.data.options);

					$newField.css('display', 'none');

					if (options.placeholder) {
						options.placeholder.remove();
					}

					// Determine where field gets placed
					if ( 'bottom' === options.position ) {
					
						if ( $lastField.length && $lastField.hasClass('wpforms-field-stick')) {
							// Check to see if the last field we have is configured to
							// be stuck to the bottom, if so add the field above it.
							$('.wpforms-field-wrap').children(':eq('+(totalFields-1)+')').before($newField);
							$('.wpforms-field-options').children(':eq('+(totalFields-1)+')').before($newOptions);
						
						} else {
							// Add field to bottom
							$('.wpforms-field-wrap').append($newField);
							$('.wpforms-field-options').append($newOptions);
						}
						
						if (options.scroll) {
							$preview.animate({ scrollTop: $preview.prop('scrollHeight') - $preview.height() }, 1000);
						}
						
					} else if ( 'top' === options.position ) {
					
						// Add field to top, scroll to
						$('.wpforms-field-wrap').prepend($newField);
						$('.wpforms-field-options').prepend($newOptions);

						if (options.scroll) {
							$preview.animate({ scrollTop: 0 }, 1000);
						}
						
					} else {
				
						if ( options.position === totalFields && $lastField.length && $lastField.hasClass('wpforms-field-stick') ) {
							// Check to see if the user tried to add the field at
							// the end BUT the last field we have is configured to
							// be stuck to the bottom, if so add the field above it.
							$('.wpforms-field-wrap').children(':eq('+(totalFields-1)+')').before($newField);
							$('.wpforms-field-options').children(':eq('+(totalFields-1)+')').before($newOptions);

						} else if ($('.wpforms-field-wrap').children(':eq('+options.position+')').length) {
							// Add field to a specific location
							$('.wpforms-field-wrap').children(':eq('+options.position+')').before($newField);
							$('.wpforms-field-options').children(':eq('+options.position+')').before($newOptions);

						} else {
							// Something's wrong, just add the field. This should never occur.
							$('.wpforms-field-wrap').append($newField);
							$('.wpforms-field-options').append($newOptions);
						}
					}

					$newField.fadeIn();
					
					$('#wpforms-builder-form .no-fields, #wpforms-builder-form .no-fields-preview').remove();
					$('#wpforms-field-id').val(res.data.field.id+1);

					WPFormsBuilder.loadTooltips();
					WPFormsBuilder.loadColorPickers();

					$(document).trigger('wpformsFieldAdd', [res.data.field.id, type ]);
					
				} else {
					console.log(res);
				}
			}).fail(function(xhr, textStatus, e) {
				console.log(xhr.responseText);
			});
		},

		/**
		 * Sortable fields in the builder form preview area.
		 *
		 * @since 1.0.0
		 */
		fieldSortable: function() {

			var fieldOptions = $('.wpforms-field-options'),
				fieldReceived = false,
				fieldIndex,
				fieldIndexNew,
				field,
				fieldNew;
				
			$('.wpforms-field-wrap').sortable({
				items  : '> .wpforms-field:not(.wpforms-field-stick)',
				axis   : 'y',
				delay  : 100,
				opacity: 0.75,
				start:function(e,ui){
					fieldIndex = ui.item.index();
					field      = fieldOptions[0].children[fieldIndex];
				},
				stop:function(e,ui){
					fieldIndexNew = ui.item.index();
					fieldNew      = fieldOptions[0].children[fieldIndexNew];        
					if (fieldIndex < fieldIndexNew){
						$(fieldNew).after(field);
					} else {
						$(fieldNew).before(field);
					}
					$(document).trigger('wpformsFieldMove', ui);
					fieldReceived = false;
				},
				over: function(e, ui){
					var $el = ui.item.first();
					$el.addClass('wpforms-field-dragging');

					if ( $el.hasClass('wpforms-field-drag')){
						var width = $('.wpforms-field').first().outerWidth();
						$el.addClass('wpforms-field-drag-over').removeClass('wpforms-field-drag-out').css('width', width).css('height', 'auto');
					}
				},
				out: function(e, ui){
					var $el   = ui.item.first();
					$el.removeClass('wpforms-field-dragging');

					if ( !fieldReceived ) {
						var width = $el.attr('data-original-width');
						if ( $el.hasClass('wpforms-field-drag')){
							$el.addClass('wpforms-field-drag-out').removeClass('wpforms-field-drag-over').css('width', width);
						}
					}
				},
				receive: function(e, ui) {
					fieldReceived = true;

					var pos  = $(this).data('ui-sortable').currentItem.index();
						$el  = ui.helper,
						type = $el.attr('data-field-type');
					
					$el.addClass('wpforms-field-drag-over wpforms-field-drag-pending').removeClass('wpforms-field-drag-out').css('width', '100%');
					$el.append('<i class="fa fa-cog fa-spin"></i>');

					WPFormsBuilder.fieldAdd(type, {position: pos, placeholder: $el});
   				}
			});

			$('.wpforms-add-fields-button').draggable({
				connectToSortable: '.wpforms-field-wrap',
				delay: 200,
				helper: function(event) {
					var $this = $(this),
						width = $this.outerWidth(),
						text  = $this.html(),
						type  = $this.data('field-type'),
						$el   = $('<div class="wpforms-field-drag-out wpforms-field-drag">');
					return $el.html(text).css('width',width).attr('data-original-width',width).attr('data-field-type',type);
				},
				revert: 'invalid',
				cancel: false,
				scroll: false,
				opacity: 0.75,
				containment: 'document'
			});
		},

		/**
		 * Add new field choice
		 *
		 * @since 1.0.0
		 */
		fieldChoiceAdd: function(e, el) {

			e.preventDefault();

			var $this   = $(el),
				$parent = $this.parent(),
				checked = $parent.find('input.default').is(':checked'),
				fieldID = $this.closest('.wpforms-field-option-row-choices').data('field-id'),
				id      = $parent.parent().attr('data-next-id'),
				type    = $parent.parent().data('field-type'),
				choice  = $parent.clone().insertAfter($parent);

			choice.attr('data-key', id);
			choice.find('input.label').val('').attr('name', 'fields['+fieldID+'][choices]['+id+'][label]');
			choice.find('input.value').val('').attr('name', 'fields['+fieldID+'][choices]['+id+'][value]');
			choice.find('input.default').attr('name', 'fields['+fieldID+'][choices]['+id+'][default]').prop('checked', false);

			if ( checked == true ) {
				$parent.find('input.default').prop('checked', true);
			}
			id++;
			$parent.parent().attr('data-next-id', id);
			$(document).trigger('wpformsFieldChoiceAdd');
			WPFormsBuilder.fieldChoiceUpdate(type, fieldID);
		},

		/**
		 * Delete field choice
		 *
		 * @since 1.0.0
		 */
		fieldChoiceDelete: function(e, el) {

			e.preventDefault();

			var $this = $(el),
				$list = $this.parent().parent(),
				total = $list.find('li').length;

			if (total == '1') {
				$.alert({
					title: false,
					content: wpforms_builder.error_choice
				});	
			} else {
				$this.parent().remove();
				WPFormsBuilder.fieldChoiceUpdate($list.data('field-type'), $list.data('field-id'));
				$(document).trigger('wpformsFieldChoiceDelete');
			}
		},

		/**
		 * Make field choices sortable.
		 *
		 * Currenty used for select, radio, and checkboxes field types
		 *
		 * @since 1.0.0
		 */
		fieldChoiceSortable: function(type, selector) {

			selector = typeof selector !== 'undefined' ? selector : '.wpforms-field-option-'+type+' .wpforms-field-option-row-choices ul';
			
			$(selector).sortable({
				items  : 'li',
				axis   : 'y',
				delay  : 100,
				opacity: 0.6,
				handle : '.move',
				stop:function(e,ui){
					var id = ui.item.parent().data('field-id');
					WPFormsBuilder.fieldChoiceUpdate(type, id);
					$(document).trigger('wpformsFieldChoiceMove', ui);
				},
				update:function(e,ui){
				}
			});
		},

		/**
		 * Update field choices in preview area, for the Fields panel.
		 *
		 * Currenty used for select, radio, and checkboxes field types
		 *
		 * @since 1.0.0
		 */
		fieldChoiceUpdate: function(type, id) {

			var new_choice;
			// Multiple payment choices are radio buttons
			if ( type == 'payment-multiple') {
				type = 'radio';
			}
			if (type == 'select') {
				$('#wpforms-field-'+id+' .primary-input option' ).not('.placeholder').remove();
				new_choice = '<option>{label}</option>';
			} else if (type == 'radio' || type == 'checkbox' ) {
				$('#wpforms-field-'+id+' .primary-input li' ).remove();
				new_choice = '<li><input type="'+type+'" disabled>{label}</li>';
			} 		
			$('#wpforms-field-option-row-' + id + '-choices li').each( function( index ) {
				var $this    = $(this), 
					label    = $this.find('input.label').val(),
					selected = $this.find('input.default').is(':checked'),
					choice 	 = $( new_choice.replace('{label}',label) );
				$('#wpforms-field-'+id+' .primary-input').append(choice);
				if ( selected == true ) {
					switch (type) {
						case 'select':
							choice.prop('selected', 'true');
							break;
						case 'radio':
						case 'checkbox':
							choice.find('input').prop('checked', 'true');
							break;
					} 
				}
			});
		},

		/**
		 * Toggle fields tabs (Add Fields, Field Options.
		 *
		 * @since 1.0.0
		 */
		fieldTabToggle: function(id) {

			$('.wpforms-tab a').removeClass('active').find('i').removeClass('fa-angle-down').addClass('fa-angle-right');
			$('.wpforms-field, .wpforms-title-desc').removeClass('active');

			if (id == 'add-fields') {
				$('#add-fields').find('a').addClass('active').find('i').addClass('fa-angle-down');
				$('.wpforms-field-options').hide();
				$('.wpforms-add-fields').show()
			} else {
				$('#field-options').find('a').addClass('active').find('i').addClass('fa-angle-down');
				if (id == 'field-options') {
					$('.wpforms-field').first().addClass('active');
					id = $('.wpforms-field').first().data('field-id');
				} else {
					$('#wpforms-field-'+id).addClass('active');
				}
				$('.wpforms-field-option').hide();
				$('#wpforms-field-option-'+id).show();
				$('.wpforms-add-fields').hide();
				$('.wpforms-field-options').show();
			}
		},

		/**
		 * Watches fields being added and listens for a pagebreak field.
		 *
		 * If a pagebreak field is added, and it's the first one, then we
		 * automatically add the top and bottom pagebreak elements to the
		 * builder.
		 *
		 * @since 1.2.1
		 */
		fieldPagebreakAdd: function(event, id, type) {

			if ( 'pagebreak' !== type )
				return;

			if ( ! s.pagebreakTop ) {

				s.pagebreakTop = true;
				var options = {
					position: 'top',
					scroll: false,
					defaults: {
						position: 'top',
						nav_align: 'left',
					}
				}
				WPFormsBuilder.fieldAdd('pagebreak', options).done(function(res){
					s.pagebreakTop = res.data.field.id;
					//console.log( 'PB top is ' + res.data.field.id);
					var $preview = $('#wpforms-field-'+res.data.field.id),
						$options = $('#wpforms-field-option-'+res.data.field.id);

					$options.find('.wpforms-field-option-group').addClass('wpforms-pagebreak-top');
					$preview.addClass('wpforms-field-stick wpforms-pagebreak-top');
				});

			} else if ( ! s.pagebreakBottom ) {
				
				s.pagebreakBottom = true;
				var options = {
					position: 'bottom',
					scroll: false,
					defaults: {
						position: 'bottom'
					}
				}
				WPFormsBuilder.fieldAdd('pagebreak', options).done(function(res){
					s.pagebreakBottom = res.data.field.id;
					//console.log( 'PB bottom is ' + res.data.field.id);
					var $preview = $('#wpforms-field-'+res.data.field.id),
						$options = $('#wpforms-field-option-'+res.data.field.id);

					$options.find('.wpforms-field-option-group').addClass('wpforms-pagebreak-bottom');
					$preview.addClass('wpforms-field-stick wpforms-pagebreak-bottom');
				});
			}
		},

		/**
		 * Watches fields being deleted and listens for a pagebreak field.
		 *
		 * If a pagebreak field is added, and it's the first one, then we
		 * automatically add the top and bottom pagebreak elements to the
		 * builder.
		 *
		 * @since 1.2.1
		 */
		fieldPagebreakDelete: function(event, id, type) {

			if ( 'pagebreak' !== type )
				return;

			var pagebreaksRemaining = $('.wpforms-field-pagebreak').not('.wpforms-pagebreak-top, .wpforms-pagebreak-bottom').length;

			// All pagebreaks, excluding top/bottom, are gone so we need to 
			// remove the top and bottom pagebreak
			if ( !pagebreaksRemaining ) {
				var $top     = $('.wpforms-preview-wrap').find('.wpforms-pagebreak-top'),
					topID    = $top.data('field-id'),
					$bottom  = $('.wpforms-preview-wrap').find('.wpforms-pagebreak-bottom'),
					bottomID = $bottom.data('field-id');

					// Remove
					$top.remove();
					$('#wpforms-field-option-'+topID).remove();
					s.pagebreakTop = false;
					$bottom.remove();
					$('#wpforms-field-option-'+bottomID).remove();
					s.pagebreakBottom = false;
			}
		},

		//--------------------------------------------------------------------//
		// Settings Panel
		//--------------------------------------------------------------------//

		/**
		 * Element bindings for Settings panel.
		 *
		 * @since 1.0.0
		 */
		bindUIActionsSettings: function() {
				
			// Clicking form title/desc opens Settings panel
			$(document).on('click', '.wpforms-title-desc, .wpforms-field-submit-button, .wpforms-center-form-name', function(e) {
				e.preventDefault();
				WPFormsBuilder.panelSwitch('settings');
			});

			// Clicking form last page break button
			$(document).on('click', '.wpforms-field-pagebreak-last button', function(e) {
				e.preventDefault();
				WPFormsBuilder.panelSwitch('settings');
				$('#wpforms-panel-field-settings-pagebreak_prev').focus();
			});

			// Real-time updates for editing the form title
			$(document).on('input', '#wpforms-panel-field-settings-pagebreak_prev', function(){
				$('.wpforms-field-pagebreak-last button').text( $(this).val() );
			})

			// Real-time updates for editing the form title
			$(document).on('input', '#wpforms-panel-field-settings-form_title', function(){
				var title = $(this).val();
				if (title.length > 38) {
					title = $.trim(title).substring(0, 38).split(" ").slice(0, -1).join(" ") + "..."
				}
				$('.wpforms-form-name').text( title );
			})

			// Real-time updates for editing the form description
			$(document).on('input', '#wpforms-panel-field-settings-form_desc', function(){
				$('.wpforms-form-desc').text( $(this).val() );
			})

			// Real-time updates for editing the form submit button
			$(document).on('input', '#wpforms-panel-field-settings-submit_text', function(){
				$('.wpforms-field-submit input[type=submit]').val( $(this).val() );
			})

			// Toggle form reCAPTCHA setting
			$(document).on('change', '#wpforms-settings-recaptcha', function(e) {
				WPFormsBuilder.recaptchaToggle();
			});

			// Toggle form title area
			$(document).on('change', '#wpforms-panel-field-settings-hide_title_desc', function(e) {
				WPFormsBuilder.titleAreaToggle();
			});

			// Toggle form confirmation setting fields
			$(document).on('change', '#wpforms-panel-field-settings-confirmation_type', function(e) {
				WPFormsBuilder.confirmationToggle();
			});

			// Toggle form notification setting fields
			$(document).on('change', '#wpforms-panel-field-settings-notification_enable', function(e) {
				WPFormsBuilder.notificationToggle();
			});

			// Add New notification settings block
			$(document).on('click', '.wpforms-notifications-add', function(e) {
				e.preventDefault();
				WPFormsBuilder.notificationAdd();
			});

			// Add New notification settings block
			$(document).on('click', '.wpforms-notification-delete', function(e) {
				e.preventDefault();
				WPFormsBuilder.notificationDelete($(this));
			});
		},

		/**
		 * Toggle displaying the ReCAPTCHA.
		 *
		 * @since 1.0.0
		 */
		recaptchaToggle: function() {

			if ($('#wpforms-settings-recaptcha').is(':checked')) {
				$('.wpforms-field-recaptcha').show();
			} else {
				$('.wpforms-field-recaptcha').hide();
			}
		},

		/**
		 * Toggle displaying the form title area.
		 *
		 * @since 1.0.0
		 */
		titleAreaToggle: function() {

			if ($('#wpforms-panel-field-settings-hide_title_desc').is(':checked')) {
				$('.wpforms-title-desc').hide();
			} else {
				$('.wpforms-title-desc').show();
			}
		},

		/**
		 * Toggle the different form Confirmation setting fields.
		 *
		 * @since 1.0.0
		 */
		confirmationToggle: function() {

			var $confirmation = $('#wpforms-panel-field-settings-confirmation_type');
			if ($confirmation.val()){
				var type = $confirmation.val();
				$confirmation.parent().parent().find('.wpforms-panel-field').not($confirmation.parent()).hide();
				$('#wpforms-panel-field-settings-confirmation_'+type+'-wrap').show();
				if (type == 'message') {
					$('#wpforms-panel-field-settings-confirmation_message_scroll-wrap').show();
				}
			}
		},

		/**
		 * Toggle the displaying notification settings depending on if the
		 * notifications are enabled.
		 *
		 * @since 1.1.9
		 */
		notificationToggle: function() {
			var $notification = $('#wpforms-panel-field-settings-notification_enable');
			if ( $notification.find('option:selected').val() === '0'){
				$notification.parent().parent().find('.wpforms-notification').hide();
			} else {
				$notification.parent().parent().find('.wpforms-notification').show();
			}
		},

		/**
		 * Add new notification.
		 *
		 * @since 1.2.3
		 */
		notificationAdd: function() {

			var nextID       = Number($('.wpforms-notifications-add').attr('data-next_id'));
				namePrompt   = wpforms_builder.notification_prompt,
				nameField    = '<input autofocus="" type="text" id="notification-name" placeholder="'+wpforms_builder.notification_ph+'">',
				nameError    = '<p class="error">'+wpforms_builder.notification_error+'</p>',
				modalContent = namePrompt+nameField+nameError;

			$.confirm({
				title: false,
				content: modalContent,
				confirm: function () {
					var input = this.$b.find('input#notification-name'),
						error = this.$b.find('.error');
					if (input.val() == '') {
						error.show();
						return false;
					} else {
						var $firstNotification = $('.wpforms-notification').first(),
							$newNotification = $firstNotification.clone();

						$newNotification.find('.wpforms-notification-header span').text(input.val());
						$newNotification.find('input, textarea, select').each(function(index, el) {
							if ($(this).attr('name')) {
								$(this).val('').attr('name', $(this).attr('name').replace(/\[(\d+)\]/, '['+nextID+']'));
								if ($(this).is('select')) {
									$(this).find('option:first').prop('selected',true);
								} else if ( $(this).attr('type') === 'checkbox') {
									$(this).prop('checked', false).val('1');
								} else {
									$(this).val('');
								}
							}
						});
						$newNotification.find('.wpforms-notification-header input').val(input.val());
						$newNotification.find('.email-msg textarea').val('{all_fields}');
						$newNotification.find('.email-recipient input').val('{admin_email}');
						// Conditional logic, if present
						var $conditionalLogic = $newNotification.find('.wpforms-conditional-block');
						if ($conditionalLogic.length) {
							$conditionalLogic.find('.wpforms-conditional-group').not(':first').remove();
							$conditionalLogic.find('.wpforms-conditional-row').not(':first').remove();
							$conditionalLogic.find('.wpforms-conditional-row').attr('data-input-name', 'settings[notifications]['+nextID+']');
							$conditionalLogic.find('.wpforms-conditional-field').attr('data-groupid', '0').attr('data-ruleid', '0');
							$conditionalLogic.find('.wpforms-conditional-row select').each(function(index, el) {
								if ($(this).attr('name')) {
									$(this).attr('name', $(this).attr('name').replace(/\[(\d+)\]\[(\d+)\]/, '[0][0]'));
								}
							});
							$conditionalLogic.find('.wpforms-conditional-row').find('.value').empty().append('<select>');
							$conditionalLogic.find('.wpforms-conditional-groups').hide();
						}
						$firstNotification.before( $newNotification );
						$('.wpforms-notifications-add').attr('data-next_id', nextID+1);
					}
				}
			});
		},

		/**
		 * Delete notification.
		 *
		 * @since 1.2.3
		 */
		notificationDelete: function(el) {

			var $this = $(el);

			$.confirm({
				title: false,
				content: wpforms_builder.notification_delete,
				confirm: function () {
					var notifications = $('.wpforms-notification');
					if ( notifications.length <= 1 ) {
						$.alert({
							title: false,
							content: wpforms_builder.notification_error2
						});	
					} else {
						$this.closest('.wpforms-notification').remove();
					}
				}
			});
		},

		//--------------------------------------------------------------------//
		// Save and Exit
		//--------------------------------------------------------------------//

		/**
		 * Element bindings for Embed and Save/Exit items.
		 *
		 * @since 1.0.0
		 */
		bindUIActionsSaveExit: function() {

			// Save form
			$(document).on('click', '#wpforms-embed', function(e) {
				e.preventDefault();
				var content = wpforms_builder.embed_modal;
					content += '<input type=\'text\' value=\'[wpforms id="' + s.formID + '"]\' disabled id=\'wpforms-embed-shortcode\'>';
					content += wpforms_builder.embed_modal_2;
					content += '<br><br><iframe width="600" height="338" src="https://www.youtube-nocookie.com/embed/IxGVz3AjEe0?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>';
				$.alert({
					columnClass: 'modal-wide',
					title: false,
					content: content,
					confirmButton: wpforms_builder.close
				});	
			});

			// Save form
			$(document).on('click', '#wpforms-save', function(e) {
				e.preventDefault();
				WPFormsBuilder.formSave(false);
			});

			// Exit builder 
			$(document).on('click', '#wpforms-exit', function(e) {
				e.preventDefault();
				WPFormsBuilder.formExit();
			});
		},

		/**
		 * Save form.
		 *
		 * @since 1.0.0
		 */
		formSave: function(redirect) {

			var $saveBtn = $('#wpforms-save'),
				$icon    = $saveBtn.find('i'),
				$label   = $saveBtn.find('span'),
				text     = $label.text();

			if (typeof tinyMCE !== 'undefined') {
				tinyMCE.triggerSave();
			}

			$label.text(wpforms_builder.saving);
			$icon.toggleClass('fa-check fa-cog fa-spin');

			var data = {
				action: 'wpforms_save_form',
				data  : JSON.stringify($('#wpforms-builder-form').serializeArray()),
				id    : s.formID,
				nonce : wpforms_builder.nonce
			}
			$.post(wpforms_builder.ajax_url, data, function(res) {
				if (res.success) {
					$label.text(text);
					$icon.toggleClass('fa-check fa-cog fa-spin');
					wpforms_builder.saved_state = $('#wpforms-builder-form').serializeJSON();
					$(document).trigger('wpformsSaved');
					if (true === redirect ) {
						window.location.href = wpforms_builder.exit_url;
					}
				} else {
					console.log(res);
				}
			}).fail(function(xhr, textStatus, e) {
				console.log(xhr.responseText);
			});
		},

		/**
		 * Exit form builder.
		 *
		 * @since 1.0.0
		 */
		formExit: function() {

			if ( WPFormsBuilder.formIsSaved() ) {
				window.location.href = wpforms_builder.exit_url;
			} else {
				$.confirm({
					title: false,
					content: wpforms_builder.exit_confirm,
					confirmButton: wpforms_builder.save_exit,
					cancelButton: wpforms_builder.exit,
					backgroundDismiss: false,
					closeIcon: false,
					confirm: function(){
						WPFormsBuilder.formSave(true);
					},
					cancel: function(){
						window.location.href = wpforms_builder.exit_url;
					}
				});			
			}
		},

		/**
		 * Check current form state.
		 *
		 * @since 1.0.0
		 */
		formIsSaved: function() {

			var currentState = $('#wpforms-builder-form').serializeJSON();
			
			if ( wpforms_builder.saved_state == currentState ) {
				return true;
			} else {
				return false;
			}
		},

		//--------------------------------------------------------------------//
		// General / global
		//--------------------------------------------------------------------//

		/**
		 * Element bindings for general and global items
		 *
		 * @since 1.2.0
		 */
		bindUIActionsGeneral: function() {

			// Field map table, update key source
			$(document).on('input', '.wpforms-field-map-table .key-source', function(){
				var value = $(this).val(),
					$dest = $(this).parent().parent().find('.key-destination');
					name  = $dest.data('name');
					if (value) {
						$dest.attr('name', name.replace('{source}', value.replace(/[^0-9a-z_-]/gi, '')));
					}
			})

			// Field map table, delete row
			$(document).on('click', '.wpforms-field-map-table .remove', function(e) {
				e.preventDefault();
				WPFormsBuilder.fieldMapTableDeleteRow(e, $(this));
			});

			// Field map table, Add row
			$(document).on('click', '.wpforms-field-map-table .add', function(e) {
				e.preventDefault();
				WPFormsBuilder.fieldMapTableAddRow(e, $(this));
			});

			// Global select field mapping
			jQuery(document).on('wpformsFieldUpdate', WPFormsBuilder.fieldMapSelect);
		},

		/**
		 * Field map table - Delete row
		 *
		 * @since 1.2.0
		 */
		fieldMapTableDeleteRow: function(e, el) {

			var $this = $(el),
				$row = $this.closest('tr'),
				$table = $this.closest('table')
				total = $table.find('tr').length;

			if (total > '1') {
				$row.remove();
			}
		},

		/**
		 * Field map table - Add row
		 *
		 * @since 1.2.0
		 */
		fieldMapTableAddRow: function(e, el) {

			var $this   = $(el),
				$row    = $this.closest('tr'),
				$table  = $this.closest('tbody')
				choice  = $row.clone().insertAfter($row);

			choice.find('input').val('');
			choice.find('select :selected').prop('selected', false);
			choice.find('.key-destination').attr('name','');
		},

		/**
		 * Update field mapped select items on form updates.
		 *
		 * @since 1.2.0
		 * @param object event
		 * @param object fields
		 */
		fieldMapSelect: function(e, fields) {

			// Apply to all selects with indentifier class
			$('.wpforms-field-map-select').each(function(index, el) {
				
				var $this         = $(this),
					selected      = $this.find('option:selected').val(),
					allowedFields = $this.data('field-map-allowed'),
					placeholder   = $this.data('field-map-placeholder');

				// Check if custom placeholder was provided
				if (typeof placeholder === 'undefined' ||  !placeholder) {
					placeholder = wpforms_builder.select_field;
				}

				// Reset select add placeholder option
				$this.empty().append($('<option>', { value: '', text : placeholder }));

				// If allowed fields are not defined, bail
				if (typeof allowedFields !== 'undefined' && allowedFields) {
					allowedFields = allowedFields.split(' ');
				} else {
					return;
				}

				// If we have no fields for the form, bail
				if ( !fields || $.isEmptyObject(fields) ) {
					return;
				}

				// Loop through the current fields
				for(var key in fields) {

					// Compile the label
					if (fields[key].label.length) {
						var label = wpf.sanitizeString(fields[key].label);
					} else {
						var label = wpforms_builder.field + ' #' + fields[key].val;
					}

					// Add to select if it is a field type allowed
					if ($.inArray(fields[key].type, allowedFields) >= 0 || $.inArray('all-fields', allowedFields) >= 0) {
						$this.append($('<option>', { value: fields[key].id, text : label }));
					}
				}

				// Restore previous value if found
				if (selected) {
					$this.find('option[value="'+selected+'"]').prop('selected',true);
				}
			});
		},

		//--------------------------------------------------------------------//
		// Other functions
		//--------------------------------------------------------------------//

		/**
		 * Trim long form titles.
		 *
		 * @since 1.0.0
		 */
		trimFormTitle: function() {

			var $title = $('.wpforms-center-form-name');
			if ($title.text().length > 38) {
				var shortTitle = $.trim($title.text()).substring(0, 38).split(" ").slice(0, -1).join(" ") + "...";
				$title.text(shortTitle);
			}
		},

		/**
		 * Load or refresh tooltips.
		 *
		 * @since 1.0.0
		 */
		loadTooltips: function() {

			$('.wpforms-help-tooltip').tooltipster({
				contentAsHTML: true,
				position: 'right',
				maxWidth: 300,
				multiple: true
			});
		},

		/**
		 * Load or refresh tooltips.
		 *
		 * @since 1.2.1
		 */
		loadColorPickers: function() {
			$('.wpforms-color-picker').minicolors();
		},

		/**
		 * Secret preview hotkey.
		 *
		 * @since 1.2.4
		 */
		previewHotkey: function() {

			var ctrlDown = false;

			$(document).keydown(function(e) {
				if (e.keyCode == 17) {
					ctrlDown = true;
				} else if (ctrlDown && e.keyCode == 80) {
					window.open(wpforms_builder.preview_url);
					ctrlDown = false;
					return false;
				}
			}).keyup(function(e) {
				if (e.keyCode == 17) {
					ctrlDown = false;
				} 
			});
		}
	};

	WPFormsBuilder.init();

})(jQuery);