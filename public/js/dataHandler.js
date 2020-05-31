$(document).ready(() => {
    $.ajaxSetup({
        async: false
    });

    $.getJSON('app_data.json',(appData)=>{
        if(appData){
            version = appData.version;
            $('#appData')
                .append(`<img src="${appData.logo}" alt="TfL Logo" width="150">
                <p class="navbar-text project-name text-dark">${appData.name} |
                    <span class="project-logo">${appData.description}</span>
                    <span class="heading_font">Version ${appData.version}</span></p>`);
        }
    });

    $.getJSON('fragment_data.json',(fragmentData)=>{
        if(fragmentData){
            $.each(fragmentData, (key, value)=>{
                fragmentText[value.section_id] = value.detail;
            })
        }
    });
    
    $.getJSON('disruption_data.json',(disruptionData)=>{
        if(disruptionData){
            $.each(disruptionData, (key, value)=>{
                var str = value.button_text;

                if (str.length > 0)
                {
                    var splitstr = str.split(' ');

                    if (splitstr.length > 1)
                    {
                        $('#disruptionList')
                            .append(`<button type="radio" class="disruption btn btn-outline-dark" id="disruptionClick" name="disruption" value="${str}">${splitstr[0]}<br>${splitstr[1]}</button>`);
                    }
                    else
                    {
                        $('#disruptionList')
                            .append(`<button type="radio" class="disruption btn btn-outline-dark" id="disruptionClick" name="disruption" value="${str}">${splitstr[0]}</button>`);
                    }
                }            
            })
        }
    });

    $.getJSON('/reason_data.json',(reasonData)=>{
        var arr = [];
        if(reasonData){
            $.each(reasonData, (key, value)=>{
                var str = value.button_text;
                $('#reasonList')
                    .append(`<button type="radio" class="reason btn btn-outline-dark" disabled id="reasonClick" name="reason" value="${str}">${value.button_text}</button>`); 
    
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

    $.getJSON('/line_data.json',(lineData)=>{
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

                        var id = value.lines[0].audio;
                        lineText = fragmentText[id];
                        lineAudio = id;
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

    $.getJSON('/preamble_data.json',(preambleData)=>{
        if(preambleData){
            $.each(preambleData, (key, value)=>{
                var str = value.text;

                if (!preambleText)
                {
                    preambleText = fragmentText[value.audio];
                    preambleAudio = value.audio;
                }

                if (value.active == 1)
                {
                    $('#preambleList')
                                .append(`<button type="radio" class="preamble btn btn-outline-success active" id="preambleClick" name="preamble" value="${str}">${str}</button>`);
                    preambleText = fragmentText[value.audio];
                    preambleAudio = value.audio;
                }
                else
                {
                    $('#preambleList')
                                .append(`<button type="radio" class="preamble btn btn-outline-success" id="preambleClick" name="preamble" value="${str}">${str}</button>`);
                }

                updateMessageAssembler();
                
            })
        }
    })
})