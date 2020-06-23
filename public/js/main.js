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
const FILTER_ALL = '.*';
const LINE_FRAGMENT = 7000;
const MapDisplayStates = Object.freeze({"no_map": 0, "single_selection": 1, "multi_selection":2});
const ReasonStates = Object.freeze({"no_reason":0, "post":1, "pre":2});
const SPELLING_INTERVAL = 2000;  //time in ms (2 seconds)
const STATION_FRAGMENT = 7001;
const STATION_FRAGMENT_LIST = 7002;
const TICKET_FRAGMENT_LIST = 7003;
const TOTAL_MESSAGE_LENGTH = 254;

/*-----------------------------------------------------------------------------
  Global Variables
-------------------------------------------------------------------------------*/
var applicationName ='';
var assembledFragments = {fragments: [], selected: 0};
var banned_words = {fragments: []};
var builderFragments = [];
var completeFragmentData = [];
var currentName ='';
var currentRole ='';
var current_map_display = 0;
var detailFragments = [[],[],[],[]];
var dictionary = new Typo( "en_GB" );
var directionFragment = 0;
var direction_position = 0;
var disruptionDetailIds = [];
var disruptionFragment = [];
var disruptionText = '';
var error_messages = [];
var fragmentText = [];
var html_loaded = false;
var initialLine = 0;
var lineButton = '';
var lineFragment = 0;
var lineImage = 0;
var lineText ='';
var map_display_state = 0;
var preambleFragment =0;
var preambleText ='';
var preamble_loaded = false;
var previewEvent = null;
var previousStationFragmentList = []; 
var reasonFragment = 0; // The current selected reason fragment
var reasonFragments = [];   //The current list of reasons
var reason_position = 0;
var spellingTimer;   //timer identifier
var start_disruption_fragments = [];
var start_disruption_id = 0;
var start_preamble_fragment = 0;
var start_preamble_id = 0;
var stationFragmentList = [[],[],[]]; 
var station_image_scale = 0;
var stations = [];  // Array of Line Stations
var textualFragments = {fragments: [], selected: 0, error_count: 0, errors: []};
var ticketFragments = [];
var ticketFragmentList = [];
var version = '';

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
    updateTextualMessage();
});

$('#messageassemblypanel').load('html/messageassemblypanel.html', function() {
    updateMessageAssembler();
});

/**
 *  Initialise the Application
 */
function initialise()
{
    readTextFile("/dictionaries/bannedwords.dic");
    resetInitialApplicationStates();
}

/**
 * Reset the initial states of the Application
 */
function resetInitialApplicationStates()
{
    resetDisruptionButtons();
    resetPreambleButtons();
    resetReasonButtons();
    resetDetailButtons();
    resetDirectionButtons();
    resetTicketOptions();

    updateMessagePanels();
}
/**
 * Reset the active states of the disruption buttons
 */
function resetDisruptionButtons()
{
    var buttons = document.querySelectorAll('.disruption');
    var button_name = '';
    var button_id = 0;

    disruptionFragment = [];

     // Set Button States
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
        buttons[b].classList.remove('active');
        
        if (start_disruption_id == button_id && 
            start_disruption_id !=0)
        {
            buttons[b].classList.add('active');
            disruptionFragment = start_disruption_fragments;
        }
    }
}

/**
 * Reset the active states of the Preamble buttons
 */
function resetPreambleButtons()
{
    var buttons = document.querySelectorAll('.preamble');
    var button_name = '';
    var button_id = 0;

   preambleFragment = 0;

    // Set Button States
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
        
        buttons[b].classList.remove('active');
        
        if (start_preamble_id == button_id && 
            start_preamble_id !=0)
        {
            buttons[b].classList.add('active');
            preambleFragment = start_preamble_fragment;
        }
    }
}
/**
 * Reset the active and enabled states of the Reason buttons
 */
function resetReasonButtons()
{
    var buttons = document.querySelectorAll('.reason');
    var button_name = '';
    var button_id = 0;

    reasonFragment = 0;

    if ($('#reasonSelectedList').contents().length == 0)
    {
        filterReasons(FILTER_ALL);
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
}

/**
 * Reset the active states of the Detail buttons
 */
function resetDetailButtons()
{
    var buttons = document.querySelectorAll('.detail');
    var button_name = '';
    var button_id = 0;

   detailFragments[DetailIndex.detail] = [];

    // Set Button States
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
        
        buttons[b].classList.remove('active');
        buttons[b].disabled = true;
    }

    buttons = document.querySelectorAll('.detail_1');

    detailFragments[DetailIndex.detail_1] = [];

    // Set Button States
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
        
        buttons[b].classList.remove('active');
        buttons[b].disabled = true;
    }

    buttons = document.querySelectorAll('.additional_detail');
    detailFragments[DetailIndex.additional_detail] = [];

    // Set Button States
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
        
        buttons[b].classList.remove('active');
        buttons[b].disabled = true;
    }

    buttons = document.querySelectorAll('.rest');
    detailFragments[DetailIndex.rest_of_line] = [];

    // Set Button States
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
        
        buttons[b].classList.remove('active');
        buttons[b].disabled = true;
    }


    $('#detailClear').prop('disabled', true);
    $('#detail_1_clear').prop('disabled', true);
    $('#additional_detail_clear').prop('disabled', true);
    $('#rest_of_line_clear').prop('disabled', true);
}


function resetDirectionButtons()
{
    var buttons = document.querySelectorAll('.direction');
    var button_name = '';
    var button_id = 0;

   directionFragment = 0;

    // Set Button States
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
        
        buttons[b].classList.remove('active');
        buttons[b].disabled = true;
    }

    $('#directionClear').prop('disabled', true);
}

function resetTicketOptions()
{
    $('#ticketClear').prop('disabled', true);

    $('.ticket_item').each(function()   {
        $(this).css('background-color', '#e9ecef');
        $(this).css('color', 'black');
        $(this).addClass('ticket_disabled');
    })

    ticketFragmentList = [];
}

function resetLineButton()
{
    var button_name = '';
    var button_id = 0;

    $('.line').each(function()   {
        button_name = $(this).attr('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
       
        if (button_id == initialLine)
        {
            $(this).trigger('click');
        }
    })
}

/**
 * Updates all of the message panels
 */
function updateMessagePanels()
{
    compileFragments(assembledFragments);
    updateMessageAssembler();
    compileFragments(textualFragments);
    updateTextualMessage();
    compileFragments(builderFragments);
    updateBuilderMessage();
}

    
/**
 * Compiles the fragments for display and preview
 * 
 * @param  {} fragments - The fragment store
 */
function compileFragments(fragments)
{
    var f = 0;
    var last_token = '';
    var reason_text = '';
    var s = 0;
    var station_fragment_used = 0;
    var t = 0;
    var token_arr = [];

    fragments.fragments = [];
    
    //Preamble
    if (preambleFragment !=0)
    {
       fragments.fragments.push(preambleFragment);
    }

    // Determine whether the reason should be displayed before the disruption
    if (reason_position == ReasonStates.pre &&
        reasonFragment != 0)
    {
        fragments.fragments.push(reasonFragment);
        reason_text = fragmentText[reasonFragment];
    }

    // Disruption
    for (f=0; f<disruptionFragment.length; f++)
    {
        if (disruptionFragment[f] == LINE_FRAGMENT)
        {
            // Determine whether a direction has been set
            if (directionFragment)
            {
                if (direction_position == DirectionTextPosition.post &&
                    !disruptionFragment.includes(STATION_FRAGMENT))
                {
                    fragments.fragments.push(lineFragment);
                    fragments.fragments.push(directionFragment);
                }
                else if (direction_position == DirectionTextPosition.pre)
                {
                    fragments.fragments.push(directionFragment);
                    fragments.fragments.push(lineFragment);
                }
                else
                {
                    fragments.fragments.push(lineFragment);
                }
            }
            else
            {
                fragments.fragments.push(lineFragment);
            }
        }
        else if (disruptionFragment[f] == STATION_FRAGMENT)
        {
            if (stationFragmentList[DetailIndex.detail].length >0)
            {
                fragments.fragments.push(stationFragmentList[DetailIndex.detail][0]);
            }

            // Determine whether a direction has been set
            if (directionFragment && direction_position == DirectionTextPosition.post)
            {
                fragments.fragments.push(directionFragment);
            }

            station_fragment_used = 1;
        }
        else
        {
            fragments.fragments.push(disruptionFragment[f]);
        }
    }

    // Details 1
    if (detailFragments[DetailIndex.detail_1].length > 0)
    {
        for (f=0; f < detailFragments[DetailIndex.detail_1].length; f++)
        {
            if (detailFragments[DetailIndex.detail_1][f] == STATION_FRAGMENT_LIST)
            {
                for (s=0; s < stationFragmentList[DetailIndex.detail_1].length; s++)
                {
                    // Determine whethere station is the last in the list
                    if ((s+1) == stationFragmentList[DetailIndex.detail_1].length && s != 0)
                    {
                        fragments.fragments.push(AND_FRAGMENT);
                    }

                    fragments.fragments.push(stationFragmentList[DetailIndex.detail_1][s]);
                }
            }
            else
            {
                fragments.fragments.push(detailFragments[DetailIndex.detail_1][f]);
            }
        }
    }

    // Additional Detail Fragments
    if (detailFragments[DetailIndex.additional_detail].length > 0)
    {
        for (f=0; f < detailFragments[DetailIndex.additional_detail].length; f++)
        {
            if (detailFragments[DetailIndex.additional_detail][f] == STATION_FRAGMENT_LIST)
            {
                for (s=0; s < stationFragmentList[DetailIndex.additional_detail].length; s++)
                {
                    // Determine whethere station is the last in the list
                    if ((s+1) == stationFragmentList[DetailIndex.additional_detail].length && s != 0)
                    {
                        fragments.fragments.push(AND_FRAGMENT);
                    }

                    fragments.fragments.push(stationFragmentList[DetailIndex.additional_detail][s]);
                }
            }
            else
            {
                fragments.fragments.push(detailFragments[DetailIndex.additional_detail][f]);
            }
        }
    }

    // Reason
    if (reason_position == ReasonStates.post &&
        reasonFragment != 0)
    {
        fragments.fragments.push(reasonFragment);
        reason_text = fragmentText[reasonFragment];

        //Split reason text into tokens
        token_arr = reason_text.split(' ');
        last_token = token_arr.pop();
    }

    // Details
    if (station_fragment_used == 0 || !detailFragments[DetailIndex.detail].includes(STATION_FRAGMENT)) 
    {
        for (f=0; f<detailFragments[DetailIndex.detail].length; f++)
        {
            if (detailFragments[DetailIndex.detail][f] == STATION_FRAGMENT)
            {
                if (stationFragmentList[DetailIndex.detail].length > 0)
                {
                    fragments.fragments.push(stationFragmentList[DetailIndex.detail][0]);
                }
            }
            else
            {
                if (fragmentText[detailFragments[f]] != last_token)
                {
                    fragments.fragments.push(detailFragments[DetailIndex.detail][f]);
                }
            }
        }
    }

    // Rest Of Line
    if (detailFragments[DetailIndex.rest_of_line].length > 0)
    {
        for (f=0; f < detailFragments[DetailIndex.rest_of_line].length; f++)
        {
            fragments.fragments.push(detailFragments[DetailIndex.rest_of_line][f]);
        }
    }

    // Tickets
    if (ticketFragments.length > 0 && ticketFragmentList.length > 0)
    {
        for (f=0; f < ticketFragments.length; f++)
        {
            if (ticketFragments[f] == TICKET_FRAGMENT_LIST)
            {
                for (t=0; t < ticketFragmentList.length; t++)
                {
                    // Determine whethere station is the last in the list
                    if ((t+1) == ticketFragmentList.length && t != 0)
                    {
                        fragments.fragments.push(AND_FRAGMENT);
                    }

                    fragments.fragments.push(ticketFragmentList[t]);
                }
            }
            else
            {
                fragments.fragments.push(ticketFragments[f]);
            }
        }
    }



    fragments.selected = 0;
}
/**
 * Updates the Message in the Message Assembler panel
 */
function updateMessageAssembler()
{
    var id = 0;

    $('#messageAssembly')
                    .html(`<span class="message_font">`);

    for (var f=0; f < assembledFragments.fragments.length; f++)
    {
        id = assembledFragments.fragments[f];
        if (f == assembledFragments.selected)
        {
            $('#messageAssembly')
                    .append(`<u>${fragmentText[id]}</u> | `);
        }
        else
        {
            $('#messageAssembly')
                    .append(`${fragmentText[id]} | `);
        }
    }

    if (assembledFragments.selected >= assembledFragments.fragments.length)
    {
        $('#messageAssembly')
                    .append(`<u>|</u>`);
    }

    $('#messageAssembly')
                    .append(`</span>`);

    updateAssemblyButtons();             
}

/**
 * Updates the Message in the Textual Message panel
 */
function updateTextualMessage()
{
    var id = 0;
    var message = '';

    $('#textualMessage').empty();
    
    for (var f=0; f < textualFragments.fragments.length; f++)
    {
        id = textualFragments.fragments[f];
        message = message + fragmentText[id] + ' ';
    }

    $('#textualMessage').html(`<span class="message_font">${message.trim()}.</span>`);

    updateTextualMessageLength();
    updateTextualButtons();  
    
    textualFragments.error_count = 0;
    textualFragments.errors = [];

    // Empty the suggestions list
    $('#textualSuggestions').empty();

}
/**
 * Updates the textual message length 
 */
function updateTextualMessageLength()
{
    var message = '';
    var contents = '';
    var message_length = 0;
    var char_remaining = 0;

    if(document.getElementById("textualMessage") != null)
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
}

/**
 * Updates the Message in the Message Assembler panel
 */
function updateBuilderMessage()
{
    var id = 0;
    var message = '';

    $('#builderCompleteMessage').empty();
    
    for (var f=0; f < builderFragments.fragments.length; f++)
    {
        id = builderFragments.fragments[f];
        message = message + fragmentText[id] + ' ';
    }

    $('#builderCompleteMessage').html(`<span class="builder_message_font">${message.trim()}.</span>`);      
    
    updateBuilderMessageButtons();
}

/**
 * Updates the message assembly control buttons
 */
function updateAssemblyButtons()
{
    // Determine whether the assembler contains a message
    if  (assembledFragments.fragments.length > 0)
    {
        // Update previous and next
        $('#assemblyPrevious').prop('disabled', 
            (assembledFragments.selected == 0));
        
        $('#assemblyNext').prop('disabled', 
            (assembledFragments.selected == assembledFragments.fragments.length));

        // Enable control buttons

        if (assembledFragments.selected < assembledFragments.fragments.length)
        {
            $('#assemblyDelete').prop('disabled', false);
        }
        else
        {
            $('#assemblyDelete').prop('disabled', true);
        }
        $('#assemblyClear').prop('disabled', false);
        $('#previewClick').prop('disabled', false);
    }
    else
    {
        // No message - disable all buttons
        $('#assemblyNext').prop('disabled', true);
        $('#assemblyDelete').prop('disabled', true);
        $('#assemblyPrevious').prop('disabled', true);
        $('#assemblyClear').prop('disabled', true);
        $('#previewClick').prop('disabled', true);
    }
}
/**
 * Updates the textual message control buttons
 */
function updateTextualButtons()
{
    // Determine whether a message is being displayed
    if  (textualFragments.fragments.length > 0)
    {
        // Enable clear button
        $('#textualClear').prop('disabled', false);
    }
    else
    {
        // No message - disable all buttons
        $('#textualNext').prop('disabled', true);
        $('#textualPrevious').prop('disabled', true);
        $('#textualClear').prop('disabled', true);
    }
}

/**
 * Updates the textual message control buttons
 */
function updateBuilderMessageButtons()
{
    // Determine whether the builder contains a message
    if  (builderFragments.fragments.length > 0)
    {
        // Enable control buttons
        $('#builderClear').prop('disabled', false);
        $('#builderPreview').prop('disabled', false);
    }
    else
    {
        // No message - disable all buttons
        $('#builderClear').prop('disabled', true);
        $('#builder').prop('disabled', true);
    }
}

/**
 * Preview the message in the message audibly
 *
 * @param {array} fragments - the message fragments
 */
function previewSound(fragments)
{
    var file_names=[];

    // Build Play List
    for (var f=0; f < fragments.length; f++)
    {
        if (fragments[f] < LINE_FRAGMENT && fragments[f] !=0)
        {
            file_names[f] = '/media/WavFiles/' + fragments[f] + '.wav';
        }
    }

    playSound(file_names);
}
/**
 * Play the audio files in the play list
 * 
 * @param  {} file_names - the audio playlist
 */
function playSound(file_names) {
    var sound = new Howl({
        src: [file_names[0]],
        
        // When the current audio file has finished
        onend: function() {
            file_names.shift();

            // determine whether any more files are left to play
            if (file_names.length > 0) {
                // play next file
                playSound(file_names);
            }
            else
            {
                // No more files - enable preview button
                if (previewEvt)
                {
                    $(previewEvt.target).prop('disabled',false);
                    previewEvent = null;
                }
            }
        }
    });      
    sound.play();
}

/**
 *  Generates text from the fragment elements
 *
 * @param {array} fragmentElements - the fragment elements
 * @returns {string} returns the generated text
 */
function generateFragmentText(fragmentElements)
{
    var text = '';

    // Add each element to the text
    for (f = 0; f <fragmentElements.length; f++)
    {
        // Add seperator
        if (f != 0)
        {
            text = text + ' | ';
        }

        // Determine whether the fragment is the line fragment
        if (fragmentElements[f] == LINE_FRAGMENT)
        {
            // add line text
            text = text + '{line}'
        }
        else
        {
            // add fragment text
            text = text + fragmentText[fragmentElements[f]];
        }
    }

    return text;
}

/**
 * Filters the reasons using the search criteria
 *
 * @param {string} searchText - the search criteria
 */
function filterReasons(searchText)
{
    var filterArray = [];

    // Find Fragments based on search criteria
    for(var f=0; f < reasonFragments.length; f++) 
    { 
        var id = reasonFragments[f];
        if (fragmentText[id].toLowerCase().includes(searchText) ||
            fragmentText[id].toLowerCase().match(searchText))
        {
            filterArray.push({id: `${id}`, text: `${fragmentText[id]}`});
        }
    }

    // Sort Array
    filterArray.sort(compareFragments);

    //Add fragments to list
    for(f=0; f < filterArray.length; f++) 
    { 
        if (f==0)
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
}

/**
 * Filters the reasons using the search criteria
 *
 * @param {string} searchText - the search criteria
 */
function filterFragmentData(searchText)
{
    var filterArray = [];

    $('#fragmentArea').empty();

    // Find Fragments based on search criteria
    for(var f=0; f < completeFragmentData.length; f++) 
    { 
        if (String(completeFragmentData[f].detail).toLowerCase().startsWith(searchText) ||
            String(completeFragmentData[f].detail).toLowerCase().match(searchText))
        {
            filterArray.push(completeFragmentData[f]);
        }
    }

    console.log(filterArray);

    
    // Sort Array
    // filterArray.sort(compareFragments);

    //Add fragments to list
    for(f=0; f < filterArray.length; f++) 
    { 
        $('#fragmentArea')
                .append(`<li class="fragment_list_font fragment_item" id="fragment_${filterArray[f].section_id}">
                ${filterArray[f].vid_text} (${String(filterArray[f].section_position).toUpperCase()})<br>
                <span class="fragment_list_small_font">${filterArray[f].detail}</span><br><br></li>`);
    }      
}

/**
 * Compares the two elements 
 *
 * @param {string} a - element a
 * @param {string} b - element a
 * @returns {number} -1 if a < b; 1 if a > b; 0 if a= b
 */
function compareFragments( a, b ) {
    // determine if a < b
    if ( a.text < b.text ){
      return -1;
    }
    // determine if a > b
    if ( a.text > b.text){
      return 1;
    }
    // a= b
    return 0;
}

/**
 *  Updates the application status bar
 *
 */
function updateStatusBar()
{
    updateStatusApplicationData();
    getDateAndTime();
    
}

function updateStatusApplicationData()
{
    $('#applicationDetails')
        .html(`<span class="status_font">${applicationName}<br><span>
            <span class="status_font">Version: ${version}<span>`);
}

function updateStatusUserName()
{
    $('#userDetails')
        .html(`<span class="status_font">${currentUser}<br></span>
              <span class="status_font"><${currentRole}></span>`);
}

function getDateAndTime()
{
    var dt = new Date();
    var current_data = dt.toLocaleDateString('en-uk', {  weekday: 'long' }) + ' ' +
    dt.getDate() + ' ' + dt.toLocaleDateString('en-uk', {  month: 'long' }) + ' ' + dt.getFullYear();
    var current_time = dt.toLocaleTimeString();
    document.getElementById("currentdate").innerHTML = current_data;
    document.getElementById("currenttime").innerHTML =  current_time; 
    var t = setTimeout(getDateAndTime, 500);
}

function updateDetailButtons(button_list)
{
    var buttons = [];
    var button_name = '';
    var button_id = 0;
    
    // Detail Buttons
    buttons = document.querySelectorAll('.detail');
    
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = parseInt(button_name.substr(button_name.indexOf('_') + 1),10);

        // Determine whether the button should be disabled
        if (button_list.detail.includes(button_id))
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
                detailFragments[DetailIndex.detail] = [];
                stationFragmentList[DetailIndex.detail] = [];
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
        if (button_list.detail_1.includes(button_id))
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
                detailFragments[DetailIndex.detail_1] = [];
                stationFragmentList[DetailIndex.detail_1] = [];
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
        if (button_list.additional.includes(button_id))
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
                detailFragments[DetailIndex.additional_detail] = [];
                stationFragmentList[DetailIndex.additional_detail] = [];
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
        if (button_list.rest.includes(button_id))
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
                detailFragments[DetailIndex.rest_of_line] = [];
                $('#rest_of_line_clear').prop('disabled', true);
            }
        }
    }
}

function updateDirectionButtons(state)
{
    var buttons = [];

    // Determine whether the clear button should be disabled
    if (state == 0)
    {
        $('#directionClear').prop('disabled', true);
    }

    // Detail Buttons
    buttons = document.querySelectorAll('.direction');

    for (b = 0; b<buttons.length; b++)
    {
        // Determine whether the button should unselected
        if (state == 0 && buttons[b].classList.contains('active'))
        {
            buttons[b].classList.remove('active');
            directionFragment = 0;
        }
        buttons[b].disabled = !state;
    }
}


function updateTicketList(state)
{
    // Determine whether the clear button should be disabled
    if (state == 0)
    {
        // Disable Clear Button
        $('#ticketClear').prop('disabled', true);

        // Remove Selections
        $('.ticket_item').each(function()   {
            $(this).css('background-color', '#e9ecef');
            $(this).css('color', 'black');
        })
    
        ticketFragmentList = [];
    }

    $('.ticket_item').each(function()   {

        // Determine whether the list item should be enabled
        if (state == 0)
        {
            $(this).addClass('ticket_disabled');
        }
        else
        {
            $(this).removeClass('ticket_disabled');
        }
    })
}

function onTextualMessageEdit()
{
    textualFragments.error_count = 0;
    textualFragments.errors = [];
    textualFragments.selected = 0;
    spellCheckTextualMessage(true);
}

function spellCheckTextualMessage(update_errors)
{
    var message = '';
    var tokens = [];
    var suggestions = [];
    var error = 0;

    message = document.getElementById('textualMessage').innerText;
    $('#textualMessage').empty();

    // Split Message
    tokens = message.split(" ");

    message = '';
    
    // Check Spelling
    for (t=0; t < tokens.length; t++)
    {
        if (tokens[t].endsWith('.'))
        {
            tokens[t] = tokens[t].substring(0,tokens[t].length-1);
        }
        if (isBannedWord(tokens[t]))
        {
            message = message + '<span class="message_font" style="color: red">'
            message = message + ('<strike>' + tokens[t].trim() + '</strike> </span>');
        }
        else
        {
            if (!dictionary.check(tokens[t]))
            {
                message = message + '<span class="message_font" style="color: lightcoral">';
                if (error == textualFragments.selected)
                {
                    message = message + ('<u style="text-decoration-color: black;">' + tokens[t].trim() + '</u> ');
                    suggestions = dictionary.suggest(tokens[t]);
                }
                else
                {
                    message = message + (tokens[t] + ' ');
                }
                message = message + '</span>'

                error = error + 1;

                if (update_errors)
                {
                    textualFragments.errors.push(tokens[t].trim());
                }
            }
            else
            {
                message = message + (tokens[t] + ' ');
            }
        }
    }

    textualFragments.error_count = textualFragments.errors.length;

    // Update Textual Message
    $('#textualMessage')
        .html(`<span class="message_font" style="color: black">${message.trim()}.</span>`);

    $('#textualNext').prop('disabled', !(textualFragments.selected < (textualFragments.error_count-1)));
    $('#textualPrevious').prop('disabled', !(textualFragments.selected >  0));
    
     // Update Suggestions
    $('#textualSuggestions').empty();

    for (s = 0; s< suggestions.length; s++)
    {
        $('#textualSuggestions')
                .append(`<li class="list_font" id="suggestion_${s}">${suggestions[s]}</li>`);
    } 

    setEndOfContenteditable (document.querySelector('#textualMessage'));
}

function correctSpelling (correction)
{
    var message = '';
    var selected  = textualFragments.selected;
    var regex = '';

    message = document.getElementById('textualMessage').innerText;

    if (selected < textualFragments.errors.length)
    {
        regex= new RegExp('\\b' + textualFragments.errors[selected] + '\\b');
    }

    if (correction.length > 0 && regex)
    {
        message = message.replace(regex, correction);

        $('#textualMessage')
            .html(`<span class="message_font" style="color: black">${message} </span>`);
        textualFragments.errors = [];
        textualFragments.selected = 0;
        textualFragments.error_count = 0;
        spellCheckTextualMessage(true);
    }
}

function isBannedWord(word)
{
    for (b=0; b < banned_words.length; b++)
    {
        if (word.trim().toLowerCase() == banned_words[b])
        {
            return true;
        }
    }

    return false;
}

function readTextFile(filePath){
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", filePath , true);
    rawFile.send(null);

    rawFile.onreadystatechange = function (){
        if(rawFile.readyState === 4){
            if(rawFile.status === 200 || rawFile.status == 0){
                banned_words = 
                    rawFile.responseText.toLowerCase().split("\n");
            }
        }
    }     
}

function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
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
}

function updateStationList()
{
    var station_list = [];
    var id = 0;
    $('#selectedStationList').empty();

    station_list = stationFragmentList[current_map_display];

    if (station_list.length > 0)
    {
        $('#selectedStationList').html(`<ul class="message_font" style="margin: 0px">`);

        for (var s=0; s < station_list.length; s++)
        {
            id = station_list[s];

            $('#selectedStationList')
                .append(`<li>${fragmentText[id]}</li>`);
        }

        $('#selectedStationList')
                .append(`</ul>`);
    }
}





