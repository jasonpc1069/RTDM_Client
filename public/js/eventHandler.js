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

                        $('#reasonTextSearch').prop('disabled', true);
                        $('#reasonSearchClear').prop('disabled', true);
                        $('#reasonText').prop('disabled', true);
                        $('#reasonClear').prop('disabled', true);
                    }
                    else
                    {
                        if ($('#reasonSelectedList').contents().length == 0)
                        {
                            filterReasons('.*');
                        }
                    }
                    
                    $('.reason').each(function()   {
                        $(this).prop('disabled', !value.reason);
                    })

                    $('#reasonTextSearch').prop('disabled', !value.reason);
                    $('#reasonSearchClear').prop('disabled', !value.reason);
                    $('#reasonText').prop('disabled', !value.reason);

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

    var id = $(this).attr('id').split("_").pop();
    
    reasonAudio = id;
    
    updateMessageAssembler();
});

$(document).on('click', '#reasonClick', (evt)=>{
    var butVal = $(evt.target).attr('value');
                
    evt.preventDefault();
    $(evt.target).siblings().removeClass('active');

    $('#reasonSelectedList').empty();
    $('#reasonClear').prop('disabled', false);
    reasonText = '';
    reasonAudio = '';
    updateMessageAssembler();
    
    $.getJSON('/reason_data.json',(reasonData)=>{
        if(reasonData){
            $.each(reasonData, (key, value)=>{
                if (butVal == value.button_text)
                {
                    if (value.search_criteria)
                    {
                        filterReasons(value.search_criteria);
                    }
                    else
                    {
                        for(var f=0; f<value.fragmentId.length; f++) 
                        {      
                            var id = value.fragmentId[f];
                            if (f==0)
                            {
                                $('#reasonSelectedList')
                                    .html(`<li class="list_font" id="reason_${id}">${fragmentText[id]}</li>`);
                            }
                            else
                            {
                                $('#reasonSelectedList')
                                    .append(`<li class="list_font" id="reason_${id}">${fragmentText[id]}</li>`);
                            }
                        } 
                    }
                }           
            })
        }
    });
});

$(document).on('click', '#reasonTextSearch', (evt)=>{
    var text = document.getElementById('reasonText').value;
            
    $('#reasonSelectedList').empty();
    reasonText = '';
    reasonAudio = '';

    $('.reason').each(function()   {
        $(this).removeClass('active');
    })

    filterReasons(text);
    updateMessageAssembler();
});

$(document).on('click', '#reasonSearchClear', (evt)=>{
    document.getElementById('reasonText').value = "";
    reasonText = '';
    reasonAudio = '';
    
    $('.reason').each(function()   {
        $(this).removeClass('active');
    })
    filterReasons('.*');
    updateMessageAssembler()
});

$(document).on('click', '#reasonClear', (evt)=>{
    $('#reasonClear').prop('disabled', true);

    reasonText = '';
    reasonAudio = '';

    $('#reasonSelectedList').empty();

    $('.reason').each(function()   {
        $(this).removeClass('active');
    })
    
    $('.reason').each(function()   {
        $(this).removeClass('active');
    })
    filterReasons('.*');
    updateMessageAssembler();
});

$(document).on('click', '#previewClick', (evt)=>{
    $(evt.target).prop('disabled',true);
    previewEvt = evt;
    previewSound();
});