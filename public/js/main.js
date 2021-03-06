/**
 * Copyright (c) 2020 London Underground
 * 
 * @module js/main.js
 *
 * @fileoverview Handles the main client functionallity 
 *
 * @summary Main Client Handler
 * @author Jason Caldwell
 */


/*-----------------------------------------------------------------------------
  Global Constants
-------------------------------------------------------------------------------*/
const AND_FRAGMENT = 1362;
const DetailIndex = Object.freeze({"detail": 0, "detail_1": 1, "additional_detail":2, "rest_of_line": 3});
const DetailPanels = Object.freeze({"detail": 1, "detail_1": 2, "additional_detail":3, "rest_of_line": 4});
const DirectionTextPosition = Object.freeze({"pre":1, "post":2});
const DisruptionTypes = Object.freeze({"duemiddle":1, "trainmiddle":2, "whilemiddle":3,"tickets":4});
const EAR_TEXT_ICON = "microphone-alt";
const FILTER_ALL = ["duemiddle", "whilemiddle", "trainmiddle"];
const FOLDER_ICON = "folder-open";
const LINE_FRAGMENT = 7000;
const MapDisplayStates = Object.freeze({"no_map": 0, "single_selection": 1, "multi_selection":2});
const MessageSource = Object.freeze({"Assembly": "Assembly Message", "Textual": "Text Only Message", "Builder": "Complete Message"});
const MessageTypes = Object.freeze({"voice_text": 1, "voice": 2, "text":3});
const PL_PARENT_TYPE = 0;
const PL_Level = Object.freeze({"level_1": 1, "level_2": 2, "level_3": 3});
const ReasonStates = Object.freeze({"no_reason":0, "post":1, "pre":2});
const SPELLING_INTERVAL = 2000;  //time in ms (2 seconds)
const STATION_FRAGMENT = 7001;
const STATION_FRAGMENT_LIST = 7002;
const TEXT_ICON = "file-alt";
const TICKET_FRAGMENT_LIST = 7003;
const TOTAL_MESSAGE_LENGTH = 254;
const USER_MRA_CLASSIFIER = "MRA";
const USER_MULTIPART_CLASSIFIER = "COMPOSED";
const USER_ID_START = 10000;
const USER_TYPE_ID = 11;

/*-----------------------------------------------------------------------------
  Global Scope Object - contains all global variables and functions
-------------------------------------------------------------------------------*/

var appComponents = new Vue({
    el: '#appComponents',
    data: {
      disruptionVueData: []
    }
  })

let app = {
    //Global Variables
    appData : [],
    applicationName :'',
    assembledFragments : {fragments: [], text: '', duration: 0, selected: 0},
    banned_words : {fragments: []},
    builderFragments : {fragments: [], text: '', duration: 0},
    completeData: [],
    completeFragmentData : [],
    current_map_display : 0,
    data_loaded_state : false,
    detailData: [],
    detailFragments : [[],[],[],[]],
    dictionary : new Typo( "en_GB" ),
    directionData: [],
    directionFragment : 0,
    direction_position : 0,
    disruptionData : [],
    disruptionDetailIds : [],
    disruptionFragment : [],
    disruptionTypeData : [],
    initialLine : 0,
    lineButton : '',
    lineData : [],
    lineFragment : 0,
    lineImage : 0,
    map_display_state : 0,
    mraMessages: [],
    multipartMessages: [],
    playlistMessages: {messages: [], selected:0},
    playlistCategories: [],
    preambleData : [],
    preambleFragment :0,
    previousStationFragmentList : [], 
    quickList : {messages: [], selected_id: 0},
    reasonData: [],
    reasonFragment : 0, // The current selected reason fragment
    reason_position : 0,
    selected_save_type: 0,
    spellingTimer : 0,   //timer identifier
    start_disruption_fragments : [],
    start_disruption_id : 0,
    start_preamble_fragment : 0,
    start_preamble_id : 0,
    stationFragmentList : [[],[],[]], 
    station_image_scale : 0,
    stations : [],  // Array of Line Stations
    textualFragments : {fragments: [], text: '', selected: 0, error_count: 0, errors: []},
    ticketData: [],
    ticketFragments : [],
    ticketGroup : '',
    ticketFragmentList : [],
    userMessageId :0,
    user_name: '',
    user_role: '',
    version : '',

    /**
     *  Initialise the Application
     */
    initialiseApplication: function ()
    {
        app.initialiseElements();
        app.updateStatusBar();
        app.buildTicketList();
        app.updatePlaylist(PL_PARENT_TYPE, PL_Level.level_1);
        app.updateQuicklist();
        app.readTextFile("/dictionaries/bannedwords.dic");
        app.resetInitialApplicationStates();
        app.calculateUserIDStart();
    },


    /**
     * Initialises the application elements using config data
     *
     */
    initialiseElements: function()
    {
        let str = '';
        let id = 0;
        let splitstr = '';
        let icon = '';
        let b = 0;
    
        // Header
        if(app.appData)
        {
            let local = '';
            if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
            {
                local = "LOCAL ";
            }

            app.version = app.appData.version;
            app.applicationName = app.appData.description;

            $('#appData')
                .append(`<img src="${app.appData.logo}" alt="TfL Logo" width="150">
                <p class="navbar-text project-name text-dark">${local}${app.appData.name} |
                    <span class="project-logo">${app.appData.description}</span></p>`);
            
        }

        // Line Data
        if(app.lineData)
        {
            $.each(app.lineData, (key, value)=>{
                let background = "#e6e6e6";
                let text_colour = "black";
                let str = "Other";
                let id =  value.id;
                let fragment_id = 0;
                let category = '';

                // Determine whether the line only has 1 line
                if (value.lines.length === 1)
                {
                    // Single Line
                    str = value.lines[0].line;

                    // Determine whether the line is intially active
                    if (value.active !== 0)
                    {
                        // Active - set line fragment data
                        background = value.lines[0].background_colour;
                        text_colour = value.lines[0].text_colour;

                        fragment_id = value.lines[0].fragment;
                        app.lineFragment = fragment_id;
                        app.lineImage = value.lines[0].image;
                        app.stations = value.lines[0].stations;
                        app.station_image_scale =  value.lines[0].image_scale;

                        app.initialLine = id;
                    }
                }

                if (value.lines.length === 1)
                {
                    $('#lineList')
                                .append(`<button type="button" class="line btn btn-outline-dark" id="line_${id}" value="${id}"
                                name="${str}" style="background-color: ${background}; color: ${text_colour}">${str}</button>`);
                }
                else
                {
                    $('#lineList')
                                .append(`<button type="button" class="line btn btn-outline-dark" id="line_${id}" value="${id}" data-toggle="modal" data-target="#lineModal"
                                name="${str}" style="background-color: ${background}; color: ${text_colour}">${str}</button>`);
                }
                
            })
        }

        // Preamble Data
        if(app.preambleData)
        {
            $.each(app.preambleData, (key, value)=>{
                str = value.text;
                id = value.id;
                
                // Determine whether the fragment has been set
                if (!app.preambleFragment)
                {
                    app.preambleFragment = value.fragment_id;
                }

                // Determine whether preamble is initially active
                if (value.active === 1)
                {
                    // Active
                    $('#preambleList')
                                .append(`<button type="button" class="preamble btn btn-outline-dark" id="preamble_${id}" name="preamble" value="${str}">${str}</button>`);
                    app.preambleFragment = value.fragment_id;
                    

                    // Set Initial values
                    app.start_preamble_fragment = value.fragment_id;
                    app.start_preamble_id = id;
                }
                else
                {
                    $('#preambleList')
                                .append(`<button type="button" class="preamble btn btn-outline-dark" id="preamble_${id}" name="preamble" value="${str}">${str}</button>`);
                }  
            }) 
        }

        //Disruption Data
        if(app.disruptionData)
        {
            $.each(app.disruptionData, (key, value)=>{
                str = value.button_text;
                id = value.id;

                // Determine whether the button is the initial button
                if (value.active === 1 && app.start_disruption_id === 0)
                {
                    app.start_disruption_id = id;
                    app.start_disruption_fragments = value.fragment_id;
                }

                if (str.length > 0)
                {
                    splitstr = str.split(' ');

                    if (splitstr.length > 1)
                    {
                        $('#disruptionList')
                            .append(`<button type="button" class="disruption btn btn-outline-dark" id="disruption_${id}" name="disruption" value="${str}">${splitstr[0]}<br>${splitstr[1]}</button>`);
                    }
                    else
                    {
                        $('#disruptionList')
                            .append(`<button type="button" class="disruption btn btn-outline-dark" id="disruption_${id}" name="disruption" value="${str}">${splitstr[0]}</button>`);
                    }
                }            
            })
        }

        // Reason Data
        if(app.reasonData)
        {
            $.each(app.reasonData, (key, value)=>{
                str = value.button_text;
                id = value.id;
                $('#reasonList')
                    .append(`<button type="button" class="reason btn btn-outline-dark" disabled id="reason_${id}" name="reason" value="${str}">${str}</button>`); 
            })
        }

        // Detail Data
        if(app.detailData)
        {
            $.each(app.detailData, (key, value)=>{
                let panel_id = value.panel_id;
                for (b = 0; b < value.buttons.length; b++)
                {
                    str = value.buttons[b].button_text;
                    id = value.buttons[b].id;
                    icon = value.buttons[b].icon
                    
                    // Determine which detail data is being loaded
                    if (panel_id === DetailPanels.detail)
                    {
                        // Detail
                        if (value.buttons[b].display_map !== MapDisplayStates.no_map)
                        {
                            $('#detailList')
                                .append(`<button type="button" class="detail btn btn-outline-dark" id="detail_${id}" name="detail" data-toggle="modal" data-target="#stationModal" data-dismiss="modal" value="${str}" disabled><i class="fas fa-lg fa-${icon}"></i><br>${str}</button>`);
                        }
                        else
                        {
                            $('#detailList')
                                .append(`<button type="button" class="detail btn btn-outline-dark" id="detail_${id}" name="detail" value="${str}" disabled><i class="fas fa-lg fa-${icon}"></i><br>${str}</button>`);
                        }
                    }

                    // Detail_1
                    else if (panel_id === DetailPanels.detail_1)
                    {
                        $('#detail_1_list')
                            .append(`<button type="button" class="detail_1 btn btn-outline-dark" id="detail_1_${id}" name="detail_1" data-toggle="modal" data-target="#stationModal" value="${str}" disabled>${str}</button>`);
                    }

                    // Additional Data
                    else if (panel_id === DetailPanels.additional_detail)
                    {
                        $('#additional_detail_list')
                            .append(`<button type="button" class="additional_detail btn btn-outline-dark" id="additional_detail_${id}" name="additional_detail" data-toggle="modal" data-target="#stationModal" value="${str}" disabled>${str}</button>`);
                    }

                    // Rest of Line
                    else if (panel_id === DetailPanels.rest_of_line)
                    {
                        $('#rest_of_line_list')
                            .append(`<button type="button" class="rest btn btn-outline-dark" id="rest_${id}" name="rest" value="${str}" disabled>${str}</button>`);
                    }
                }
            })
        }

        // Direction Data
        if(app.directionData)
        {
            $.each(app.directionData, (key, value)=>{
                str = value.button_text;
                id = value.id;
                $('#directionList')
                    .append(`<button type="button" class="direction btn btn-outline-dark" id="direction_${id}" name="direction" value="${id}" disabled><i class="fas fa-${value.icon}"></i><br>${value.button_text}</button>`);
            })
        }

        //Ticket Data
        if(app.ticketData)
        {
            app.ticketFragments = app.ticketData.fragmentId;
            app.ticketGroup = app.ticketData.group;
        }
    },

    /**
     * Reset the initial states of the Application
     */
    resetInitialApplicationStates: function ()
    {
        app.resetDisruptionButtons();
        app.resetPreambleButtons();
        app.resetReasonButtons();
        app.resetDetailButtons();
        app.resetDirectionButtons();
        app.resetTicketOptions();

        app.updateMessagePanels();
    },

    /**
     * Reset the active states of the disruption buttons
     */
    resetDisruptionButtons: function ()
    {
        let buttons = document.querySelectorAll('.disruption');
        let button_name = '';
        let button_id = 0;

        app.disruptionFragment = [];

        // Set Button States
        for (b = 0; b<buttons.length; b++)
        {
            button_name = buttons[b].getAttribute('id');
            button_id = parseInt(button_name.substr(button_name.indexOf('_') + 1),10);
            buttons[b].classList.remove('active');
            
            if (app.start_disruption_id === button_id && 
                app.start_disruption_id !==0)
            {
                buttons[b].classList.add('active');
                app.disruptionFragment = app.start_disruption_fragments;
            }
        }
    },

    /**
     * Reset the active states of the Preamble buttons
     */
    resetPreambleButtons: function ()
    {
        let buttons = document.querySelectorAll('.preamble');
        let button_name = '';
        let button_id = 0;

        app.preambleFragment = 0;

        // Set Button States
        for (b = 0; b<buttons.length; b++)
        {
            button_name = buttons[b].getAttribute('id');
            button_id = parseInt(button_name.substr(button_name.indexOf('_') + 1));
            
            buttons[b].classList.remove('active');

            
            
            if (app.start_preamble_id === button_id && 
                app.start_preamble_id !== 0)
            {
                buttons[b].classList.add('active');
                app.preambleFragment = app.start_preamble_fragment;
            }
        }
    },

    /**
     * Reset the active and enabled states of the Reason buttons
     */
    resetReasonButtons: function ()
    {
        let buttons = document.querySelectorAll('.reason');
        let button_name = '';
        let button_id = 0;

        app.reasonFragment = 0;

        if ($('#reasonSelectedList').contents().length === 0)
        {
            app.filterReasonsByType(FILTER_ALL, null);
        }

        // Set Button States
        for (b = 0; b<buttons.length; b++)
        {
            buttons[b].classList.remove('active');
            buttons[b].disabled = true;
        }

        $('#reasonClear').prop('disabled', true);
        $('#reasonTextSearch').prop('disabled', true);
        $('#reasonSearchClear').prop('disabled', true);
        $('#reasonText').prop('disabled', true);

        $('.reason_item').each(function()   {
            $(this).addClass('reason_disabled');
            $(this).css('background-color', '#e9ecef');
            $(this).css('color', 'black');
        })
    },

    /**
     * Reset the active states of the Detail buttons
     */
    resetDetailButtons: function ()
    {
        let buttons = document.querySelectorAll('.detail');
        
        app.detailFragments[DetailIndex.detail] = [];

        // Set Button States
        for (b = 0; b<buttons.length; b++)
        {   
            buttons[b].classList.remove('active');
            buttons[b].disabled = true;
        }

        buttons = document.querySelectorAll('.detail_1');

        app.detailFragments[DetailIndex.detail_1] = [];

        // Set Button States
        for (b = 0; b<buttons.length; b++)
        {
            buttons[b].classList.remove('active');
            buttons[b].disabled = true;
        }

        buttons = document.querySelectorAll('.additional_detail');
        app.detailFragments[DetailIndex.additional_detail] = [];

        // Set Button States
        for (b = 0; b<buttons.length; b++)
        { 
            buttons[b].classList.remove('active');
            buttons[b].disabled = true;
        }

        buttons = document.querySelectorAll('.rest');
        app.detailFragments[DetailIndex.rest_of_line] = [];

        // Set Button States
        for (b = 0; b<buttons.length; b++)
        {
            buttons[b].classList.remove('active');
            buttons[b].disabled = true;
        }


        $('#detailClear').prop('disabled', true);
        $('#detail_1_clear').prop('disabled', true);
        $('#additional_detail_clear').prop('disabled', true);
        $('#rest_of_line_clear').prop('disabled', true);
    },


    /**
     * Reset the active states of the direction buttons
     *
     */
    resetDirectionButtons: function ()
    {
    let buttons = document.querySelectorAll('.direction');

    app.directionFragment = 0;

        // Set Button States
        for (b = 0; b<buttons.length; b++)
        { 
            buttons[b].classList.remove('active');
            buttons[b].disabled = true;
        }

        $('#directionClear').prop('disabled', true);
    },

    /**
     * Reset the active states of the ticket options
     *
     */
    resetTicketOptions: function ()
    {
        $('#ticketClear').prop('disabled', true);

        $('.ticket_item').each(function()   {
            $(this).css('background-color', '#e9ecef');
            $(this).css('color', 'black');
            $(this).addClass('ticket_disabled');
        })

        app.ticketFragmentList = [];
    },

    /**
     * Reset the active states of the Line buttons
     *
     */
    resetLineButton: function ()
    {
        let button_name = '';
        let button_id = 0;

        $('.line').each(function()   {
            button_name = $(this).attr('id');
            button_id = parseInt(button_name.substr(button_name.indexOf('_') + 1));
        
            if (button_id === app.initialLine)
            {
                $(this).trigger('click');
            }
        })
    },

    /**
     * Updates all of the message panels
     */
    updateMessagePanels: function ()
    {
        app.compileFragments(app.assembledFragments);
        app.updateMessageAssembler();
        app.compileFragments(app.textualFragments);
        app.updateTextualMessage();
        app.compileFragments(app.builderFragments);
        app.updateBuilderMessage();
    },

        
    /**
     * Compiles the fragments for display and preview
     * 
     * @param  {} fragments - The fragment store
     */
    compileFragments: function (fragments)
    {
        let f = 0;
        let last_token = '';
        let reason_text = '';
        let s = 0;
        let station_fragment_used = 0;
        let t = 0;
        let token_arr = [];

        fragments.fragments = [];
        
        //Preamble
        if (app.preambleFragment !== 0)
        {
        fragments.fragments.push(app.preambleFragment);
        }

        // Determine whether the reason should be displayed before the disruption
        if (app.reason_position === ReasonStates.pre &&
            app.reasonFragment !== 0)
        {
            fragments.fragments.push(app.reasonFragment);
            reason_text = app.getFragmentText(app.reasonFragment);
        }

        // Disruption
        for (f=0; f<app.disruptionFragment.length; f++)
        {
            if (app.disruptionFragment[f] === LINE_FRAGMENT)
            {
                // Determine whether a direction has been set
                if (app.directionFragment)
                {
                    if (app.direction_position === DirectionTextPosition.post &&
                        !app.disruptionFragment.includes(STATION_FRAGMENT))
                    {
                        fragments.fragments.push(app.lineFragment);
                        fragments.fragments.push(app.directionFragment);
                    }
                    else if (app.direction_position === DirectionTextPosition.pre)
                    {
                        fragments.fragments.push(app.directionFragment);
                        fragments.fragments.push(app.lineFragment);
                    }
                    else
                    {
                        fragments.fragments.push(app.lineFragment);
                    }
                }
                else
                {
                    fragments.fragments.push(app.lineFragment);
                }
            }
            else if (app.disruptionFragment[f] === STATION_FRAGMENT)
            {
                if (app.stationFragmentList[DetailIndex.detail].length >0)
                {
                    fragments.fragments.push(app.stationFragmentList[DetailIndex.detail][0]);
                }

                // Determine whether a direction has been set
                if (app.directionFragment && app.direction_position === DirectionTextPosition.post)
                {
                    fragments.fragments.push(app.directionFragment);
                }

                station_fragment_used = 1;
            }
            else
            {
                fragments.fragments.push(app.disruptionFragment[f]);
            }
        }

        // Details 1
        if (app.detailFragments[DetailIndex.detail_1].length > 0)
        {
            for (f=0; f < app.detailFragments[DetailIndex.detail_1].length; f++)
            {
                if (app.detailFragments[DetailIndex.detail_1][f] === STATION_FRAGMENT_LIST)
                {
                    for (s=0; s < app.stationFragmentList[DetailIndex.detail_1].length; s++)
                    {
                        // Determine whethere station is the last in the list
                        if ((s+1) === app.stationFragmentList[DetailIndex.detail_1].length && s !== 0)
                        {
                            fragments.fragments.push(AND_FRAGMENT);
                        }

                        fragments.fragments.push(app.stationFragmentList[DetailIndex.detail_1][s]);
                    }
                }
                else
                {
                    fragments.fragments.push(app.detailFragments[DetailIndex.detail_1][f]);
                }
            }
        }

        // Additional Detail Fragments
        if (app.detailFragments[DetailIndex.additional_detail].length > 0)
        {
            for (f=0; f < app.detailFragments[DetailIndex.additional_detail].length; f++)
            {
                if (app.detailFragments[DetailIndex.additional_detail][f] === STATION_FRAGMENT_LIST)
                {
                    for (s=0; s < app.stationFragmentList[DetailIndex.additional_detail].length; s++)
                    {
                        // Determine whethere station is the last in the list
                        if ((s+1) === app.stationFragmentList[DetailIndex.additional_detail].length && s !== 0)
                        {
                            fragments.fragments.push(AND_FRAGMENT);
                        }

                        fragments.fragments.push(app.stationFragmentList[DetailIndex.additional_detail][s]);
                    }
                }
                else
                {
                    fragments.fragments.push(app.detailFragments[DetailIndex.additional_detail][f]);
                }
            }
        }

        // Reason
        if (app.reason_position === ReasonStates.post &&
            app.reasonFragment !== 0)
        {
            fragments.fragments.push(app.reasonFragment);
            reason_text = app.getFragmentText(app.reasonFragment);

            //Split reason text into tokens
            token_arr = reason_text.split(' ');
            last_token = token_arr.pop();
        }

        // Details
        if (station_fragment_used === 0 || !app.detailFragments[DetailIndex.detail].includes(STATION_FRAGMENT)) 
        {
            for (f=0; f<app.detailFragments[DetailIndex.detail].length; f++)
            {
                if (app.detailFragments[DetailIndex.detail][f] === STATION_FRAGMENT)
                {
                    if (app.stationFragmentList[DetailIndex.detail].length > 0)
                    {
                        fragments.fragments.push(app.stationFragmentList[DetailIndex.detail][0]);
                    }
                }
                else
                {
                    if (app.getFragmentText(app.detailFragments[f]) !== last_token)
                    {
                        fragments.fragments.push(app.detailFragments[DetailIndex.detail][f]);
                    }
                }
            }
        }

        // Rest Of Line
        if (app.detailFragments[DetailIndex.rest_of_line].length > 0)
        {
            for (f=0; f < app.detailFragments[DetailIndex.rest_of_line].length; f++)
            {
                fragments.fragments.push(app.detailFragments[DetailIndex.rest_of_line][f]);
            }
        }

        // Tickets
        if (app.ticketFragments.length > 0 && app.ticketFragmentList.length > 0)
        {
            for (f=0; f < app.ticketFragments.length; f++)
            {
                if (app.ticketFragments[f] === TICKET_FRAGMENT_LIST)
                {
                    for (t=0; t < app.ticketFragmentList.length; t++)
                    {
                        // Determine whethere station is the last in the list
                        if ((t+1) === app.ticketFragmentList.length && t !== 0)
                        {
                            fragments.fragments.push(AND_FRAGMENT);
                        }

                        fragments.fragments.push(app.ticketFragmentList[t]);
                    }
                }
                else
                {
                    fragments.fragments.push(app.ticketFragments[f]);
                }
            }
        }



        fragments.selected = 0;
    },

    /**
     * Updates the Message in the Message Assembler panel
     */
    updateMessageAssembler: function ()
    {
        let id = 0;
        let fragment_text = '';

        // Reset Duration
        app.assembledFragments.duration = 0;
        app.assembledFragments.text = '';

        $('#messageAssembly')
                        .html(`<span class="message_font">`);

        for (let f=0; f < app.assembledFragments.fragments.length; f++)
        {
            id = app.assembledFragments.fragments[f];
            fragment_text = app.getFragmentText(id);

            if (f === app.assembledFragments.selected)
            {
                $('#messageAssembly')
                        .append(`<u>${fragment_text}</u> | `);
            }
            else
            {
                $('#messageAssembly')
                        .append(`${fragment_text} | `);
            }

            // Add fragment duration
            app.assembledFragments.duration += app.getFragmentDuration(id);
            app.assembledFragments.text += fragment_text + ' ';
            
        }

        app.assembledFragments.text = app.assembledFragments.text.trim();
        
        if (app.assembledFragments.selected >= app.assembledFragments.fragments.length)
        {
            $('#messageAssembly')
                        .append(`<u>|</u>`);
        }

        $('#messageAssembly')
                        .append(`</span>`);

        app.updateAssemblyButtons();             
    },

    /**
     * Updates the Message in the Textual Message panel
     */
    updateTextualMessage: function ()
    {
        let id = 0;
        let message = '';
       
        $('#textualMessage').empty();
        
        for (let f=0; f < app.textualFragments.fragments.length; f++)
        {
            id = app.textualFragments.fragments[f];
            fragment_text = app.getFragmentText(id);
            message = message + app.getFragmentText(id) + ' ';
        }

        $('#textualMessage').html(`<span class="message_font">${message.trim()}.</span>`);

        app.updateTextualMessageLength();
        app.updateTextualButtons();  
        
        app.textualFragments.error_count = 0;
        app.textualFragments.errors = [];

        // Empty the suggestions list
        $('#textualSuggestions').empty();
    },

    /**
     * Updates the textual message length 
     */
    updateTextualMessageLength: function ()
    {
        let message = '';
        let contents = '';
        let message_length = 0;
        let char_remaining = 0;

        if(document.getElementById("textualMessage") !== null)
        {
            // Get the current message
            message = document.getElementById('textualMessage').innerText;

            // Calculate lenngths
            message_length = message.trim().length;

            if (message.endsWith('.'))
            {
                message_length = message_length - 1;
            }
            char_remaining = TOTAL_MESSAGE_LENGTH - message_length;
            
            // Display length
            document.getElementById('messagelength').innerHTML = 'Message Length: ';
            
            if (message_length > TOTAL_MESSAGE_LENGTH )
            {
                document.getElementById('messagelength').insertAdjacentHTML('beforeend',
                    '<span style="color: red">' + message_length + ' Text over limit and won\'t be displayed on displays</span>');
            }
            else
            {
                document.getElementById('messagelength').insertAdjacentHTML('beforeend',
                    '<span>' + message_length + '/' + TOTAL_MESSAGE_LENGTH + ' | ' 
                            + char_remaining + ' characters remaining</span>');
            }
        }
    },

    /**
     * Updates the Message in the Message Assembler panel
     */
    updateBuilderMessage: function ()
    {
        let id = 0;
        let message = '';
        let fragment_text = '';

        // Reset Duration
        app.builderFragments.duration = 0;
        app.builderFragments.text = '';

        $('#builderCompleteMessage').empty();
        
        for (let f=0; f < app.builderFragments.fragments.length; f++)
        {
            id = app.builderFragments.fragments[f];
            fragment_text = app.getFragmentText(id);
            message = message + app.getFragmentText(id) + ' ';

            // Add fragment duration
            app.builderFragments.duration += app.getFragmentDuration(id);
            app.builderFragments.text += fragment_text + ' ';
        }

        app.builderFragments.text = app.builderFragments.text.trim();

        $('#builderCompleteMessage').html(`<span class="builder_message_font">${message.trim()}.</span>`);      
        
        app.updateBuilderMessageButtons();
    },

    /**
     * Updates the message assembly control buttons
     */
    updateAssemblyButtons: function ()
    {
        // Determine whether the assembler contains a message
        if  (app.assembledFragments.fragments.length > 0)
        {
            // Update previous and next
            $('#assemblyPrevious').prop('disabled', 
                (app.assembledFragments.selected === 0));
            
            $('#assemblyNext').prop('disabled', 
                (app.assembledFragments.selected === app.assembledFragments.fragments.length));

            // Enable control buttons

            if (app.assembledFragments.selected < app.assembledFragments.fragments.length)
            {
                $('#assemblyDelete').prop('disabled', false);
            }
            else
            {
                $('#assemblyDelete').prop('disabled', true);
            }
            $('#assemblyClear').prop('disabled', false);
            $('#previewClick').prop('disabled', false);
            $('#assemblySave').prop('disabled', false);
        }
        else
        {
            // No message - disable all buttons
            $('#assemblyNext').prop('disabled', true);
            $('#assemblyDelete').prop('disabled', true);
            $('#assemblyPrevious').prop('disabled', true);
            $('#assemblyClear').prop('disabled', true);
            $('#previewClick').prop('disabled', true);
            $('#assemblySave').prop('disabled', true);
        }
    },

    /**
     * Updates the textual message control buttons
     */
    updateTextualButtons: function ()
    {
        // Determine whether a message is being displayed
        if  (app.textualFragments.fragments.length > 0)
        {
            // Enable buttons
            $('#textualClear').prop('disabled', false);
            $('#textualSave').prop('disabled', false);
        }
        else
        {
            // No message - disable all buttons
            $('#textualNext').prop('disabled', true);
            $('#textualPrevious').prop('disabled', true);
            $('#textualClear').prop('disabled', true);
            $('#textualSave').prop('disabled', true);
        }
    },

    /**
     * Updates the textual message control buttons
     */
    updateBuilderMessageButtons: function ()
    {
        // Determine whether the builder contains a message
        if  (app.builderFragments.fragments.length > 0)
        {
            // Enable control buttons
            $('#builderClear').prop('disabled', false);
            $('#builderPreview').prop('disabled', false);
            $('#builderSave').prop('disabled', false);
        }
        else
        {
            // No message - disable all buttons
            $('#builderClear').prop('disabled', true);
            $('#builderPreview').prop('disabled', true);
            $('#builderSave').prop('disabled', false);
        }
    },

    /**
     * Calculates the next User Message ID
     *
     */
    calculateUserIDStart: function ()
    {
        // Get Array of current message ids
        let arr = $.map(app.playlistMessages.messages, function(message) { return message.message_id});
        
        // Get the highest message ID
        let highest = Math.max.apply(this, arr);
        
        // Determine whether a USER ID has been set
        if (highest < USER_ID_START)
        {
            app.userMessageId = USER_ID_START;
        }
        else
        {
            app.userMessageId = highest + 1; // Next number
        }
    },

    /**
     * Preview the message in the message audibly
     *
     * @param {array} fragments - the message fragments
     */
    previewSound: function (fragments)
    {
        let file_names=[];

        // Build Play List
        for (let f=0; f < fragments.length; f++)
        {
            if (fragments[f] < LINE_FRAGMENT && fragments[f] !==0)
            {
                file_names[f] = '/media/WavFiles/' + fragments[f] + '.wav';
            }
        }

        app.playSound(file_names);
    },

    /**
     * Play the audio files in the play list
     * 
     * @param  {} file_names - the audio playlist
     */
    playSound: function (file_names) {
        let sound = new Howl({
            src: [file_names[0]],
            
            // When the current audio file has finished
            onend: function() {
                file_names.shift();

                // determine whether any more files are left to play
                if (file_names.length > 0) {
                    // play next file
                    app.playSound(file_names);
                }
                else
                {
                    // No more files - enable preview button
                    $('#builderPreview').prop('disabled',false);
                    $('#previewClick').prop('disabled',false);

                    if ($('#libraryMessage').contents().length > 0)
                    { 
                        $('#browserPreview').prop('disabled',false);
                    }
                    
                }
            }
        });      
        sound.play();
    },

    /**
     *  Generates text from the fragment elements
     *
     * @param {array} fragmentElements - the fragment elements
     * @returns {string} returns the generated text
     */
    generateFragmentText: function (fragmentElements)
    {
        let text = '';

        // Add each element to the text
        for (f = 0; f <fragmentElements.length; f++)
        {
            // Add seperator
            if (f !== 0)
            {
                text = text + ' | ';
            }

            // Determine whether the fragment is the line fragment
            if (fragmentElements[f] === LINE_FRAGMENT)
            {
                // add line text
                text = text + '{line}'
            }
            else
            {
                // add fragment text
                text = text + app.getFragmentText(fragmentElements[f]);
            }
        }

        return text;
    },

    /**
     * Filters the reasons using the disruption types
     *
     * @param {Array} types - the disruption types
     * @param {String} group - the disruption group
     */
    filterReasonsByType: function (types, group)
    {
        let filterArray = [];
        let newArray = [];
        let id = 0;
        let element_list = [];

        for(let f=0; f < app.disruptionTypeData .length; f++) 
        {  
            if ((types.includes(app.disruptionTypeData [f].type)) &&
                ((app.disruptionTypeData [f].group == group && group !== null) ||
                (group === null)))
            {
                id = app.disruptionTypeData [f].section_id;
                if (app.getFragmentText(id))
                {
                    if (app.getFragmentSectionPosition(id) ==='M')
                    {
                        filterArray.push({id: `${id}`, text: `${app.getFragmentText(id)}`});
                    }
                }
                else
                {
                    //console.log('ID: ', id);
                }
            }
        }

        // Remove Duplicates from the Array
        filterArray =  filterArray.filter((obj, pos, self) => {
            return self.map(mapObj => mapObj['text']).indexOf(obj['text']) === pos;
        });

        // Sort Array
        filterArray.sort(app.compareFragments);

        //Add fragments to list
        for(f=0; f < filterArray.length; f++) 
        { 
            if (f===0)
            {
                $('#reasonSelectedList')
                    .html(`<li class="list_font reason_item" id="reason_${filterArray[f].id}">${filterArray[f].text}</li>`);
            }
            else
            {
                $('#reasonSelectedList')
                    .append(`<li class="list_font reason_item" id="reason_${filterArray[f].id}">${filterArray[f].text}</li>`);
            }
        }      
    },

    /**
     * Filters the reasons using the search criteria
     *
     * @param {string} searchText - the search criteria
     */
    filterReasonsByText: function (searchText)
    {
        let filterArray = [];
        let id = 0;
        
        for(let f=0; f < app.disruptionTypeData .length; f++) 
        {  
            id = app.disruptionTypeData [f].section_id;

            if (app.getFragmentText(id))
            {
                if (app.getFragmentText(id).toLowerCase().includes(searchText) ||
                    app.getFragmentText(id).toLowerCase().match(searchText))
                {
                    filterArray.push({id: `${id}`, text: `${app.getFragmentText(id)}`});
                }
            }
            else
            {
                //console.log('ID: ', id);
            }
        }

        // Remove Duplicates from the Array
        filterArray =  filterArray.filter((obj, pos, self) => {
            return self.map(mapObj => mapObj['text']).indexOf(obj['text']) === pos;
        });

        // Sort Array
        filterArray.sort(app.compareFragments);

        //Add fragments to list
        for(f=0; f < filterArray.length; f++) 
        { 
            if (f===0)
            {
                $('#reasonSelectedList')
                    .html(`<li class="list_font reason_item" id="reason_${filterArray[f].id}">${filterArray[f].text}</li>`);
            }
            else
            {
                $('#reasonSelectedList')
                    .append(`<li class="list_font reason_item" id="reason_${filterArray[f].id}">${filterArray[f].text}</li>`);
            }
        }      
    },

    /**
     * Filters the reasons using the search criteria
     *
     * @param {string} searchText - the search criteria
     */
    filterFragmentData: function (searchText)
    {
        let filterArray = [];

        $('#fragmentArea').empty();

        // Find Fragments based on search criteria
        for(let f=0; f < app.completeFragmentData.length; f++) 
        { 
            if (String(app.completeFragmentData[f].detail).toLowerCase().startsWith(searchText))
            {
                filterArray.push(app.completeFragmentData[f]);
            }
        }

        // Sort Array
        filterArray.sort(app.compareMessageFragments);

        //Add fragments to list
        for(f=0; f < filterArray.length; f++) 
        { 
            $('#fragmentArea')
                    .append(`<li class="fragment_list_font fragment_item" id="fragment_${filterArray[f].section_id}">
                    ${filterArray[f].message_name} (${String(filterArray[f].section_position).toUpperCase()})<br>
                    <span class="fragment_list_small_font">${filterArray[f].detail}</span><br><br></li>`);
        }      
    },

    /**
     * Filters the reasons using the search criteria
     *
     * @param {string} searchText - the search criteria
     */
    buildTicketList: function ()
    {
        let filterArray = [];
        let id = 0;
        let f = 0;
        
        for(let f=0; f < app.disruptionTypeData .length; f++) 
        {  
            if (app.disruptionTypeData [f].group == app.ticketGroup)
            {
                id = app.disruptionTypeData [f].section_id;
                
                if (app.getFragmentText(id))
                {
                    filterArray.push({id: `${id}`, text: `${app.getFragmentText(id)}`});
                }
            }
        }

        // Sort Array
        filterArray.sort(app.compareFragments);

        $('#ticketSelectionList').empty();

        //Add fragments to list
        for(f=0; f < filterArray.length; f++) 
        { 
            $('#ticketSelectionList')
                        .append(`<li class="list_font ticket_item ticket_disabled" id="ticket_${filterArray[f].id}">${filterArray[f].text}</li>`);
        }      
    },

    /**
     * Compares the two elements 
     *
     * @param {string} a - element a
     * @param {string} b - element a
     * @returns {number} -1 if a < b; 1 if a > b; 0 if a= b
     */
    compareFragments: function ( a, b ) {
        // determine if a < b
        if ( a.text.toLowerCase() < b.text.toLowerCase() ){
        return -1;
        }
        // determine if a > b
        if ( a.text.toLowerCase() > b.text.toLowerCase()){
        return 1;
        }
        // a= b
        return 0;
    },

    /**
     * Compares the two elements 
     *
     * @param {string} a - element a
     * @param {string} b - element a
     * @returns {number} -1 if a < b; 1 if a > b; 0 if a= b
     */
    compareMessageFragments: function ( a, b ) {
        // determine if a < b
        if ( a.detail.toLowerCase() < b.detail.toLowerCase() ){
        return -1;
        }
        // determine if a > b
        if ( a.detail.toLowerCase() > b.detail.toLowerCase()){
        return 1;
        }
        // a= b
        return 0;
    },


    /**
     * Compares the two elements in the Play List
     *
     * @param {string} a - element a
     * @param {string} b - element a
     * @returns {number} -1 if a < b; 1 if a > b; 0 if a= b
     */
    comparePlaylistCategories: function ( a, b ) {
        // determine if a < b
        if ( a.type_name < b.type_name ) {
            return -1;
        }
        // determine if a > b
        if ( a.type_name > b.type_name){
            return 1;
        }
        // a= b
        return 0;
    },

    /**
     *  Updates the application status bar
     *
     */
    updateStatusBar: function ()
    {
        app.updateStatusApplicationData();
        app.getDateAndTime();

        //Set Username and Role
        app.user_name = $('#userName').text();
        app.user_role = $('#userRole').text();
        
    },


    /**
     *  Updates the Status Bar with the Application Data
     *
     */
    updateStatusApplicationData: function ()
    {
        $('#applicationDetails')
            .html(`<span class="status_font">${app.applicationName}<br><span>
                <span class="status_font">Version: ${app.version}<span>`);
    },


    /**
     *  Gets the current date and time and updates the status bar
     *
     */
    getDateAndTime: function getDateAndTime()
    {
        let dt = new Date();
        let current_data = dt.toLocaleDateString('en-uk', {  weekday: 'long' }) + ' ' +
        dt.getDate() + ' ' + dt.toLocaleDateString('en-uk', {  month: 'long' }) + ' ' + dt.getFullYear();
        let current_time = dt.toLocaleTimeString();
        document.getElementById("currentdate").innerHTML = current_data;
        document.getElementById("currenttime").innerHTML =  current_time; 
        let t = setTimeout(app.getDateAndTime, 500);
    },

    /**
     * Updates the Detail Buttons using the button list options
     *
     * @param {Array} button_list - The detail button list options
     */
    updateDetailButtons: function (button_list)
    {
        let buttons = [];
        let button_name = '';
        let button_id = 0;
        
        // Detail Buttons
        buttons = document.querySelectorAll('.detail');
        
        for (b = 0; b<buttons.length; b++)
        {
            button_name = buttons[b].getAttribute('id');
            button_id = parseInt(button_name.substr(button_name.indexOf('_') + 1),10);

            // Determine whether the button should be disabled
            if (button_list.detail && button_list.detail.includes(button_id))
            {
                // Enabled
                buttons[b].disabled = false;
            }
            else
            {
                // Disabled
                buttons[b].disabled = true;
                if (buttons[b].classList.contains('active'))
                {
                    buttons[b].classList.remove('active');
                    app.detailFragments[DetailIndex.detail] = [];
                    app.stationFragmentList[DetailIndex.detail] = [];
                    $('#detailClear').prop('disabled', true);
                }
            }
        }

        // Detail_1 Buttons
        buttons = document.querySelectorAll('.detail_1');

        for (b = 0; b<buttons.length; b++)
        {
            button_name = buttons[b].getAttribute('id');
            button_id = parseInt(button_name.substr(button_name.lastIndexOf('_') + 1),10);
            
            // Determine whether the button should be disabled
            if (button_list.detail_1 && button_list.detail_1.includes(button_id))
            {
                // Enabled
                buttons[b].disabled = false;
            }
            else
            {
                // Disabled
                buttons[b].disabled = true;
                if (buttons[b].classList.contains('active'))
                {
                    buttons[b].classList.remove('active');
                    app.detailFragments[DetailIndex.detail_1] = [];
                    app.stationFragmentList[DetailIndex.detail_1] = [];
                    $('#detail_1_clear').prop('disabled', true);
                }
            }
        }

        // Additional Buttons
        buttons = document.querySelectorAll('.additional_detail');
    
        for (b = 0; b<buttons.length; b++)
        {
            button_name = buttons[b].getAttribute('id');
            button_id = parseInt(button_name.substr(button_name.lastIndexOf('_') + 1),10);

            // Determine whether the button should be disabled
            if (button_list.additional && button_list.additional.includes(button_id))
            {
                // Enabled
                buttons[b].disabled = false;
            }
            else
            {
            // Disabled
                buttons[b].disabled = true;
                if (buttons[b].classList.contains('active'))
                {
                    buttons[b].classList.remove('active');
                    app.detailFragments[DetailIndex.additional_detail] = [];
                    app.stationFragmentList[DetailIndex.additional_detail] = [];
                    $('#additional_detail_clear').prop('disabled', true);
                }
            }
        }

        // Rest of Line
        buttons = document.querySelectorAll('.rest');
    
        for (b = 0; b<buttons.length; b++)
        {
            button_name = buttons[b].getAttribute('id');
            button_id = parseInt(button_name.substr(button_name.lastIndexOf('_') + 1),10);

            // Determine whether the button should be disabled
            if (button_list.rest && button_list.rest.includes(button_id))
            {
                // Enabled
                buttons[b].disabled = false;
            }
            else
            {
            // Disabled
                buttons[b].disabled = true;
                if (buttons[b].classList.contains('active'))
                {
                    buttons[b].classList.remove('active');
                    app.detailFragments[DetailIndex.rest_of_line] = [];
                    $('#rest_of_line_clear').prop('disabled', true);
                }
            }
        }
    },

    /**
     * Update the direction button based on the state
     *
     * @param {boolean} state - the direction state
     */
    updateDirectionButtons: function (state)
    {
        let buttons = [];

        // Determine whether the clear button should be disabled
        if (state === 0)
        {
            $('#directionClear').prop('disabled', true);
        }

        // Detail Buttons
        buttons = document.querySelectorAll('.direction');

        for (b = 0; b<buttons.length; b++)
        {
            // Determine whether the button should unselected
            if (state === 0 && buttons[b].classList.contains('active'))
            {
                buttons[b].classList.remove('active');
                app.directionFragment = 0;
            }
            buttons[b].disabled = !state;
        }
    },


    /**
     * Updates the ticket list based on the state
     *
     * @param {boolean} state - Enabled/Disabled state
     */
    updateTicketList: function (state)
    {
        // Determine whether the clear button should be disabled
        if (state === 0)
        {
            // Disable Clear Button
            $('#ticketClear').prop('disabled', true);

            // Remove Selections
            $('.ticket_item').each(function()   {
                $(this).css('background-color', '#e9ecef');
                $(this).css('color', 'black');
            })
        
            app.ticketFragmentList = [];
        }

        $('.ticket_item').each(function()   {

            // Determine whether the list item should be enabled
            if (state === 0)
            {
                $(this).addClass('ticket_disabled');
            }
            else
            {
                $(this).removeClass('ticket_disabled');
            }
        })
    },

    /**
     * Called when the Textual Message is updated
     *
     */
    onTextualMessageEdit: function ()
    {
        // Spell check the data
        app.textualFragments.error_count = 0;
        app.textualFragments.errors = [];
        app.textualFragments.selected = 0;
        app.spellCheckTextualMessage(true);
    },


    /**
     *  Perform a spell check on the textual message
     *
     * @param {boolean} update_errors - determins whether errors should be updated
     */
    spellCheckTextualMessage: function (update_errors)
    {
        let message = '';
        let tokens = [];
        let suggestions = [];
        let error = 0;

        message = document.getElementById('textualMessage').innerText;
        $('#textualMessage').empty();

        // Split Message
        tokens = message.split(" ");

        message = '';
        
        // Check Spelling
        for (t=0; t < tokens.length; t++)
        {
            // Determine whether word contains a fullstop
            if (tokens[t].endsWith('.'))
            {
                // remove fullstop
                tokens[t] = tokens[t].substring(0,tokens[t].length-1);
            }

            // Determine whether the word is banned
            if (app.isBannedWord(tokens[t]))
            {
                // Banned word
                message = message + '<span class="message_font" style="color: red">'
                message = message + ('<strike>' + tokens[t].trim() + '</strike> </span>');
            }
            else
            {
                // Not banned - check for spelling errors
                if (!app.dictionary.check(tokens[t]))
                {
                    // spelling errors detected
                    message = message + '<span class="message_font" style="color: lightcoral">';
                    
                    // Determine whether error is currently selected
                    if (error === app.textualFragments.selected)
                    {
                        // selected
                        message = message + ('<u style="text-decoration-color: black;">' + tokens[t].trim() + '</u> ');
                        suggestions = app.dictionary.suggest(tokens[t]);
                    }
                    else
                    {
                        // not selected
                        message = message + (tokens[t] + ' ');
                    }
                    message = message + '</span>'

                    error = error + 1;

                    if (update_errors)
                    {
                        app.textualFragments.errors.push(tokens[t].trim());
                    }
                }
                else
                {
                    message = message + (tokens[t] + ' ');
                }
            }
        }

        app.textualFragments.error_count = app.textualFragments.errors.length;

        // Update Textual Message
        $('#textualMessage')
            .html(`<span class="message_font" style="color: black">${message.trim()}.</span>`);

        $('#textualNext').prop('disabled', !(app.textualFragments.selected < (app.textualFragments.error_count-1)));
        $('#textualPrevious').prop('disabled', !(app.textualFragments.selected >  0));
        
        // Update Suggestions
        $('#textualSuggestions').empty();

        for (s = 0; s< suggestions.length; s++)
        {
            $('#textualSuggestions')
                    .append(`<li class="list_font" id="suggestion_${s}">${suggestions[s]}</li>`);
        } 

        app.setEndOfContenteditable (document.querySelector('#textualMessage'));
    },

    /**
     *  Correct the spelling of the selected word
     *
     * @param {string} correction
     */
    correctSpelling: function (correction)
    {
        let message = '';
        let selected  = app.textualFragments.selected;
        let regex = '';

        message = document.getElementById('textualMessage').innerText;

        if (selected < app.textualFragments.errors.length)
        {
            regex= new RegExp('\\b' + app.textualFragments.errors[selected] + '\\b');
        }

        if (correction.length > 0 && regex)
        {
            message = message.replace(regex, correction);

            $('#textualMessage')
                .html(`<span class="message_font" style="color: black">${message} </span>`);
            app.textualFragments.errors = [];
            app.textualFragments.selected = 0;
            app.textualFragments.error_count = 0;
            app.spellCheckTextualMessage(true);
        }
    },

    /**
     * Determine whether the word is banned
     *
     * @param {string} word - the word to check
     * @returns true or false
     */
    isBannedWord: function(word)
    {
       // Search banned word list
        for (b=0; b < app.banned_words.length; b++)
        {
            if (word.trim().toLowerCase() === app.banned_words[b])
            {
                return true;
            }
        }

        return false;
    },


    /**
     *  Read a text file from the local area
     *
     * @param {string} filePath - the file to load
     */
    readTextFile: function (filePath){
        let rawFile = new XMLHttpRequest();
        rawFile.open("GET", filePath , true);
        rawFile.send(null);

        rawFile.onreadystatechange = function (){
            if(rawFile.readyState === 4){
                if(rawFile.status === 200 || rawFile.status === 0){
                    app.banned_words = 
                        rawFile.responseText.toLowerCase().split("\n");
                }
            }
        }     
    },

    /**
     * Set the cursor to the end of the editable text area
     *
     * @param {element} contentEditableElement - the editable text area
     */
    setEndOfContenteditable: function (contentEditableElement)
    {
        let range,selection;
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange();
            range.selectNodeContents(contentEditableElement);
            range.collapse(false);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
        else if(document.selection)//IE 8 and lower
        { 
            range = document.body.createTextRange();
            range.moveToElementText(contentEditableElement);
            range.collapse(false);
            range.select();
        }
    },

    /**
     * Updates the selected station list in the modal
     *
     */
    updateStationList: function ()
    {
        let station_list = [];
        let id = 0;
        $('#selectedStationList').empty();

        // Get station list
        station_list = app.stationFragmentList[app.current_map_display];

        // Determine whethet the list contains any stations
        if (station_list.length > 0)
        {
            $('#selectedStationList').html(`<ul class="message_font" style="margin: 0px">`);

            // Add stations
            for (let s=0; s < station_list.length; s++)
            {
                id = station_list[s];

                $('#selectedStationList')
                    .append(`<li>${app.getFragmentText(id)}</li>`);
            }

            $('#selectedStationList')
                    .append(`</ul>`);
        }
    },

    /**
     * Displays the station map modal
     *
     * @param {number} display_state - 1:single or 2:multi selectionm
     * @param {*} index - The detail type index
     */
    displayStationMap: function  (display_state, index)
    {
        let x1 = 0;
        let y1 = 0;
        let x2 = 0;
        let y2 = 0;
        let scale = (app.station_image_scale / 100);
        let station_name = '';
        let id = 0;

        app.current_map_display = index;
        app.previousStationFragmentList = app.stationFragmentList[app.current_map_display].concat();
        app.updateStationList();

        $('#stationImage')
            .html(`<img src="/img/${app.lineImage}" alt="stationselection" id="station" usemap="#stationMap">`);
            
        $('#stationAreas').empty();

        if (app.stations)
        {
            for (s=0; s < app.stations.length; s++)
            {
                x1 = (app.stations[s].coordinates.xpos * scale);
                y1 = (app.stations[s].coordinates.ypos * scale);
                x2 = x1 + (app.stations[s].coordinates.width * scale);
                y2 = y1 + (app.stations[s].coordinates.height * scale);

                station_name = app.stations[s].station_name;
                id = app.stations[s].fragment_id;
                
                if (display_state === MapDisplayStates.multi_selection)
                {
                    $('#stationAreas').
                        append (`<area shape="rect" coords="${x1},${y1},${x2},${y2}" 
                            alt="${station_name}" onclick="stationClicked(this)" id="stationArea_${id}" title="${station_name}">`);
                }
                else
                {
                    $('#stationAreas').
                        append (`<area shape="rect" coords="${x1},${y1},${x2},${y2}" 
                            alt="${station_name}" onclick="stationClicked(this)" data-dismiss="modal" id="stationArea_${id}" title="${station_name}">`);
                }
            }
        }
    },

    /**
     * Resets the Library Browser Panels
     *
     */
    resetLibraryBrowser: function()
    {
        // Disable browser buttons
        $('#browserDelete').prop('disabled', true);
        $('#browserSave').prop('disabled', true);
        $('#browserPreview').prop('disabled', true);
        $('#libraryMessage').empty();

        $('#libraryMessageList').empty();
        $('#libraryMessageList1').empty();

        app.playlistMessages.selected = 0;

        app.updatePlaylist(PL_PARENT_TYPE, PL_Level.level_1);
    },

    /**
     * Updates the Play List
     *
     * @param {number} parent - the play list parent
     * @param {number} level - the play list panel
     */
    updatePlaylist: function (parent, level)
    {
        let category = '';
        let categoryList = [];
        let duration = 0;
        let message = '';
        let messageList = [];
        let messageText = '';
        let panel = null;
        let icon_style = 'fas';

        // Disable browser buttons
        $('#browserDelete').prop('disabled', true);
        $('#browserSave').prop('disabled', true);
        $('#browserPreview').prop('disabled', true);
        $('#libraryMessage').empty();

        // Determine which panel to display the list
        switch (level)
        {
            case PL_Level.level_1:
                panel = document.getElementById('libraryTypeList');
                break;
            case PL_Level.level_2:
                panel = document.getElementById('libraryMessageList');
                break;
            case PL_Level.level_3:
                panel = document.getElementById('libraryMessageList1');
                break;
            default:
                panel = null;
                break;
        }

        // Get the categories for the parent
        for (category of app.playlistCategories)
        {
            if (parseInt(category.parent_id) === parent)
            {
                categoryList.push (category);
            }
        }

        for (message of app.playlistMessages.messages)
        {
            if (parseInt(message.type_id) === parent)
            {
                messageList.push (message);
            }
        }

        // Sort the list of categories
        categoryList = categoryList.sort(app.comparePlaylistCategories);

        // Add the categories to the panel
        if (panel)
        {
            panel.innerHTML = "";
            for (category of categoryList)
            {
                // Set the Icon Style
                icon_style = 'fas';

                if (category.icon_style === 'regular')
                {
                    icon_style = 'far';
                }
                
                panel.innerHTML += 
                       `<li class="d-flex align-items-start list_font pl_cat_item" style="margin-top:10px; margin-bottom: 10px" id="pl_${category.type_id}">
                            <i class="${icon_style} fa-fw fa-2x fa-${category.icon}"></i>
                            <div>
                                <span class="list_font" style="margin-left:5px"><b>${category.type_name}</b></span><br>
                                <span class="list_font_small" style="margin-left:5px">${category.type_description}</span>
                            </div>
                        </li>`;
            }

            for (message of messageList)
            {
                duration = app.getMessageDuration(message.classifier, parseInt(message.message_id));

                // Set the Icon Style
                icon_style = 'fas';

                if (message.icon_style === 'regular')
                {
                    icon_style = 'far';
                }

                message_text = `<li class="d-flex align-items-start list_font pl_msg_item" style="margin-top:5px; margin-bottom: 7px" id="pl_${message.message_id}">
                                    <i class="${icon_style} fa-fw fa-2x fa-${message.icon}"></i>
                                    <div>
                                        <span class="list_font_small" style="margin-left:5px"><b>${message.message_name}</b></span><br>
                                        <span class="list_font_small" style="margin-left:5px">${message.message_description}</span><br>`;
                // Determine whether the duration should be added
                if (message.icon !== TEXT_ICON)
                {
                    message_text += `<span class="list_font_small" style="margin-left:5px">${duration} seconds</span>`;
                }

                message_text += `</div></li>`

                panel.innerHTML += message_text;                  
            }
        }
    },

    /**
     *  Updates the Library Browser Message
     *
     * @param {number} id - The message ID
     */
    updateLibraryBrowser: function (id)
    {
        let message = '';
        let classifier = '';
        let data = [];
        let icon = '';
        let type = 0;

        classifier = app.getPlaylistClassifier(id);
        app.browserFragments = [];
        $('#browserPreview').prop('disabled', false); 

        // Set the data to search
        if (classifier === USER_MULTIPART_CLASSIFIER)
        {
            data = app.multipartMessages;            
        }
        else if (classifier === USER_MRA_CLASSIFIER)
        {
            data = app.mraMessages;
            $('#browserPreview').prop('disabled', true);  
        }
        else
        {
            data = app.completeData;
            app.browserFragments = [id];
        }
        
        
        $('#libraryMessage').empty();
        for (message of data)
        {   
            if (parseInt(message.message_id) === id)
            {
                $('#libraryMessage').append(`<span class="message_font">${message.detail}</span>`);

                // Determine if the message is user created
                if (classifier === USER_MULTIPART_CLASSIFIER)
                {
                    // Get Fragments
                    app.browserFragments = message.fragments;
                }

                icon = message.icon;
                type = parseInt(message.type_id);
                break;
            }
        }

        // Determine whether the message can be deleted
        if (type === USER_TYPE_ID ||
            app.getCategoryParentID(type) === USER_TYPE_ID)
        {
            $('#browserDelete').prop('disabled', false);
        }
        else
        {
            $('#browserDelete').prop('disabled', true);   
        }

        $('#browserSave').prop('disabled', false);
        
    },

    /**
     *  Gets the classifier of the playlist message
     *
     * @param {number} id - The message ID
     * @returns The message classifier
     */
    getPlaylistClassifier: function (id)
    {
        let classifier = '';
        let message = '';

        // Search Data
        for (message of app.playlistMessages.messages)
        {   
            if (parseInt(message.message_id) === id)
            {
                classifier = message.classifier;
                break;
            }
        }

        return classifier;
    },

    /**
     * Gets the Type ID for the playist message
     *
     * @param {number} id - The category ID
     * @returns The message Type ID
     */
    getPlaylistTypeID: function (id)
    {
        let typeId = 0;
        let message = '';

        // Search Data
        for (message of app.playlistMessages.messages)
        {   
            if (parseInt(message.message_id) === id)
            {
                typeId = parseInt(message.type_id);
                break;
            }
        }

        return typeId;
    },

    /**
     * Gets the Parent ID for the category type
     *
     * @param {number} id - The category ID
     * @returns The category Parent ID
     */
    getCategoryParentID: function (id)
    {
        let parent_id = -1;
        let category = '';

        for (category of app.playlistCategories)
        {
            if (parseInt(category.type_id) === id)
            {
                parent_id = parseInt(category.parent_id);
                break;
            }
        }

        return parent_id;
    },


    /**
     * Updates the Play List
     *
     */
    updateQuicklist: function ()
    {
        let message = '';
        let entry = '';
        let duration = 0;
        let icon_style = 'fas';
        let message_text = '';

        $('#quickListList').empty();

        if (app.quickList.messages.length !=0)
        {
            for (entry of app.quickList.messages)
            {  
                message = app.getPlaylistMessage(entry.message_id);
                duration = app.getMessageDuration(message.classifier, parseInt(message.message_id));

                // Set the Icon Style
                icon_style = 'fas';

                if (message.icon_style === 'regular')
                {
                    icon_style = 'far';
                }

                message_text = `<li class="d-flex align-items-start list_font pl_msg_item" style="margin-top:5px; margin-bottom: 7px" id="pl_${message.message_id}">
                                    <i class="${icon_style} fa-fw fa-2x fa-${message.icon}"></i>
                                    <div>
                                        <span class="list_font_small" style="margin-left:5px"><b>${message.message_name}</b></span><br>
                                        <span class="list_font_small" style="margin-left:5px">${message.message_description}</span><br>`;
                // Determine whether the duration should be added
                if (message.icon !== TEXT_ICON)
                {
                    message_text += `<span class="list_font_small" style="margin-left:5px">${duration} seconds</span>`;
                }

                message_text += `</div></li>`

                $('#quickListList').append(message_text);
            }
        }


        app.quickList.selected_id = 0;
        $('#quicklistDelete').prop('disabled', true);
        $('#quicklistEdit').prop('disabled', true);
        $('#quicklistSchedule').prop('disabled', true);
    },

    /**
     *  Gets the duration for the Message
     *
     * @param {string} classifer - The message classifer
     * @param {number} id - The message ID
     * @returns The message durarion
     */
    getMessageDuration: function (classifier, id)
    {
        let message = '';
        let duration = 0;
        let data = [];

        // Set the data to search
        if (classifier === USER_MULTIPART_CLASSIFIER)
        {
            data = app.multipartMessages
        }
        else if (classifier === USER_MRA_CLASSIFIER)
        {
            data = app.mraMessages
        }
        else
        {
            data = app.completeData;
        }

        // Search Data
        for (message of data)
        {   
            if (parseInt(message.message_id) === id)
            {
                duration = parseInt(message.Duration);
                break;
            }
        }

        return duration;
    },

    /**
     *  Gets the requested playlist message
     *
     * @param {number} id - The message ID
     * @returns The complete message
     */
    getPlaylistMessage: function (id)
    {
        let playlistMessage = '';
    
        for (message of app.playlistMessages.messages)
        {   
            if (parseInt(message.message_id) === id)
            {
                playlistMessage = message;
                break;
            }
        }

        return playlistMessage;
    },

    /**
     *  Gets the requested playlist message index
     *
     * @param {number} id - The message ID
     * @returns The message index
     */
    getPlaylistMessageIndex: function (id)
    {
        let index = -1;
        let m = 0;
    
        for (m = 0; m < app.playlistMessages.messages.length; m++)
        {   
            if (parseInt(app.playlistMessages.messages[m].message_id) === id)
            {
                index = m;
                break;
            }
        }

        return index;
    },

    /**
     *  Gets the requested multipart message index
     *
     * @param {number} id - The message ID
     * @returns The message index
     */
    getMultiPartMessageIndex: function (id)
    {
        let index = -1;
        let m = 0;
    
        for (m = 0; m < app.multipartMessages.length; m++)
        {   
            if (parseInt(app.multipartMessages[m].message_id) === id)
            {
                index = m;
                break;
            }
        }

        return index;
    },

    /**
     *  Gets the requested MRA message index
     *
     * @param {number} id - The message ID
     * @returns The message index
     */
    getMraMessageIndex: function (id)
    {
        let index = -1;
        let m = 0;
    
        for (m = 0; m < app.mraMessages.length; m++)
        {   
            if (parseInt(app.mraMessages[m].message_id) === id)
            {
                index = m;
                break;
            }
        }

        return index;
    },

    /**
     *  Gets the requested Quicklist message index
     *
     * @param {number} id - The message ID
     * @returns The message index
     */
    getQuicklistMessageIndex: function (id)
    {
        let index = -1;
        let m = 0;
    
        for (m = 0; m < app.quickList.messages.length; m++)
        {   
            if (parseInt(app.quickList.messages[m].message_id) === id)
            {
                index = m;
                break;
            }
        }

        return index;
    },

    /**
     *  Gets the fragment text
     *
     * @param {number} id - the fragment id
     * @returns The fragment text
     */
    getFragmentText: function(id)
    {
        let text = '';
        let message = '';
       
        for (message of app.completeFragmentData)
        {
            if (parseInt(message.section_id) === parseInt(id))
            {
                text = message.message_name.trim();
                break;
            }
        }

        return text;
    },

    /**
     *  Gets the fragment section position
     *
     * @param {number} id - the fragment id
     * @returns The fragment section position
     */
    getFragmentSectionPosition: function(id)
    {
        let section = '';
        let message = '';
       
        for (message of app.completeFragmentData)
        {
            if (parseInt(message.section_id) === parseInt(id))
            {
                section = message.section_position.toUpperCase();
                break;
            }
        }

        return section;
    },


    /**
     *  Gets the fragment duration
     *
     * @param {number} id - the fragment id
     * @returns The fragment duration
     */
    getFragmentDuration: function(id)
    {
        let duration = 0;
        let message= '';
       
        for (message of app.completeFragmentData)
        {
            if (parseInt(message.section_id) === parseInt(id))
            {
                duration = parseInt(message.Duration);
                break;
            }
        }

        return duration;
    },

    /**
     *  Clears the Message Assembly Panel
     *
     */
    clearMessageAssemblyPanel: function()
    {
        $('#messageAssembly').empty();

        // Clear Assembled Data
        app.assembledFragments.selected = 0;
        app.assembledFragments.fragments = [];
        app.assembledFragments.duration = 0;
        app.assembledFragments.text = ''

        $('#assemblyNext').prop('disabled', true);
        $('#assemblyDelete').prop('disabled', true);
        $('#assemblyPrevious').prop('disabled', true);
        $('#assemblyClear').prop('disabled', true);
        $('#previewClick').prop('disabled', true);
    },

    /**
     *  Clears the Text Only Message Panel
     *
     */
    clearTextOnlyMessagePanel: function()
    {
        $('#textualMessage').empty();
        app.textualFragments.selected = 0;
        app.textualFragments.error_count = 0;
        app.textualFragments.errors = [];
        app.textualFragments.fragments = [];

        app.updateTextualMessageLength();

        $('#textualNext').prop('disabled', true);
        $('#textualPrevious').prop('disabled', true);
        $('#textualClear').prop('disabled', true);
        $('#textualSave').prop('disabled', true);

        $('#textualSuggestions').empty();
    },


    /**
     * Update the save folders on the panel
     *
     */
    updateSaveFolderList: function()
    {
        let category = '';

        app.selected_save_type = 0;

        $('#saveFolders').empty();

        // Update Save Modal Folder List
        for (category of app.playlistCategories)
        {
            if (parseInt(category.parent_id) === USER_TYPE_ID &&
                category.icon === FOLDER_ICON)
            {
                $('#saveFolders').append( 
                       `<li class="d-flex align-items-start list_font pl_cat_item" style="margin-top:10px; margin-bottom: 10px" id="pl_${category.type_id}">
                            <i class="far fa-fw fa-2x fa-${category.icon}"></i>
                            <div>
                                <span class="list_font" style="margin-left:5px">${category.type_name}</span><br>
                                <span class="list_font_small" style="margin-left:5px">${category.type_description}</span>
                            </div>
                        </li>`);
            }
        }
    },

    /**
     * Resets the form controls of the save modal
     *
     */
    resetSaveModal: function()
    {
        $('#saveQuicklist').removeClass('active');
        $('#saveTitle').val("");
        $('#saveDescription').val("");
        app.updateSaveFolderList();
    }
};

/*-----------------------------------------------------------------------------
  Functions to load additional HTML files
-------------------------------------------------------------------------------*/
$(function(){
    $("#footer").load("html/footer.html");
});

$(function(){
    $("#header").load("html/header.html");
});

$(function(){
    $("#selectionpanels").load("html/selectionpanels.html");
});

$('#textonlypanel').load('html/textonlypanel.html', function() {
    app.updateTextualMessage();
});

$('#messageassemblypanel').load('html/messageassemblypanel.html', function() {
    app.updateMessageAssembler();
});

$('#libraryPanel').load('html/library.html', function() {
    app.updatePlaylist(PL_PARENT_TYPE, PL_Level.level_1);
});

$('#quicklistpanel').load('html/quicklistpanel.html', function() {
    app.updateQuicklist();
});






