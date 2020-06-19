$(document).ready(function(){
    $.ajaxSetup({
        async: false
    });

    $.getJSON('data/current/app_data.json',(appData)=>{
        if(appData){
            var local = '';
            if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
            {
                local = "LOCAL ";
            }

            version = appData.version;
            applicationName = appData.description;
            $('#appData')
                .append(`<img src="${appData.logo}" alt="TfL Logo" width="150">
                <p class="navbar-text project-name text-dark">${local}${appData.name} |
                    <span class="project-logo">${appData.description}</span></p>`);
        }
    });

    updateStatusBar();

    $.getJSON('data/current/fragment_data.json',(fragmentData)=>{
        if(fragmentData){
            $.each(fragmentData, (key, value)=>{
                fragmentText[value.section_id] = value.detail;
            })
        }
    });
    $.getJSON('data/current/line_data.json',(lineData)=>{
        if(lineData){
            $.each(lineData, (key, value)=>{
                var background = "#e6e6e6";
                var text_colour = "black";
                var str = "Other";
                var id =  value.id;
                var fragment_id = 0;

                if (value.lines.length == 1)
                {
                    str = value.lines[0].line;

                    if (value.active != 0)
                    {
                        background = value.lines[0].background_colour;
                        text_colour = value.lines[0].text_colour;

                        fragment_id = value.lines[0].fragment;
                        lineText = fragmentText[fragment_id];
                        lineFragment = fragment_id;
                        lineImage = value.lines[0].image;
                        stations = value.lines[0].stations;
                        station_image_scale =  value.lines[0].image_scale;
                    }
                }

                if (value.lines.length == 1)
                {
                    $('#lineList')
                                .append(`<button type="button" class="line btn btn-dark" id="line_${id}" value="${id}"
                                name="${str}" style="background-color: ${background}; color: ${text_colour}">${str}</button>`);
                }
                else
                {
                    $('#lineList')
                                .append(`<button type="button" class="line btn btn-dark" id="line_${id}" value="${id}" data-toggle="modal" data-target="#lineModal"
                                name="${str}" style="background-color: ${background}; color: ${text_colour}">${str}</button>`);
                }
                
            })
        }
    });

    $.getJSON('data/current/preamble_data.json',(preambleData)=>{
        var str = '';
        var id = 0;

        if(preambleData){
            var read = $.each(preambleData, (key, value)=>{
                str = value.text;
                id = value.id;
                
                if (!preambleText)
                {
                    preambleText = fragmentText[value.fragment_id];
                    preambleFragment = value.fragment_id;
                }

                if (value.active == 1)
                {
                    $('#preambleList')
                                .append(`<button type="button" class="preamble btn btn-outline-success active" id="preamble_${id}" name="preamble" value="${str}">${str}</button>`);
                    preambleText = fragmentText[value.fragment_id];
                    preambleFragment = value.fragment_id;

                    // Set Initial values
                    start_preamble_fragment = value.fragment_id;
                    start_preamble_id = id;
                }
                else
                {
                    $('#preambleList')
                                .append(`<button type="button" class="preamble btn btn-outline-success" id="preamble_${id}" name="preamble" value="${str}">${str}</button>`);
                }  
            }) 
        }
    })
    
    $.getJSON('data/current/disruption_data.json',(disruptionData)=>{
        var str = '';
        var id = 0;
        var splitstr = '';

        if(disruptionData){
            $.each(disruptionData, (key, value)=>{
                str = value.button_text;
                id = value.id;

                // Determine whether the button is the initial button
                if (value.active == 1 && start_disruption_id == 0)
                {
                    start_disruption_id = id;
                    start_disruption_fragments = value.fragment_id;
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

    $.getJSON('data/current/reason_data.json',(reasonData)=>{
        var arr = [];
        var id = 0;
        var str = '';

        if(reasonData){
            $.each(reasonData, (key, value)=>{
                str = value.button_text;
                id = value.id;
                $('#reasonList')
                    .append(`<button type="button" class="reason btn btn-outline-dark" disabled id="reason_${id}" name="reason" value="${str}">${str}</button>`); 
    
                    for (f = 0; f < value.fragmentId.length; f++)
                    {
                        arr.push(value.fragmentId[f]);
                    }
            })

            // Create Unique Array
            reasonFragments = arr.filter(function(item, pos){
                return arr.indexOf(item)== pos; 
              });
        }
    });


    $.getJSON('data/current/detail_data.json',(detailData)=>{
        var arr = [];
        var id = 0;
        var str = '';
        var icon = '';
        var b = 0;
        if(detailData){
            $.each(detailData, (key, value)=>{
                var panel_id = value.panel_id;
                for (b = 0; b < value.buttons.length; b++)
                {
                    str = value.buttons[b].button_text;
                    id = value.buttons[b].id;
                    icon = value.buttons[b].icon
               
                    if (panel_id == DetailPanels.detail)
                    {
                        if (value.buttons[b].display_map != MapDisplayStates.no_map)
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
                    else if (panel_id == DetailPanels.detail_1)
                    {
                        $('#detail_1_list')
                            .append(`<button type="button" class="detail_1 btn btn-outline-dark" id="detail_1_${id}" name="detail_1" data-toggle="modal" data-target="#stationModal" value="${str}" disabled>${str}</button>`);
                    }
                    else if (panel_id == DetailPanels.additional_detail)
                    {
                        $('#additional_detail_list')
                            .append(`<button type="button" class="additional_detail btn btn-outline-dark" id="additional_detail_${id}" name="additional_detail" data-toggle="modal" data-target="#stationModal" value="${str}" disabled>${str}</button>`);
                    }
                    else if (panel_id == DetailPanels.rest_of_line)
                    {
                        $('#rest_of_line_list')
                            .append(`<button type="button" class="rest btn btn-outline-dark" id="rest_${id}" name="rest" value="${str}" disabled>${str}</button>`);
                    }
                }
            })
        }
    });

    $.getJSON('data/current/direction_data.json',(directionData)=>{
        var id = 0;
        var str = '';
        if(directionData){
            $.each(directionData, (key, value)=>{
                str = value.button_text;
                id = value.id;
                $('#directionList')
                    .append(`<button type="button" class="direction btn btn-outline-dark" id="direction_${id}" name="direction" value="${id}" disabled><i class="fas fa-${value.icon}"></i><br>${value.button_text}</button>`);
            })
        }
    });

    $.getJSON('data/current/ticket_data.json',(ticketData)=>{
        var id = 0;
        var str = '';
        var t;

        if(ticketData){
            $.each(ticketData, (key, value)=>{
                str = value.button_text;
                ticketFragments = value.fragmentId;
                for (t = 0; t < value.tickets.length; t++)
                {
                    id = value.tickets[t].fragmentId;
                    $('#ticketSelectionList')
                        .append(`<li class="list_font ticket_item ticket_disabled" id="ticket_${id}">${fragmentText[id]}</li>`);
                }
            })
        }
    });

    
})