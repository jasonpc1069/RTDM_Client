
/* Placed outside of document.ready as document.readyState might already be complete when
   document is ready and therefore will never be called 

   Still get error - but also button events don't seem to fire
document.onreadystatechange = function() 
{
    if (document.readyState === 'interactive') {
        console.log('document.readyState === interactive .... keep waiting');
        return;
    }
    
    if (document.readyState === 'complete') {
        console.log('document.readyState === complete .... go go go!');
        loadData();
        app.initialiseApplication();
     }
}*/


$(document).ready(function(){
    
    /* Original call - throws an occassional error but all works OK */
    console.log(document.readyState);
    loadData();
    app.initialiseApplication();

    /* Checks if complete before relying on ready state change - if state is
       complete then all works, however if state is initially interactive then 
       an error is thrown and button events don't fire
    if (document.readyState === 'complete')
    {
        console.log('document.readyState === complete at start go go go!');
        loadData();
        app.initialiseApplication(); 
    }
    else
    {
        document.onreadystatechange = function() 
        {
            if (document.readyState === 'interactive') {
                console.log('document.readyState === interactive .... keep waiting');
                return;
            }
            
            if (document.readyState === 'complete') {
                console.log('document.readyState === complete after interactive go go go!');
                loadData();
                app.initialiseApplication();
            }
        }
    }*/

    $(document).on('click','.line',function(evt){
    //$('.line').click(function(evt){ 
        let butVal = $(evt.target).attr('value');
        app.lineButton = $(evt.target);

        if(app.lineData){
            $.each(app.lineData, (key, value)=>{
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
                        app.lineButton.siblings().css('background-color', '#e6e6e6');
                        app.lineButton.siblings().css('color', 'black');
                        app.lineButton.siblings().text(app.lineButton.siblings().attr('name'));

                        app.lineButton.css('background-color', value.lines[0].background_colour);
                        app.lineButton.css('color', value.lines[0].text_colour);

                        let id = value.lines[0].fragment;
                        app.lineFragment = id;
                        app.lineImage = value.lines[0].image;
                        app.stations = value.lines[0].stations;
                        app.station_image_scale =  value.lines[0].image_scale;
                        
                        app.resetInitialApplicationStates();
                    }
                }
            })
        }
    });

    $(document).on('click','.preamble',function(evt){
        let butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
        $(evt.target).removeClass('active');
        
        $.getJSON('data/current/preamble_data.json',(preamble)=>{
            if(preamble){
                $.each(preamble, (key, value)=>{
                    if (butVal === value.text)
                    {
                        app.preambleFragment = value.fragment_id;
    
                        app.updateMessagePanels();
                    }
                })
            }
        })
    });

    $('.library').click(function(evt){ 
        alert ('clear off');
    });

    $(document).on('click','.disruption',function(evt){  
        let butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
        $(evt.target).removeClass('active');
    
        if(app.disruptionData)
        {
            $.each(app.disruptionData, (key, value)=>{
                if (butVal === value.button_text)
                {    
                    if (value.reason === ReasonStates.no_reason)
                    {
                        app.resetReasonButtons();
                    }
                    else
                    {
                        if ($('#reasonSelectedList').contents().length === 0)
                        {
                            app.filterReasonsByType(FILTER_ALL, null);
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

                    app.disruptionFragment = value.fragment_id;
                    app.disruptionDetailIds = value.detail_buttons;
                    app.reason_position = value.reason;

                    app.updateDetailButtons(value.buttons); 
                    app.updateDirectionButtons(value.buttons.direction);
                    app.updateTicketList(value.buttons.ticket);
                    app.updateMessagePanels();
                }
            })
        }
    });

    $(document).on('click','.reason',function(evt){
        let butVal = $(evt.target).attr('value');
                    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
        $(evt.target).removeClass('active');
    
        $('#reasonSelectedList').empty();
        $('#reasonClear').prop('disabled', false);
        
        if(app.reasonData)
        {
            $.each(app.reasonData, (key, value)=>{
                if (butVal === value.button_text)
                {
                    app.filterReasonsByType(value.disruption_types, value.disruption_group);
                    
                    // Update Detail Buttons
                    if (value.detail_buttons.length !== 0)
                    {
                        app.updateDetailButtons(value.detail_buttons);
                        app.updateMessagePanels();
                    }
                }           
            })
        }
    });

    $(document).on('click','.detail',function(evt){
        let butVal = $(evt.target).attr('value');
        
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#detailClear').prop('disabled', false);

        if(app.detailData)
        {
            $.each(app.detailData, (key, value)=>{
                if (value.panel_id === DetailPanels.detail)
                {
                    for (b = 0; b < value.buttons.length; b++)
                    {
                        if (butVal === value.buttons[b].button_text)
                        {
                            app.detailFragments[DetailIndex.detail] = value.buttons[b].fragments;
                            app.map_display_state = value.buttons[b].display_map;
                        }
                    }
                } 
            })
        }

        if ($(evt.currentTarget).attr("data-target") && app.map_display_state)
        {
            app.displayStationMap(app.map_display_state, DetailIndex.detail);
        }
        
        app.updateMessagePanels();
    });

    $(document).on('click','.detail_1',function(evt){
        let butVal = $(evt.target).attr('value');
        
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#detail_1_clear').prop('disabled', false);

        if(app.detailData)
        {
            $.each(app.detailData, (key, value)=>{
                if (value.panel_id === DetailPanels.detail_1)
                {
                    for (b = 0; b < value.buttons.length; b++)
                    {
                        if (butVal === value.buttons[b].button_text)
                        {
                            app.detailFragments[DetailIndex.detail_1] = value.buttons[b].fragments;
                            app.map_display_state = value.buttons[b].display_map;
                        }
                    }
                }
                
            })
        }

        if ($(evt.currentTarget).attr("data-target") && app.map_display_state)
        {
            app.displayStationMap(app.map_display_state, DetailIndex.detail_1);
        }
        
        app.updateMessagePanels();
    
    });

    $(document).on('click','.additional_detail',function(evt){
        let butVal = $(evt.target).attr('value');
        
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#additional_detail_clear').prop('disabled', false);

        if(app.detailData)
        {
            $.each(app.detailData, (key, value)=>{
                if (value.panel_id === DetailPanels.additional_detail)
                {
                    for (b = 0; b < value.buttons.length; b++)
                    {
                        if (butVal === value.buttons[b].button_text)
                        {
                            app.detailFragments[DetailIndex.additional_detail] = value.buttons[b].fragments;
                            app.map_display_state = value.buttons[b].display_map;
                        }
                
                    }
                }
                
            })
        }

        if ($(evt.currentTarget).attr("data-target") && app.map_display_state)
        {
            app.displayStationMap(app.map_display_state, DetailIndex.additional_detail);
        }
        
        app.updateMessagePanels();
    
    });

    $(document).on('click','.rest',function(evt){
        let butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#rest_of_line_clear').prop('disabled', false);

        if(app.detailData)
        {
            $.each(app.detailData, (key, value)=>{
                if (value.panel_id === DetailPanels.rest_of_line)
                {
                    for (b = 0; b < value.buttons.length; b++)
                    {
                        if (butVal === value.buttons[b].button_text)
                        {
                            app.detailFragments[DetailIndex.rest_of_line] = value.buttons[b].fragments;
                        }
                
                    }
                }
            })
        }
    
        app.updateMessagePanels();
    
    });
    
    $(document).on('click','.direction',function(evt){
        let butVal = parseInt($(evt.currentTarget).attr('value'));
    
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $(evt.currentTarget).removeClass('active');

        $('#directionClear').prop('disabled', false);
    
        if(app.directionData)
        {
            $.each(app.directionData, (key, value)=>{
                if (butVal === value.id)
                {
                    app.directionFragment = value.fragment_id;
                    app.direction_position = value.text_position;

                    app.updateMessagePanels();
                }
            })
        }
    });

    $(document).on('keyup', '#fragmentText', function (e) {
        let text = document.getElementById('fragmentText').value;

        if (text.length != 0)
        {
            app.filterFragmentData(text);
        }
        else
        {
            $('#fragmentArea').empty();
        }
    });

    $(document).on('keyup', '#textualMessage', function (e) {
        app.updateTextualMessageLength();
        clearTimeout(app.spellingTimer);
        app.spellingTimer = setTimeout(app.onTextualMessageEdit, SPELLING_INTERVAL);
    });

    $(document).on("click", "#textualSuggestions li", function(event) {
        app.correctSpelling($(this).text());
    });

    $(document).on('click','#stationSelect',function(evt){
        app.updateMessagePanels();
    });

    $(document).on('click','#stationClear',function(evt){
        $('#selectedStationList').empty();
        app.stationFragmentList[app.current_map_display] = [];
        app.updateMessagePanels();
    });
    
    $(document).on('click','#stationCancel',function(evt){
        app.stationFragmentList[app.current_map_display] = app.previousStationFragmentList;
        app.updateMessagePanels();
    });

    $(document).on('click','#fragmentArea li',function(evt){
        let id = $(this).attr('id').split("_").pop();
        let index = app.assembledFragments.selected;

        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
    
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        app.assembledFragments.fragments.splice(index,0,id).join();
        app.textualFragments.fragments.splice(index,0,id).join();

        app.updateMessageAssembler();
        app.updateTextualMessage();
    });


    $(document).on('click', '.lineSelection', (evt)=>{
        let butVal = $(evt.target).attr('value');
        let button_id = 0;
        let id = 0;

        if(app.lineData){
            $.each(app.lineData, (key, value)=>{
                button_id = parseInt(app.lineButton.attr('value'));
                if ( button_id=== value.id)
                {
                    for(let l=0; l<value.lines.length; l++) 
                    {
                        if (value.lines[l].line === butVal)
                        {
                            app.lineButton.siblings().css('background-color', '#e9ecef');
                            app.lineButton.siblings().css('color', 'black');

                            app.lineButton.css('background-color', value.lines[l].background_colour);
                            app.lineButton.css('color', value.lines[l].text_colour);
                            app.lineButton.text(value.lines[l].line);

                            id = value.lines[l].fragment;
                            app.lineFragment = id;
                            app.lineImage = value.lines[l].image;
                            app.stations = value.lines[l].stations;
                            app.station_image_scale =  value.lines[l].image_scale;

                            app.resetInitialApplicationStates();
                        }
                    }
                }
            })
        }
    });

    $(document).on('click','#reasonSelectedList li',function(evt){
        if (!$(this).hasClass ('reason_disabled'))
        {
            $(this).siblings().css('background-color', '#e9ecef');
            $(this).siblings().css('color', 'black');
            
            $(this).css('background-color', 'green');
            $(this).css('color', 'white');

            let id = $(this).attr('id').split("_").pop();
            
            app.reasonFragment = parseInt(id);
            
            app.updateMessagePanels();
        }
    });

    $(document).on('click','#ticketSelectionList li',function(evt){
        let id = $(this).attr('id').split("_").pop();
        let index = 0;

        if (!$(this).hasClass ('ticket_disabled'))
        {
            if (app.ticketFragmentList.includes(id))
            {
                $(this).css('background-color', '#e9ecef');
                $(this).css('color', 'black');

                // Remove Ticket
                index = app.ticketFragmentList.indexOf(id);
                app.ticketFragmentList.splice(index,1);
            }
            else
            {
                $(this).css('background-color', 'green');
                $(this).css('color', 'white');
                app.ticketFragmentList.push(id);
            }

            // Determine whether the ticket clear button should be enabled
            if (app.ticketFragmentList.length > 0)
            {
                $('#ticketClear').prop('disabled', false);
            }
            else
            {
                $('#ticketClear').prop('disabled', true);
            }
            
            app.updateMessagePanels();
        }
    });

    $(document).on('click', '#reasonTextSearch', (evt)=>{
        let text = document.getElementById('reasonText').value;
        text = text.toLowerCase();
                
        $('#reasonSelectedList').empty();

        $('.reason').each(function()   {
            $(this).removeClass('active');
        })

        app.filterReasonsByText(text);

    });

    $(document).on('keyup', '#reasonText', function (e) {
        let text = ''
        if (e.key === 'Enter')
        {
            text = document.getElementById('reasonText').value;

            $('#reasonSelectedList').empty();

            $('.reason').each(function()   {
                $(this).removeClass('active');
            })

            app.filterReasonsByText(text);
        }
    });

    $(document).on('click', '#fragmentSearch', (evt)=>{
        let text = document.getElementById('fragmentText').value;
        text = text.toLowerCase();
                
        app.filterFragmentData(text);
    });

    $(document).on('click', '#reasonSearchClear', (evt)=>{
        document.getElementById('reasonText').value = "";
        
        $('.reason').each(function()   {
            $(this).removeClass('active');
        })

        app.filterReasonsByType(FILTER_ALL, null);
    });

    $(document).on('click', '#reasonClear', (evt)=>{
        $('#reasonClear').prop('disabled', true);

        app.reasonFragment = 0;

        $('#reasonSelectedList').empty();

        $('.reason').each(function()   {
            $(this).removeClass('active');
        })

        app.filterReasonsByType(FILTER_ALL, null);

        // Update Detail Buttons
        if (app.disruptionDetailIds && app.disruptionDetailIds.length !== 0)
        {
            app.updateDetailButtons(app.disruptionDetailIds);
        }

        app.updateMessagePanels();
    });

    $(document).on('click', '#detailClear', (evt)=>{
        $('#detailClear').prop('disabled', true);

        $('.detail').each(function()   {
            $(this).removeClass('active');
        })

        app.detailFragments[DetailIndex.detail] = [];
        app.stationFragmentList[DetailIndex.detail] = [];

        app.updateMessagePanels();
    });

    $(document).on('click', '#detail_1_clear', (evt)=>{
        $('#detail_1_clear').prop('disabled', true);

        $('.detail_1').each(function()   {
            $(this).removeClass('active');
        })

        app.detailFragments[DetailIndex.detail_1] = [];
        app.stationFragmentList[DetailIndex.detail_1] = [];

        app.updateMessagePanels();
    });

    $(document).on('click', '#additional_detail_clear', (evt)=>{
        $('#additional_detail_clear').prop('disabled', true);

        $('.additional_detail').each(function()   {
            $(this).removeClass('active');
        })

        app.detailFragments[DetailIndex.additional_detail] = [];
        app.stationFragmentList[DetailIndex.additional_detail] = [];

        app.updateMessagePanels();
    });

    $(document).on('click', '#rest_of_line_clear', (evt)=>{
        $('#rest_of_line_clear').prop('disabled', true);

        $('.rest').each(function()   {
            $(this).removeClass('active');
        })

        app.detailFragments[DetailIndex.rest_of_line] = [];
        
        app.updateMessagePanels();
    });

    $(document).on('click', '#ticketClear', (evt)=>{
        $('#ticketClear').prop('disabled', true);

        $('.ticket_item').each(function()   {
            $(this).css('background-color', '#e9ecef');
            $(this).css('color', 'black');
        })

        app.ticketFragmentList = [];
        
        app.updateMessagePanels();
    });

    $(document).on('click', '#directionClear', (evt)=>{
        $('#directionClear').prop('disabled', true);

        $('.direction').each(function()   {
            $(this).removeClass('active');
        })

        app.directionFragment = 0;
        
        app.updateMessagePanels();
    });

    // Builder
    $(document).on('click', '#builderClear', (evt)=>{
        app.resetLineButton();
    });

    $(document).on('click', '#builderPreview', (evt)=>{
        if ($('#builderCompleteMessage').contents().length > 0)
        {
            $(evt.target).prop('disabled',true);
            $('#previewClick').prop('disabled',true);
            
            app.previewSound(app.builderFragments.fragments);
        }
    });

    // Assembler Buttons
    $(document).on('click', '#previewClick', (evt)=>{
        if ($('#messageAssembly').contents().length > 0)
        {
            $(evt.target).prop('disabled',true);
            $('#builderPreview').prop('disabled',true);

            app.previewSound(app.assembledFragments.fragments);
        }
    });

    $(document).on('click', '#assemblyClear', (evt)=>{
        app.clearMessageAssemblyPanel();
    });

    $(document).on('click', '#assemblyNext', (evt)=>{
        if (app.assembledFragments.selected < (app.assembledFragments.fragments.length))
        {
            app.assembledFragments.selected = app.assembledFragments.selected + 1;
        }

        app.updateMessageAssembler();
    });

    $(document).on('click', '#assemblyPrevious', (evt)=>{
        if (app.assembledFragments.selected > 0)
        {
            app.assembledFragments.selected = app.assembledFragments.selected - 1;
        }

        app.updateMessageAssembler();
    });

    $(document).on('click', '#assemblyDelete', (evt)=>{
        if (app.assembledFragments.selected < app.assembledFragments.fragments.length)
        {
            app.assembledFragments.fragments.splice(app.assembledFragments.selected,1);
            app.textualFragments.fragments.splice(app.assembledFragments.selected,1)
        }

        if (app.assembledFragments.selected > (app.assembledFragments.fragments.length))
        {
            app.assembledFragments.selected = (app.assembledFragments.fragments.length);
        }

        app.updateMessageAssembler();
        app.updateTextualMessage();
    });

    $(document).on('click', '#textualClear', (evt)=>{
        app.clearTextOnlyMessagePanel();
    });

    $(document).on('click', '#textualNext', (evt)=>{
        app.textualFragments.selected = app.textualFragments.selected + 1;

        $('#textualNext').prop('disabled', 
            !(app.textualFragments.selected < (app.textualFragments.error_count-1)));
        $('#textualPrevious').prop('disabled', false);

        app.spellCheckTextualMessage(false);
    });

    $(document).on('click', '#textualPrevious', (evt)=>{
        app.textualFragments.selected = app.textualFragments.selected - 1;

        $('#textualNext').prop('disabled', 
            !(app.textualFragments.selected < (app.textualFragments.error_count-1)));
        $('#textualPrevious').prop('disabled', !(app.textualFragments.selected > 0));

        app.spellCheckTextualMessage(false);
    });

    $(document).on('shown.bs.modal','#stationModal', function () {
        // $( '#station' ).each( function() {
        //     let $img = $( this);
        //     $img.width( $img.width() * (app.station_image_scale / 100) );
        // });

        // $('#stationModal').modal('handleUpdate')
    })

    $(document).on('click', '#stationClear', (evt)=>{
        $('#selectedStationList').empty();
    });

    $(document).on('click', '#playLibrary', (evt)=>{
        let buttons = document.querySelectorAll('.status');
        let b = 0;

        if ($('#libraryPanel').hasClass('d-none'))
        {
            for (b = 0; b < buttons.length; b++)
            {
                buttons[b].classList.remove('active');
            }
            
            $('#createMessagePanel').addClass('d-none');
            $('#libraryPanel').removeClass('d-none');
            $(evt.target).addClass('active');

        }
    });

    $(document).on('click', '#createMessage', (evt)=>{
        let buttons = document.querySelectorAll('.status');
        let b = 0;

        if ($('#createMessagePanel').hasClass('d-none'))
        {
            for (b = 0; b < buttons.length; b++)
            {
                buttons[b].classList.remove('active');
            }
            
            $('#libraryPanel').addClass('d-none');
            $('#createMessagePanel').removeClass('d-none');
            $(evt.target).addClass('active');
        }
    });

    $(document).on('click','#libraryTypeList li',function(){

        let id = parseInt($(this).attr('id').split("_").pop());
       
        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
    
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        $('#libraryMessageList').empty();
        $('#libraryMessageList1').empty();

        app.updatePlaylist(id, PL_Level.level_2);
    });

    
    $(document).on('click','#libraryMessageList li',function(){
        let id = parseInt($(this).attr('id').split("_").pop());
       
        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
    
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        $('#libraryMessageList1').empty();

        if ($(this).hasClass('pl_msg_item'))
        {
            app.playlistMessages.selected = id;
            app.updateLibraryBrowser(id);
        }
        else
        {
            app.updatePlaylist(id, PL_Level.level_3);
        }
    });

    $(document).on('click','#libraryMessageList1 li',function(){
        let id = parseInt($(this).attr('id').split("_").pop());
       
        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
    
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        app.playlistMessages.selected = id;
        app.updateLibraryBrowser(id);
    });

    $(document).on('click', '#browserPreview', (evt)=>{
        if ($('#libraryMessage').contents().length > 0)
        {
            $(evt.target).prop('disabled',true);
            
            app.previewSound(app.browserFragments);
        }
    });

    $(document).on('click', '#browserSave', (evt)=>{
        if (app.playlistMessages.selected > 0)
        {
            addQuicklistMessage(app.playlistMessages.selected);
            app.updateQuicklist();
        }
    });

    $(document).on('click', '#browserDelete', (evt)=>{
        let id = app.playlistMessages.selected;
        let message = app.getPlaylistMessage(id);
        let name = message.message_name;
        let text = `Are you sure you wish to delete the Announcement?<br><b>${name}<b>`;

        document.getElementById('deleteText').innerHTML = text;

    });

    $(document).on('click','#quickListList li',function(){
        let id = parseInt($(this).attr('id').split("_").pop());
       
        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
    
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        app.quickList.selected_id = id;
        $('#quicklistDelete').prop('disabled', false);
    });

    $(document).on('click', '#quicklistDelete', (evt)=>{
        let index = 0;

        if (app.quickList.selected_id > 0)
        {
            deleteQuicklistMessage(app.quickList.selected_id);
            
            //Update the panel 
            app.updateQuicklist();
        }
    });

    $(document).on('click','#saveFolders li',function(){
        let id = parseInt($(this).attr('id').split("_").pop());
       
        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
    
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        app.selected_save_type = id;
    });

    $(document).on('click','#assemblySave',function(evt){
        document.getElementById('saveModal').setAttribute('name', MessageSource.Assembly);
        app.resetSaveModal();   
    });

    $(document).on('click','#textualSave',function(evt){
        document.getElementById('saveModal').setAttribute('name', MessageSource.Textual);
        app.resetSaveModal(); 
    });

    $(document).on('click','#builderSave',function(evt){
        document.getElementById('saveModal').setAttribute('name', MessageSource.Builder);
        app.resetSaveModal(); 
    });

    $(document).on('click', '#saveSave', (evt)=>{
        let title = $('#saveTitle').val();
        let description = $('#saveDescription').val();
        let quicklist_flag = $('#saveQuicklist').hasClass('active');
        let detail = '';
        let duration = 0;
        let type = document.getElementById('saveModal').getAttribute('name');
        let icon = '';
        let fragments = [];
        let classifier = '';

        if (title && title.length > 0)
        {
            $('#saveModal').modal('hide');

            switch (type)
            {
                case MessageSource.Assembly:
                    icon = EAR_TEXT_ICON;
                    classifier = USER_MULTIPART_CLASSIFIER;
                    detail = app.assembledFragments.text;
                    duration = app.assembledFragments.duration;
                    fragments = app.assembledFragments.fragments;
                    break;
                case MessageSource.Textual:
                    icon = TEXT_ICON;
                    classifier = USER_MRA_CLASSIFIER;
                    // Get Text from message panel
                    detail = document.getElementById('textualMessage').innerText;
                    if (detail.endsWith('.'))
                    {
                        // remove fullstop
                        detail = detail.substring(0,detail.length-1);
                    }
                    break;
                case MessageSource.Builder:
                    icon = TEXT_ICON;
                    classifier = USER_MULTIPART_CLASSIFIER;
                    detail = app.builderFragments.text;
                    duration = app.builderFragments.duration;
                    fragments = app.builderFragments.fragments;
                    break;
                default:
                    icon = EAR_TEXT_ICON;
                    break;
            }
            
            addUserPlaylistMessage(title, description, classifier,icon);

            // Determine which message is being created
            if (type !== MessageSource.Textual)
            {
                addUserMultipartMessage(title, description, detail, duration, fragments, icon);
            }
            else
            {
                addUserMraMessage(title, description, detail, icon);
            }


            // Determine whether the message should be added to the quick list
            if (quicklist_flag)
            {
                addQuicklistMessage(app.userMessageId);
                app.updateQuicklist();
            }

            // Clear the message from panel
            if (type === MessageSource.Assembly)
            {
                app.clearMessageAssemblyPanel();
            }

            if (type !== MessageSource.Builder)
            {
                app.clearTextOnlyMessagePanel();
            }

            if (type === MessageSource.Builder)
            {
                app.resetLineButton();
            }

            // Increment User ID
            app.userMessageId++;
            
            app.resetLibraryBrowser();
        }
        else
        {
            document.getElementById('infoText').innerHTML = 
                "Please enter an announcement Title";
        
            $('#infoModal').modal({show: true});
        }
    });

    $(document).on('click', '#deleteConfirm', (evt)=>{
        let id = app.playlistMessages.selected;
        let classifier = app.getPlaylistClassifier(id);
        let index = -1;
        let typeId = app.getPlaylistTypeID(id);
       
        deletePlaylistMessage(id);

        if (classifier === USER_MULTIPART_CLASSIFIER)
        {
            deleteMultipartMessage(id);
        }
        else if (classifier === USER_MRA_CLASSIFIER)
        {
            deleteMraMessage(id);
        }

        // Determine which window to update
        if (app.getCategoryParentID(typeId) !== 0)
        {
            app.updatePlaylist(typeId, PL_Level.level_3);  
        }
        else
        {
            app.updatePlaylist(typeId, PL_Level.level_2);  
        }

        deleteQuicklistMessage(id);
        app.updateQuicklist();

    });

}); //end Document ready

/**
 * Function called when a station is clicked
 *
 * @param {element} area - the area element
 */
function stationClicked(area)
{
    let id = area.getAttribute("id");
    let index = area.getAttribute("id").indexOf('_');
    let fragment = id.substring(index+1);
    let fragment_text = app.getFragmentText(fragment);
    let station_list = [];
    let station_fragment_list = [];
    let current_list = [];
    let current = '';
    let e = 0;

    // Get the station fragment lists
    station_fragment_list = app.stationFragmentList[app.current_map_display];
    app.stationFragmentList[app.current_map_display] = [];

    if (app.map_display_state === MapDisplayStates.single_selection)
    {
        
        //Display Station
        $('#selectedStationList').html(`<ul class="message_font" style="margin: 0px">`);
        $('#selectedStationList')
                .append(`<li>${fragment_text}</li><ul>`);

        // Set the station fragment
        app.stationFragmentList[app.current_map_display].push(fragment);
    
    }
    else if (app.map_display_state === MapDisplayStates.multi_selection)
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

        app.stationFragmentList[app.current_map_display] = station_fragment_list;

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

    app.updateMessagePanels();
}


