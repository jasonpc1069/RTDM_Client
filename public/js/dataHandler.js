$(document).ready(function(){
    
    // Determine whether the document loading is complete
    if( document.readyState !== 'complete') 
    {
        // Document loading not complete - wait for completion
        let interval = setInterval(function() {
            if(document.readyState === 'complete') {
                clearInterval(interval);
                loadData();
                app.initialise();
            }    
        }, 10);
    }
    else
    {
        // Document load completed
        loadData();
        app.initialise();
    }
})

/**
 * Load the application data
 *
 */
function loadData()
{
    $.ajaxSetup({
        async: false
    });

    // Load Application Data
    $.getJSON('data/current/app_data.json',(appData)=>{
        if(appData){
            let local = '';
            if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
            {
                local = "LOCAL ";
            }

            app.version = appData.version;
            app.applicationName = appData.description;
            $('#appData')
                .append(`<img src="${appData.logo}" alt="TfL Logo" width="150">
                <p class="navbar-text project-name text-dark">${local}${appData.name} |
                    <span class="project-logo">${appData.description}</span></p>`);
        }
    });

    app.updateStatusBar();


    // Load Fragment Data
    $.getJSON('data/current/fragment_data.json',(fragmentData)=>{
        let id = 0;
        if(fragmentData){
            app.completeFragmentData = fragmentData;
            $.each(fragmentData, (key, value)=>{
                id = value.section_id;
                app.fragmentText.section[id] = value.section_position.toUpperCase();
                app.fragmentText.text[id] = value.message_name.trim();
            })
        }
    });

    // Load Disruption Data
    $.getJSON('data/current/disruption_types.json',(typeData)=>{
        if(typeData){
            app.disruptionTypeData  = typeData;
        }
    });
    
    // Load Line Data
    $.getJSON('data/current/line_data.json',(lineData)=>{
        if(lineData){
            $.each(lineData, (key, value)=>{
                let background = "#e6e6e6";
                let text_colour = "black";
                let str = "Other";
                let id =  value.id;
                let fragment_id = 0;

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
    });

    // Load the Preamble Data
    $.getJSON('data/current/preamble_data.json',(preambleData)=>{
        let str = '';
        let id = 0;

        if(preambleData){
            let read = $.each(preambleData, (key, value)=>{
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
                                .append(`<button type="button" class="preamble btn btn-outline-dark active" id="preamble_${id}" name="preamble" value="${str}">${str}</button>`);
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
    })
    
    // Load Disruption Data
    $.getJSON('data/current/disruption_data.json',(disruptionData)=>{
        let str = '';
        let id = 0;
        let splitstr = '';

        if(disruptionData){
            $.each(disruptionData, (key, value)=>{
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
    });

    // Load Reason Data
    $.getJSON('data/current/reason_data.json',(reasonData)=>{
        let id = 0;
        let str = '';

        if(reasonData){
            $.each(reasonData, (key, value)=>{
                str = value.button_text;
                id = value.id;
                $('#reasonList')
                    .append(`<button type="button" class="reason btn btn-outline-dark" disabled id="reason_${id}" name="reason" value="${str}">${str}</button>`); 
            })
        }
    });

    //Load Detail Data
    $.getJSON('data/current/detail_data.json',(detailData)=>{
        let arr = [];
        let id = 0;
        let str = '';
        let icon = '';
        let b = 0;
        
        if(detailData){
            $.each(detailData, (key, value)=>{
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
                                .append(`<button type="button" class="detail btn btn-outline-dark" id="detail_${id}" name="detail" data-toggle="modal" data-target="#stationModal" data-dismiss="modal" value="${str}" disabled><i class="fas fa-${icon}"></i><br>${str}</button>`);
                        }
                        else
                        {
                            $('#detailList')
                                .append(`<button type="button" class="detail btn btn-outline-dark" id="detail_${id}" name="detail" value="${str}" disabled><i class="fas fa-${icon}"></i><br>${str}</button>`);
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
    });

    // Load Direction Data
    $.getJSON('data/current/direction_data.json',(directionData)=>{
        let id = 0;
        let str = '';
        if(directionData){
            $.each(directionData, (key, value)=>{
                str = value.button_text;
                id = value.id;
                $('#directionList')
                    .append(`<button type="button" class="direction btn btn-outline-dark" id="direction_${id}" name="direction" value="${id}" disabled><i class="fas fa-${value.icon}"></i><br>${value.button_text}</button>`);
            })
        }
    });


    // Load Ticket Data
    $.getJSON('data/current/ticket_data.json',(ticketData)=>{
        if(ticketData){
            app.ticketFragments = ticketData.fragmentId;
            app.ticketGroup = ticketData.group;
    
            app.buildTicketList();
        }
    })
}