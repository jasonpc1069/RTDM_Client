$(document).ready(function(){
    
    initialise();

    $('.line').click(function(evt){ 
        let butVal = $(evt.target).attr('value');
        lineButton = $(evt.target);

        $.getJSON('data/current/line_data.json',(lineData)=>{
            if(lineData){
                $.each(lineData, (key, value)=>{
                    if (parseInt(butVal,10) === value.id)
                    {
                        if (value.lines.length > 1)
                        {
                            $('#lineSelectedList').empty();
                            
                            for(let l=0; l<value.lines.length; l++) 
                            {
                                $('#lineSelectedList')
                                    .append(`<button type="button" class="btn btn-primary btn-block lineSelection" data-dismiss="modal" value="${value.lines[l].line}" id="line_selection_${l}"
                                    style="background-color: ${value.lines[l].background_colour}; color: ${value.lines[l].text_colour}">${value.lines[l].message_text}</button>`);
                            }
                        }
                        else
                        {
                            lineButton.siblings().css('background-color', '#e6e6e6');
                            lineButton.siblings().css('color', 'black');
                            lineButton.siblings().text(lineButton.siblings().attr('name'));

                            lineButton.css('background-color', value.lines[0].background_colour);
                            lineButton.css('color', value.lines[0].text_colour);

                            let id = value.lines[0].fragment;
                            lineText = fragmentText.text[id];
                            lineFragment = id;
                            lineImage = value.lines[0].image;
                            stations = value.lines[0].stations;
                            station_image_scale =  value.lines[0].image_scale;
                            
                            resetInitialApplicationStates();
                        }
                    }
                })
            }
        })
    });

    $('.preamble').click(function(evt){ 
        let butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
        $(evt.target).removeClass('active');
        
        $.getJSON('data/current/preamble_data.json',(preamble)=>{
            if(preamble){
                $.each(preamble, (key, value)=>{
                    if (butVal === value.text)
                    {
                        preambleText = fragmentText.text[value.fragment_id];
                        preambleFragment = value.fragment_id;
    
                        updateMessagePanels();
                    }
                })
            }
        })
    });

    $('.disruption').click(function(evt){    
        let butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
        $(evt.target).removeClass('active');
    
        $.getJSON('data/current/disruption_data.json',(disruptionData)=>{
            if(disruptionData){
                $.each(disruptionData, (key, value)=>{
                    if (butVal === value.button_text)
                    {
                        let text = generateFragmentText(value.fragment_id);
                            
                        if (value.reason === ReasonStates.no_reason)
                        {
                            resetReasonButtons();
                        }
                        else
                        {
                            if ($('#reasonSelectedList').contents().length === 0)
                            {
                                filterReasonsByType(FILTER_ALL, null);
                            }

                            $('.reason_item').each(function()   {
                                $(this).removeClass('reason_disabled');
                            })
                        }
                        
                        $('.reason').each(function()   {
                            $(this).prop('disabled', !value.reason);
                        })
    
                        $('#reasonTextSearch').prop('disabled', !value.reason);
                        $('#reasonSearchClear').prop('disabled', !value.reason);
                        $('#reasonText').prop('disabled', !value.reason);
    
                        disruptionText = text;
                        disruptionFragment = value.fragment_id;
                        disruptionDetailIds = value.detail_buttons;
                        reason_position = value.reason;
    
                        updateDetailButtons(value.buttons); 
                        updateDirectionButtons(value.buttons.direction);
                        updateTicketList(value.buttons.ticket);
                        updateMessagePanels();
                    }
                })
            }
        })
    });

    $('.reason').click(function(evt){
        let butVal = $(evt.target).attr('value');
                    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
        $(evt.target).removeClass('active');
    
        $('#reasonSelectedList').empty();
        $('#reasonClear').prop('disabled', false);
        
        $.getJSON('data/current/reason_data.json',(reasonData)=>{
            if(reasonData){
                $.each(reasonData, (key, value)=>{
                    if (butVal === value.button_text)
                    {
                        filterReasonsByType(value.disruption_types, value.disruption_group);
                        
                        // Update Detail Buttons
                        if (value.detail_buttons.length !== 0)
                        {
                            updateDetailButtons(value.detail_buttons);
                            updateMessagePanels();
                        }
                    }           
                })
            }
        });
    });

    $('.detail').click(function(evt){
        let butVal = $(evt.target).attr('value');
        
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#detailClear').prop('disabled', false);

        $.getJSON('data/current/detail_data.json',(detailData)=>{
            if(detailData){
                $.each(detailData, (key, value)=>{
                    if (value.panel_id === DetailPanels.detail)
                    {
                        for (b = 0; b < value.buttons.length; b++)
                        {
                            if (butVal === value.buttons[b].button_text)
                            {
                                detailFragments[DetailIndex.detail] = value.buttons[b].fragments;
                                map_display_state = value.buttons[b].display_map;
                            }
                        }
                    } 
                })
            }
        })

        if ($(evt.currentTarget).attr("data-target") && map_display_state)
        {
            displayStationMap(map_display_state, DetailIndex.detail);
        }
        
        updateMessagePanels();
    });

    $('.detail_1').click(function(evt){
        let butVal = $(evt.target).attr('value');
        
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#detail_1_clear').prop('disabled', false);

        $.getJSON('data/current/detail_data.json',(detailData)=>{
            if(detailData){
                $.each(detailData, (key, value)=>{
                    if (value.panel_id === DetailPanels.detail_1)
                    {
                        for (b = 0; b < value.buttons.length; b++)
                        {
                            if (butVal === value.buttons[b].button_text)
                            {
                                detailFragments[DetailIndex.detail_1] = value.buttons[b].fragments;
                                map_display_state = value.buttons[b].display_map;
                            }
                        }
                    }
                    
                })
            }
        })

        if ($(evt.currentTarget).attr("data-target") && map_display_state)
        {
            displayStationMap(map_display_state, DetailIndex.detail_1);
        }
        
        updateMessagePanels();
    
    });

    $('.additional_detail').click(function(evt){
        let butVal = $(evt.target).attr('value');
        
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#additional_detail_clear').prop('disabled', false);

        $.getJSON('data/current/detail_data.json',(detailData)=>{
            if(detailData){
                $.each(detailData, (key, value)=>{
                    if (value.panel_id === DetailPanels.additional_detail)
                    {
                        for (b = 0; b < value.buttons.length; b++)
                        {
                            if (butVal === value.buttons[b].button_text)
                            {
                                detailFragments[DetailIndex.additional_detail] = value.buttons[b].fragments;
                                map_display_state = value.buttons[b].display_map;
                            }
                    
                        }
                    }
                    
                })
            }
        })

        if ($(evt.currentTarget).attr("data-target") && map_display_state)
        {
            displayStationMap(map_display_state, DetailIndex.additional_detail);
        }
        
        updateMessagePanels();
    
    });

    $('.rest').click(function(evt){
        let butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#rest_of_line_clear').prop('disabled', false);

        $.getJSON('data/current/detail_data.json',(detailData)=>{
            if(detailData){
                $.each(detailData, (key, value)=>{
                    if (value.panel_id === DetailPanels.rest_of_line)
                    {
                        for (b = 0; b < value.buttons.length; b++)
                        {
                            if (butVal === value.buttons[b].button_text)
                            {
                                detailFragments[DetailIndex.rest_of_line] = value.buttons[b].fragments;
                            }
                    
                        }
                    }
                })
            }
        })
    
        updateMessagePanels();
    
    });
    
    $('.direction').click(function(evt){
        let butVal = parseInt($(evt.currentTarget).attr('value'));
    
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#directionClear').prop('disabled', false);
    
        $.getJSON('data/current/direction_data.json',(directionData)=>{
            if(directionData){
                $.each(directionData, (key, value)=>{
                    if (butVal === value.id)
                    {
                        directionFragment = value.fragment_id;
                        direction_position = value.text_position;

                        updateMessagePanels();
                    }
                })
            }
        })
    });

    $(document).on('keyup', '#fragmentText', function (e) {
        let text = document.getElementById('fragmentText').value;

        if (text.length != 0)
        {
            filterFragmentData(text);
        }
        else
        {
            $('#fragmentArea').empty();
        }
    });

    $(document).on('keyup', '#textualMessage', function (e) {
        updateTextualMessageLength();
        clearTimeout(spellingTimer);
        spellingTimer = setTimeout(onTextualMessageEdit, SPELLING_INTERVAL);
    });

    $(document).on("click", "#textualSuggestions li", function(event) {
        correctSpelling($(this).text());
      });

    $('#stationSelect').click(function(evt){
        updateMessagePanels();
    });

    $('#stationClear').click(function(evt){
        $('#selectedStationList').empty();
        stationFragmentList[current_map_display] = [];
        updateMessagePanels();
    });
    
    $('#stationCancel').click(function(evt){
        stationFragmentList[current_map_display] = previousStationFragmentList;
        updateMessagePanels();
    });

    $("#fragmentArea").on('click','li',function() {
        let id = $(this).attr('id').split("_").pop();
        let index = assembledFragments.selected;

        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
    
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        assembledFragments.fragments.splice(index,0,id).join();
        textualFragments.fragments.splice(index,0,id).join();

        updateMessageAssembler();
        updateTextualMessage();
    });
});

$(document).on('click', '.lineSelection', (evt)=>{
    let butVal = $(evt.target).attr('value');
    let button_id = 0;

    $.getJSON('data/current/line_data.json',(lineData)=>{
        if(lineData){
            $.each(lineData, (key, value)=>{
                button_id = parseInt(lineButton.attr('value'));
                if ( button_id=== value.id)
                {
                    for(let l=0; l<value.lines.length; l++) 
                    {
                        if (value.lines[l].line === butVal)
                        {
                            lineButton.siblings().css('background-color', '#e9ecef');
                            lineButton.siblings().css('color', 'black');

                            lineButton.css('background-color', value.lines[l].background_colour);
                            lineButton.css('color', value.lines[l].text_colour);
                            lineButton.text(value.lines[l].line);

                            let id = value.lines[l].fragment;
                            lineText = fragmentText.text[id];
                            lineFragment = id;
                            lineImage = value.lines[l].image;
                            stations = value.lines[l].stations;
                            station_image_scale =  value.lines[l].image_scale;

                            resetInitialApplicationStates();
                        }
                    }
                }
            })
        }
    })
});

$("#reasonSelectedList").on('click','li',function() {

    if (!$(this).hasClass ('reason_disabled'))
    {
        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
        
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        let id = $(this).attr('id').split("_").pop();
        
        reasonFragment = id;
        
        updateMessagePanels();
    }
});


$("#ticketSelectionList").on('click','li',function() {
    let id = $(this).attr('id').split("_").pop();
    let index = 0;

    if (!$(this).hasClass ('ticket_disabled'))
    {
        if (ticketFragmentList.includes(id))
        {
            $(this).css('background-color', '#e9ecef');
            $(this).css('color', 'black');

            // Remove Ticket
            index = ticketFragmentList.indexOf(id);
            ticketFragmentList.splice(index,1);
        }
        else
        {
            $(this).css('background-color', 'green');
            $(this).css('color', 'white');
            ticketFragmentList.push(id);
        }

        // Determine whether the ticket clear button should be enabled
        if (ticketFragmentList.length > 0)
        {
            $('#ticketClear').prop('disabled', false);
        }
        else
        {
            $('#ticketClear').prop('disabled', true);
        }
        
        updateMessagePanels();
    }
});

$(document).on('click', '#reasonTextSearch', (evt)=>{
    let text = document.getElementById('reasonText').value;
    text = text.toLowerCase();
            
    $('#reasonSelectedList').empty();

    $('.reason').each(function()   {
        $(this).removeClass('active');
    })

    filterReasonsByText(text);

});

$(document).on('click', '#fragmentSearch', (evt)=>{
    let text = document.getElementById('fragmentText').value;
    text = text.toLowerCase();
            
    filterFragmentData(text);
});

$(document).on('click', '#reasonSearchClear', (evt)=>{
    document.getElementById('reasonText').value = "";
    
    $('.reason').each(function()   {
        $(this).removeClass('active');
    })
    filterReasonsByType(FILTER_ALL, null);
});

$(document).on('click', '#reasonClear', (evt)=>{
    $('#reasonClear').prop('disabled', true);

    reasonFragment = '';

    $('#reasonSelectedList').empty();

    $('.reason').each(function()   {
        $(this).removeClass('active');
    })
    filterReasonsByType(FILTER_ALL, null);

    // Update Detail Buttons
    if (disruptionDetailIds.length !== 0)
    {
        updateDetailButtons(disruptionDetailIds);
    }

    updateMessagePanels();
});

$(document).on('click', '#detailClear', (evt)=>{
    $('#detailClear').prop('disabled', true);

    $('.detail').each(function()   {
        $(this).removeClass('active');
    })

    detailFragments[DetailIndex.detail] = [];
    stationFragmentList[DetailIndex.detail] = [];

    updateMessagePanels();
});

$(document).on('click', '#detail_1_clear', (evt)=>{
    $('#detail_1_clear').prop('disabled', true);

    $('.detail_1').each(function()   {
        $(this).removeClass('active');
    })

    detailFragments[DetailIndex.detail_1] = [];
    stationFragmentList[DetailIndex.detail_1] = [];

    updateMessagePanels();
});

$(document).on('click', '#additional_detail_clear', (evt)=>{
    $('#additional_detail_clear').prop('disabled', true);

    $('.additional_detail').each(function()   {
        $(this).removeClass('active');
    })

    detailFragments[DetailIndex.additional_detail] = [];
    stationFragmentList[DetailIndex.additional_detail] = [];

    updateMessagePanels();
});

$(document).on('click', '#rest_of_line_clear', (evt)=>{
    $('#rest_of_line_clear').prop('disabled', true);

    $('.rest').each(function()   {
        $(this).removeClass('active');
    })

    detailFragments[DetailIndex.rest_of_line] = [];
    
    updateMessagePanels();
});

$(document).on('click', '#ticketClear', (evt)=>{
    $('#ticketClear').prop('disabled', true);

    $('.ticket_item').each(function()   {
        $(this).css('background-color', '#e9ecef');
        $(this).css('color', 'black');
    })

    ticketFragmentList = [];
    
    updateMessagePanels();
});

$(document).on('click', '#directionClear', (evt)=>{
    $('#directionClear').prop('disabled', true);

    $('.direction').each(function()   {
        $(this).removeClass('active');
    })

    directionFragment = 0;
    
    updateMessagePanels();
});

// Builder
$(document).on('click', '#builderClear', (evt)=>{
    resetLineButton();
});

$(document).on('click', '#builderPreview', (evt)=>{
    if ($('#builderCompleteMessage').contents().length > 0)
    {
        $(evt.target).prop('disabled',true);
        previewEvt = evt;
        previewSound(builderFragments.fragments);
    }
});

// Assembler Buttons
$(document).on('click', '#previewClick', (evt)=>{
    if ($('#messageAssembly').contents().length > 0)
    {
        $(evt.target).prop('disabled',true);
        previewEvt = evt;
        previewSound(assembledFragments.fragments);
    }
});

$(document).on('click', '#assemblyClear', (evt)=>{
    $('#messageAssembly').empty();
    assembledFragments.selected = 0;
    assembledFragments.fragments = [];

    $('#assemblyNext').prop('disabled', true);
    $('#assemblyDelete').prop('disabled', true);
    $('#assemblyPrevious').prop('disabled', true);
    $('#assemblyClear').prop('disabled', true);
    $('#previewClick').prop('disabled', true);
});

$(document).on('click', '#assemblyNext', (evt)=>{
    if (assembledFragments.selected < (assembledFragments.fragments.length))
    {
        assembledFragments.selected = assembledFragments.selected + 1;
    }

    updateMessageAssembler();
});

$(document).on('click', '#assemblyPrevious', (evt)=>{
    if (assembledFragments.selected > 0)
    {
        assembledFragments.selected = assembledFragments.selected - 1;
    }

    updateMessageAssembler();
});

$(document).on('click', '#assemblyDelete', (evt)=>{
    if (assembledFragments.selected < assembledFragments.fragments.length)
    {
        assembledFragments.fragments.splice(assembledFragments.selected,1);
        textualFragments.fragments.splice(assembledFragments.selected,1)
    }

    if (assembledFragments.selected > (assembledFragments.fragments.length))
    {
        assembledFragments.selected = (assembledFragments.fragments.length);
    }

    updateMessageAssembler();
    updateTextualMessage();
});

$(document).on('click', '#textualClear', (evt)=>{
    $('#textualMessage').empty();
    textualFragments.selected = 0;
    textualFragments.error_count = 0;
    textualFragments.errors = [];
    textualFragments.fragments = [];

    updateTextualMessageLength();

    $('#textualNext').prop('disabled', true);
    $('#textualPrevious').prop('disabled', true);
    $('#textualClear').prop('disabled', true);

    $('#textualSuggestions').empty();
});

$(document).on('click', '#textualNext', (evt)=>{
    textualFragments.selected = textualFragments.selected + 1;

    $('#textualNext').prop('disabled', 
        !(textualFragments.selected < (textualFragments.error_count-1)));
    $('#textualPrevious').prop('disabled', false);

    spellCheckTextualMessage(false);
});

$(document).on('click', '#textualPrevious', (evt)=>{
    textualFragments.selected = textualFragments.selected - 1;

    $('#textualNext').prop('disabled', 
        !(textualFragments.selected < (textualFragments.error_count-1)));
    $('#textualPrevious').prop('disabled', !(textualFragments.selected > 0));

    spellCheckTextualMessage(false);
});

function stationClicked(area)
{
    let id = area.getAttribute("id");
    let index = area.getAttribute("id").indexOf('_');
    let fragment = id.substring(index+1);
    let fragment_text = fragmentText.text[fragment];
    let station_list = [];
    let station_fragment_list = [];
    let current_list = [];
    let current = '';
    let e = 0;

    station_fragment_list = stationFragmentList[current_map_display];
    stationFragmentList[current_map_display] = [];

    if (map_display_state === MapDisplayStates.single_selection)
    {
        
        //Display Station
        $('#selectedStationList').html(`<ul class="message_font" style="margin: 0px">`);
        $('#selectedStationList')
                .append(`<li>${fragment_text}</li><ul>`);

        // Set the station fragment
        stationFragmentList[current_map_display].push(fragment);
    
    }
    else if (map_display_state === MapDisplayStates.multi_selection)
    {
        // Get Current Stations
        current = document.getElementById('selectedStationList');
        current_list = current.getElementsByTagName("li");

        // Add stations to array
        for (e = 0; e < current_list.length; e++) 
        {
             station_list.push( current_list[e].innerText);
        }
        
        // Determine whether array already contains station
        if (station_list.includes(fragment_text))
        {
            // Remove Station
            index = station_list.indexOf(fragment_text);
            station_list.splice(index,1);

            // Remove Fragment
            index = station_fragment_list.indexOf(fragment);
            station_fragment_list.splice(index, 1);
        }
        else
        {
            //Add Station
            station_list.push(fragment_text);
            station_fragment_list.push(fragment);
        }

        stationFragmentList[current_map_display] = station_fragment_list;

        // Redisplay Items
        $('#selectedStationList').html(`<ul class="message_font" style="margin: 0px">`);

        for (let e = 0; e < station_list.length; e++)
        {
            $('#selectedStationList')
                .append(`<li>${station_list[e]}</li>`);
        }

        $('#selectedStationList')
                .append(`</ul>`);
    }

    updateMessagePanels();
}

$(document).on('shown.bs.modal','#stationModal', function () {
    // $( '#station' ).each( function() {
    //     let $img = $( this);
    //     $img.width( $img.width() * (station_image_scale / 100) );
    // });

    // $('#stationModal').modal('handleUpdate')
})

$(document).on('click', '#stationClear', (evt)=>{
    $('#selectedStationList').empty();
});
