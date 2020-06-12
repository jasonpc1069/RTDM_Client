$(document).ready(function(){
    $('.line').click(function(evt){ 
        var butVal = $(evt.target).attr('value');
        lineButton = $(evt.target);

        $.getJSON('data/current/line_data.json',(lineData)=>{
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
                                    .append(`<button type="button" class="btn btn-primary btn-block lineSelection" data-dismiss="modal" value="${value.lines[l].line}" id="line_selection_${l}"
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

                            var id = value.lines[0].fragment;
                            lineText = fragmentText[id];
                            lineFragment = id;
                            lineImage = value.lines[0].image;
                            stations = value.lines[0].stations;
                            station_image_scale =  value.lines[0].image_scale;
                            
                            updateMessagePanels();
                        }
                    }
                })
            }
        })
    });

    $('.preamble').click(function(evt){ 
        var butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
        
        $.getJSON('data/current/preamble_data.json',(preamble)=>{
            if(preamble){
                $.each(preamble, (key, value)=>{
                    if (butVal == value.text)
                    {
                        preambleText = fragmentText[value.fragment_id];
                        preambleFragment = value.fragment_id;
    
                        updateMessagePanels();
                    }
                })
            }
        })
    });

    $('.disruption').click(function(evt){    
        var butVal = $(evt.target).attr('value');
    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
    
        $.getJSON('data/current/disruption_data.json',(disruptionData)=>{
            if(disruptionData){
                $.each(disruptionData, (key, value)=>{
                    if (butVal == value.button_text)
                    {
                        var text = generateFragmentText(value.fragment_id);
                            
                        if (!value.reason)
                        {
                            reasonText = '';
                            reasonFragment = '';
    
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
                        disruptionFragment = value.fragment_id;
                        disruptionDetailIds = value.detail_buttons;
    
                        updateMessagePanels();
                        updateDetailButtons(value.detail_buttons); 
                    }
                })
            }
        })
    });

    $('.reason').click(function(evt){
        var butVal = $(evt.target).attr('value');
                    
        evt.preventDefault();
        $(evt.target).siblings().removeClass('active');
    
        $('#reasonSelectedList').empty();
        $('#reasonClear').prop('disabled', false);
        reasonText = '';
        reasonFragment = '';
    
        updateMessagePanels();
        
        $.getJSON('data/current/reason_data.json',(reasonData)=>{
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
    
                        // Update Detail Buttons
                        if (value.detail_buttons.length != 0)
                        {
                            updateDetailButtons(value.detail_buttons);
                        }
                    }           
                })
            }
        });
    });

    $('.detail').click(function(evt){
        var butVal = $(evt.target).attr('value');
        var x1 = 0;
        var y1 = 0;
        var x2 = 0;
        var y2 = 0;
        var scale = (station_image_scale / 100);
    
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
        $('#stationImage')
            .html(`<img src="/img/${lineImage}" alt="stationselection" id="station" usemap="#stationMap">`);
            
        $('#stationAreas').empty();
        for (s=0; s < stations.length; s++)
        {
            x1 = (stations[s].coordinates.xpos * scale);
            y1 = (stations[s].coordinates.ypos * scale);
            x2 = x1 + (stations[s].coordinates.width * scale);
            y2 = y1 + (stations[s].coordinates.height * scale);
    
            $('#stationAreas').
                append (`<area shape="rect" coords="${x1},${y1},${x2},${y2}" 
                    alt="${stations[s].station_name}" onclick="stationClicked(this)" id="stationArea" title="${stations[s].station_name}">`);
        }
    });
    
    $('.direction').click(function(evt){
        var butVal = $(evt.currentTarget).attr('value');
    
        evt.preventDefault();
        $(evt.currentTarget).siblings().removeClass('active');
    
        $.getJSON('data/current/direction_data.json',(directionData)=>{
            if(directionData){
                $.each(directionData, (key, value)=>{
                    if (butVal == value.id)
                    {
                        directionFragment = value.fragment_id;
                        directionPosition = value.text_position;
                    
                        updateMessagePanels();
                    }
                })
            }
        })
    });

    $(document).on('keyup', '#textualMessage', function (e) {
        updateTextualMessageLength();
        clearTimeout(spellingTimer);
        spellingTimer = setTimeout(onTextualMessageEdit, spellingInterval);
    });

    $(document).on("click", "#textualSuggestions li", function(event) {
        correctSpelling($(this).text());
      });
});



// window.addEventListener('load', function() {
//     var editbox = document.getElementById("textualMessage")

//     editbox.addEventListener('keyup', (e) => {
//         updateTextualMessageLength();
//         clearTimeout(spellingTimer);
//         spellingTimer = setTimeout(spellCheckTextualMessage, spellingInterval);
//         // if (32 === e.keyCode) {
//         //     alert("this should appear");
//         // }        
//     });
// });

$(document).on('click', '.lineSelection', (evt)=>{
    var butVal = $(evt.target).attr('value');

    $.getJSON('data/current/line_data.json',(lineData)=>{
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

                            var id = value.lines[l].fragment;
                            lineText = fragmentText[id];
                            lineFragment = id;
                            lineImage = value.lines[l].image;
                            stations = value.lines[l].stations;
                            station_image_scale =  value.lines[l].image_scale;

                            updateMessagePanels();
                        }
                    }
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
    
    reasonFragment = id;
    
    updateMessagePanels();
});



$(document).on('click', '#reasonTextSearch', (evt)=>{
    var text = document.getElementById('reasonText').value;
    text = text.toLowerCase();
            
    $('#reasonSelectedList').empty();
    reasonText = '';
    reasonFragment = '';

    $('.reason').each(function()   {
        $(this).removeClass('active');
    })

    filterReasons(text);

    updateMessagePanels();
});

$(document).on('click', '#reasonSearchClear', (evt)=>{
    document.getElementById('reasonText').value = "";
    reasonText = '';
    reasonFragment = '';
    
    $('.reason').each(function()   {
        $(this).removeClass('active');
    })
    filterReasons('.*');

    updateMessagePanels();
});

$(document).on('click', '#reasonClear', (evt)=>{
    $('#reasonClear').prop('disabled', true);

    reasonText = '';
    reasonFragment = '';

    $('#reasonSelectedList').empty();

    $('.reason').each(function()   {
        $(this).removeClass('active');
    })

    $('.reason').each(function()   {
        $(this).removeClass('active');
    })
    filterReasons('.*');

    updateMessagePanels();

    // Update Detail Buttons
    if (disruptionDetailIds.length != 0)
    {
        updateDetailButtons(disruptionDetailIds);
    }
});

// Assembler Buttons
$(document).on('click', '#previewClick', (evt)=>{
    if ($('#messageAssembly').contents().length > 0)
    {
        $(evt.target).prop('disabled',true);
        previewEvt = evt;
        previewSound();
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
    if (assembledFragments.selected < (assembledFragments.fragments.length-1))
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
    }

    if (assembledFragments.selected > (assembledFragments.fragments.length-1))
    {
        assembledFragments.selected = (assembledFragments.fragments.length-1);
    }

    updateMessageAssembler();
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
    $('#selectedStationList')
            .html(`<span class="message_font">`);

    $('#selectedStationList')
    .append(`${area.getAttribute("alt")}<br>`);    
}

$(document).on('shown.bs.modal','#stationModal', function () {
    // $( '#station' ).each( function() {
    //     var $img = $( this);
    //     $img.width( $img.width() * (station_image_scale / 100) );
    // });

    // $('#stationModal').modal('handleUpdate')
})

$(document).on('click', '#stationClear', (evt)=>{
    $('#selectedStationList').empty();
});

