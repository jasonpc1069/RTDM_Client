$(document).ready(() => {
    $.ajaxSetup({
        async: false
    });

    $.getJSON('data/current/app_data.json',(appData)=>{
        if(appData){
            version = appData.version;
            applicationName = appData.description;
            $('#appData')
                .append(`<img src="${appData.logo}" alt="TfL Logo" width="150">
                <p class="navbar-text project-name text-dark">${appData.name} |
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
    
    $.getJSON('data/current/disruption_data.json',(disruptionData)=>{
        if(disruptionData){
            $.each(disruptionData, (key, value)=>{
                var str = value.button_text;

                if (str.length > 0)
                {
                    var splitstr = str.split(' ');

                    if (splitstr.length > 1)
                    {
                        $('#disruptionList')
                            .append(`<button type="button" class="disruption btn btn-outline-dark" id="disruptionClick" name="disruption" value="${str}">${splitstr[0]}<br>${splitstr[1]}</button>`);
                    }
                    else
                    {
                        $('#disruptionList')
                            .append(`<button type="button" class="disruption btn btn-outline-dark" id="disruptionClick" name="disruption" value="${str}">${splitstr[0]}</button>`);
                    }
                }            
            })
        }
    });

    $.getJSON('data/current/reason_data.json',(reasonData)=>{
        var arr = [];
        if(reasonData){
            $.each(reasonData, (key, value)=>{
                var str = value.button_text;
                $('#reasonList')
                    .append(`<button type="button" class="reason btn btn-outline-dark" disabled id="reasonClick" name="reason" value="${str}">${value.button_text}</button>`); 
    
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
        if(detailData){
            $.each(detailData, (key, value)=>{
                var str = value.button_text;
                $('#detailList')
                    .append(`<button type="button" class="detail btn btn-outline-dark" id="detailClick" name="detail" data-toggle="modal" data-target="#stationModal" value="${str}"><i class="fas fa-${value.icon}"></i><br>${value.button_text}</button>`);
            })
        }
    });

    $.getJSON('data/current/direction_data.json',(directionData)=>{
        var arr = [];
        if(directionData){
            $.each(directionData, (key, value)=>{
                var str = value.button_text;
                $('#directionList')
                    .append(`<button type="button" class="direction btn btn-outline-dark" disabled id="directionClick" name="direction" value="${str}"><i class="fas fa-${value.icon}"></i><br>${value.button_text}</button>`);
            })
        }
    });

    $.getJSON('data/current/line_data.json',(lineData)=>{
        if(lineData){
            $.each(lineData, (key, value)=>{
                var background = "#e6e6e6";
                var text_colour = "black";
                var str = "Other";

                if (value.lines.length == 1)
                {
                    str = value.lines[0].line;

                    if (value.active != 0)
                    {
                        background = value.lines[0].background_colour;
                        text_colour = value.lines[0].text_colour;

                        var id = value.lines[0].fragment;
                        lineText = fragmentText[id];
                        lineFragment = id;
                        lineImage = value.lines[0].image;
                        stations = value.lines[0].stations;
                        station_image_scale =  value.lines[0].image_scale;
                    }
                }

                if (value.lines.length == 1)
                {
                    $('#lineList')
                                .append(`<button type="button" class="line btn btn-dark" id="lineClick" value="${value.id}"
                                name="${str}" style="background-color: ${background}; color: ${text_colour}">${str}</button>`);
                }
                else
                {
                    $('#lineList')
                                .append(`<button type="button" class="line btn btn-dark" id="lineClick" value="${value.id}" data-toggle="modal" data-target="#lineModal"
                                name="${str}" style="background-color: ${background}; color: ${text_colour}">${str}</button>`);
                }
                
            })
        }
    });

    $.getJSON('data/current/preamble_data.json',(preambleData)=>{
        if(preambleData){
            $.each(preambleData, (key, value)=>{
                var str = value.text;
                

                if (!preambleText)
                {
                    preambleText = fragmentText[value.audio];
                    preambleFragment = value.audio;
                }

                if (value.active == 1)
                {
                    $('#preambleList')
                                .append(`<button type="button" class="preamble btn btn-outline-success active" id="preambleClick" name="preamble" value="${str}">${str}</button>`);
                    preambleText = fragmentText[value.audio];
                    preambleFragment = value.audio;
                }
                else
                {
                    $('#preambleList')
                                .append(`<button type="button" class="preamble btn btn-outline-success" id="preambleClick" name="preamble" value="${str}">${str}</button>`);
                }

                compileAssembledFragments();
                updateMessageAssembler();
                
            })
        }
    })
})