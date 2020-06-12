var disruptionText = '';
var reasonText = '';
var lineButton = '';
var preambleText ='';
var lineText ='';
var preambleFragment =0;
var disruptionFragment = [];
var reasonFragment = 0;
var lineFragment = 0;
var lineImage = 0;
var assembledFragments = {fragments: [], selected: 0};
var textualFragments = {fragments: [], selected: 0, error_count: 0, errors: []};
var fragmentText = [];
var previewEvent = null;
var applicationName ='';
var version = '';
var reasonFragments = [];
var error_messages = [];
var stations = [];
var station_image_scale = 0;
var currentName ='';
var currentRole ='';
var disruptionDetailIds = [];
var directionFragment = '';
var directionPosition = '';
const TOTAL_MESSAGE_LENGTH = 254;
var spellingTimer;                //timer identifier
var spellingInterval = 2000;  //time in ms (5 seconds)
var dictionary = new Typo( "en_GB" );
var html_loaded = false;
var preamble_loaded = false;
var banned_words = [];

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

function initialise()
{
    readTextFile("/dictionaries/bannedwords.dic");
}

function updateMessagePanels()
{
    compileFragments(assembledFragments);
    updateMessageAssembler();
    compileFragments(textualFragments);
    updateTextualMessage();
}

    
function compileFragments(fragments)
{
    fragments.fragments = [];
    
    //Preamble
    if (preambleFragment !=0)
    {
       fragments.fragments.push(preambleFragment);
    }

    // Disruption
    for (var f=0; f<disruptionFragment.length; f++)
    {
        if (disruptionFragment[f] == 7000)
        {
            if (directionFragment)
            {
                if (directionPosition == 2)
                {
                    fragments.fragments.push(lineFragment);
                    fragments.fragments.push(directionFragment);
                }
                else
                {
                    fragments.fragments.push(directionFragment);
                    fragments.fragments.push(lineFragment);
                }
            }
            else
            {
                fragments.fragments.push(lineFragment);
            }
        }
        else
        {
            fragments.fragments.push(disruptionFragment[f]);
        }
    }

    // Reason
    if (reasonFragment != 0)
    {
        fragments.fragments.push(reasonFragment);
    }

    fragments.selected = 0;
}

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
                    .append(`<u>${fragmentText[id]}</u> |`);
        }
        else
        {
            $('#messageAssembly')
                    .append(`${fragmentText[id]} | `);
        }
    }

    $('#messageAssembly')
                    .append(`</span>`);

    updateAssemblyButtons();             
}

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

    $('#textualMessage').html(`<span class="message_font">${message.trim()}</span>`);

    updateTextualMessageLength();
    updateTextualButtons();  
    
    textualFragments.error_count = 0;
    textualFragments.errors = [];

}

function updateTextualMessageLength()
{
    var message = '';
    var contents = '';
    var message_length = 0;
    var char_remaining = 0;

    if(document.getElementById("textualMessage") != null)
    {
         message = document.getElementById('textualMessage').innerText;
    

        message_length = message.trim().length;
        char_remaining = TOTAL_MESSAGE_LENGTH - message_length;
        

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

function updateAssemblyButtons()
{
    if  (assembledFragments.fragments.length > 0)
    {
        $('#assemblyPrevious').prop('disabled', 
            (assembledFragments.selected == 0));
        
        $('#assemblyNext').prop('disabled', 
            (assembledFragments.selected == (assembledFragments.fragments.length - 1)));

        $('#assemblyDelete').prop('disabled', false);
        $('#assemblyClear').prop('disabled', false);
        $('#previewClick').prop('disabled', false);
    }
    else
    {
        $('#assemblyNext').prop('disabled', true);
        $('#assemblyDelete').prop('disabled', true);
        $('#assemblyPrevious').prop('disabled', true);
        $('#assemblyClear').prop('disabled', true);
        $('#previewClick').prop('disabled', true);
    }
}

function updateTextualButtons()
{
    if  (textualFragments.fragments.length > 0)
    {
        $('#textualClear').prop('disabled', false);
    }
    else
    {
        $('#textualNext').prop('disabled', true);
        $('#textualPrevious').prop('disabled', true);
        $('#textualClear').prop('disabled', true);
    }
}

function previewSound()
{
    var file_names=[];
    
    // Build Play List
    for (var f=0; f < assembledFragments.fragments.length; f++)
    {
        file_names[f] = '/media/WavFiles/' + assembledFragments.fragments[f] + '.wav';
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
            else
            {
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

function soundFinished(evt)
{
    $(evt.target).prop('disabled',false);
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

function filterReasons(searchText)
{
    var filterArray = [];

    // Find Fragments based on search criteria
    for(var f=0; f < reasonFragments.length; f++) 
    { 
        var id = reasonFragments[f];
        if (fragmentText[id].includes(searchText) ||
            fragmentText[id].match(searchText))
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
                .html(`<li class="list_font" id="reason_${filterArray[f].id}">${filterArray[f].text}</li>`);
        }
        else
        {
            $('#reasonSelectedList')
                .append(`<li class="list_font" id="reason_${filterArray[f].id}">${filterArray[f].text}</li>`);
        }
    }      
}

function compareFragments( a, b ) {
    if ( a.text < b.text ){
      return -1;
    }
    if ( a.text > b.ltext){
      return 1;
    }
    return 0;
}

function updateStatusBar()
{
    updateStatusApplicationData();
    // updateStatusUserName();
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

function updateDetailButtons(id_list)
{
    var buttons = document.querySelectorAll('.detail');
    var button_name = '';
    var button_id = 0;
    var enabled = true;
    for (b = 0; b<buttons.length; b++)
    {
        button_name = buttons[b].getAttribute('id');
        button_id = button_name.substr(button_name.indexOf('_') + 1);
        buttons[b].disabled = true;
        buttons[b].classList.remove('active');
        for (i = 0; i < id_list.length; i++)
        {
            if (id_list[i] == button_id)
            {
                buttons[b].disabled = false;
            }
        }
    }
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
        .html(`<span class="message_font" style="color: black">${message}</span>`);

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





