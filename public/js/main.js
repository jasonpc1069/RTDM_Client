var disruptionText = '';
var reasonText = '';
var lineButton = '';
var preambleText ='';
var lineText ='';
var preambleFragment =0;
var disruptionFragment = [];
var reasonFragment = 0;
var lineFragment = 0;
var assembledFragments = [];
var assemblerSelectedElement = 0;
var fragmentText = [];
var previewEvent = null;
var version = '';
var reasonFragments = [];

function compileAssembledFragments()
{
    assembledFragments = [];
    
    //Preamble
    if (preambleFragment !=0)
    {
        assembledFragments.push(preambleFragment);
    }

    // Disruption
    for (var f=0; f<disruptionFragment.length; f++)
    {
        if (disruptionFragment[f] == 7000)
        {
            assembledFragments.push(lineFragment);
        }
        else
        {
            assembledFragments.push(disruptionFragment[f]);
        }
    }

    // Reason
    if (reasonFragment != 0)
    {
        assembledFragments.push(reasonFragment);
    }

    assemblerSelectedElement = 0;
}

function updateMessageAssembler()
{
    var id = 0;

    $('#messageAssembly')
                    .html(`<span class="message_font">`);

    for (var f=0; f < assembledFragments.length; f++)
    {
        id = assembledFragments[f];
        if (f == assemblerSelectedElement)
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

function updateAssemblyButtons()
{
    if  (assembledFragments.length > 0)
    {
        $('#assemblyPrevious').prop('disabled', 
            (assemblerSelectedElement == 0));
        
        $('#assemblyNext').prop('disabled', 
            (assemblerSelectedElement == (assembledFragments.length - 1)));

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

function previewSound()
{
    var file_names=[];
    
    // Build Play List
    for (var f=0; f < assembledFragments.length; f++)
    {
        file_names[f] = '/media/WavFiles/' + assembledFragments[f] + '.wav';
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
