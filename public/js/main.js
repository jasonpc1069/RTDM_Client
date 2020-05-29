$(document).ready(() => {
    var disruptionText = '';
    var reasonText = '';
    var lineButton = '';
    var preambleText ='';
    var lineText ='';
    var preambleAudio ='';
    var disruptionAudio = [];
    var reasonAudio ='';
    var lineAudio = '';
    var fragmentText = [];

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
        if(reasonData){
            $.each(reasonData, (key, value)=>{
                var str = value.button_text;
                $('#reasonList')
                    .append(`<button type="radio" class="reason btn btn-outline-dark" disabled id="reasonClick" name="reason" value="${str}">${value.button_text}</button>`);         
            })
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
    });

    $(document).on('click', '#lineClick', (evt)=>{
        var butVal = $(evt.target).attr('value');
        lineButton = $(evt.target);
    
        $.getJSON('/line_data.json',(lineData)=>{
            if(lineData){
                $.each(lineData, (key, value)=>{
                    if (butVal == value.id)
                    {
                        if (value.lines.length > 1)
                        {
                            $('#lineSelectedList').empty();
                            
                            for(var l=0; l<value.lines.length; l++) 
                            {
                                $('#lineSelectedList')
                                    .append(`<button type="button" class="btn btn-primary btn-block" data-dismiss="modal" value="${value.lines[l].line}" id="lineSelectionClick"
                                    style="background-color: ${value.lines[l].background_colour}; color: ${value.lines[l].text_colour}">${value.lines[l].line}</button>`);
                            }
                        }
                        else
                        {
                            lineButton.siblings().css('background-color', '#e9ecef');
                            lineButton.siblings().css('color', 'black');
                            lineButton.siblings().text(lineButton.siblings().attr('name'));

                            lineButton.css('background-color', value.lines[0].background_colour);
                            lineButton.css('color', value.lines[0].text_colour);

                            var id = value.lines[0].audio;
                            lineText = fragmentText[id];
                            lineAudio = id;
                            
                            updateMessageAssembler();
                        }
                    }
                })
            }
        })
    });

    $(document).on('click', '#lineSelectionClick', (evt)=>{
        var butVal = $(evt.target).attr('value');
        
    
        $.getJSON('/line_data.json',(lineData)=>{
            if(lineData){
                $.each(lineData, (key, value)=>{
                    if (lineButton.attr('value') == value.id)
                    {
                        for(var l=0; l<value.lines.length; l++) 
                        {
                            if (value.lines[l].line == butVal)
                            {
                                lineButton.siblings().css('background-color', '#e9ecef');
                                lineButton.siblings().css('color', 'black');

                                lineButton.css('background-color', value.lines[l].background_colour);
                                lineButton.css('color', value.lines[l].text_colour);
                                lineButton.text(value.lines[l].line);

                                var id = value.lines[l].audio;
                                lineText = fragmentText[id];
                                lineAudio = id;

                                updateMessageAssembler();
                            }
                        }
                    }
                })
            }
        })
    });

    $(document).on('click', '#disruptionClick', (evt)=>{
        var butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');

        $.getJSON('/disruption_data.json',(disruptionData)=>{
            if(disruptionData){
                $.each(disruptionData, (key, value)=>{
                    if (butVal == value.button_text)
                    {
                        var text = generateFragmentText(value.audio);
                            
                        if (!value.reason)
                        {
                            reasonText = '';
                            reasonAudio = '';

                            $('#reasonSelectedList').empty();

                            $('.reason').each(function()   {
                                $(this).removeClass('active');
                            })
                        }

                        $('.reason').each(function()   {
                            $(this).prop('disabled', !value.reason);
                        })

                        disruptionText = text;
                        disruptionAudio = value.audio;

                        updateMessageAssembler();                        
                    }
                })
            }
        })
    });

    $(document).on('click', '#preambleClick', (evt)=>{
        var butVal = $(evt.target).attr('value');

        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
        
        $.getJSON('/preamble_data.json',(preamble)=>{
            if(preamble){
                $.each(preamble, (key, value)=>{
                    if (butVal == value.text)
                    {
                        preambleText = fragmentText[value.audio];
                        preambleAudio = value.audio;

                        updateMessageAssembler();
                    }
                })
            }
        })
    });

    

    $("#reasonSelectedList").on('click','li',function() {
        $(this).siblings().css('background-color', '#e9ecef');
        $(this).siblings().css('color', 'black');
        
        $(this).css('background-color', 'green');
        $(this).css('color', 'white');

        reasonText = $(this).text();

        $.getJSON('/reason_data.json',(reasonData)=>{
            if(reasonData){
                $.each(reasonData, (key, value)=>{
                    
                    for(var m=0; m<value.message.length; m++) 
                    {      
                        var id = value.message[m].fragmentId
                        var str = fragmentText[id];
                        if (str == reasonText)
                        {
                            reasonAudio = id;
                        }
                    } 
                })
            }
        });

        updateMessageAssembler();
    });

    $(document).on('click', '#reasonClick', (evt)=>{
        var butVal = $(evt.target).attr('value');
                    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');

        $.getJSON('/reason_data.json',(reasonData)=>{
            if(reasonData){
                $.each(reasonData, (key, value)=>{
                    if (butVal == value.button_text)
                    {
                        for(var m=0; m<value.message.length; m++) 
                        {      
                            var id = value.message[m].fragmentId;
                            if (m==0)
                            {
                                $('#reasonSelectedList')
                                    .html(`<li class="list_font">${fragmentText[id]}</li>`);
                            }
                            else
                            {
                                $('#reasonSelectedList')
                                    .append(`<li class="list_font">${fragmentText[id]}</li>`);
                            }
                        } 
                    }           
                })
            }
        });
    });

    $(document).on('click', '#previewClick', (evt)=>{
        previewSound();
    });

    function updateMessageAssembler()
    {
        var temp_text = disruptionText.replace("{line}", lineText);

        if (disruptionText)
        {
            if (reasonText)
            {
                $('#messageAssembly')
                        .html(`<span class="message_font"><u>${preambleText}</u> | ${temp_text} | ${reasonText} |</span>`);
            }
            else
            {
                $('#messageAssembly')
                        .html(`<span class="message_font"><u>${preambleText}</u> | ${temp_text} |</span>`);
            }
        }
        else  if (reasonText)
        {
            $('#messageAssembly')
                    .html(`<span class="message_font"><u>${preambleText}</u> | ${reasonText} |</span>`);
        }
        else
        {
            $('#messageAssembly')
                    .html(`<span class="message_font"><u>${preambleText}</u> |</span>`);
        }
    }

    function previewSound()
    {
        var file_names=[];
        var song = 0;

        //Preamble
        if (preambleAudio)
        {
            file_names[song] = 'media/wavfiles/' + preambleAudio + '.wav';
            song = song + 1;
        } 

        // Disruption
        if (disruptionAudio.length>0)
        {
            for (d=0; d<disruptionAudio.length;d++)
            {
                if (disruptionAudio[d] == 7000)
                {
                    file_names[song] = 'media/wavfiles/' + lineAudio + '.wav';
                    song = song + 1;
                    
                }
                else if ((disruptionAudio[d] != 7001) && (disruptionAudio[d] != 0))
                {
                    file_names[song] = 'media/wavfiles/' + disruptionAudio[d] + '.wav';
                    song = song + 1;
                }
            }
        }

        //Reason
        if (reasonAudio)
        {
            file_names[song] = 'media/wavfiles/' + reasonAudio + '.wav';
            song = song + 1;
        } 

        playSound(file_names);
    }

    function playSound(file_names) {
        var sound = new Howl({
            src: [file_names[0]],
            onend: function() {
                file_names.shift();
                if (file_names.length > 0) {
                    playSound(file_names);
                }
            }
        });      
        sound.play();
    } 
    
    function generateFragmentText(fragmentElements)
    {
        var text = '';

        for (f = 0; f <fragmentElements.length; f++)
        {
            if (f != 0)
            {
                text = text + ' | ';
            }

            if (fragmentElements[f] == 7000)
            {
                text = text + '{line}'
            }
            else
            {
                text = text + fragmentText[fragmentElements[f]];
            }
        }

        return text;
    }
})