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
var previewEvent = null;
var version = '';

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
        file_names[song] = '/media/wavfiles/' + preambleAudio + '.wav';
        song = song + 1;
    } 

    // Disruption
    if (disruptionAudio.length>0)
    {
        for (d=0; d<disruptionAudio.length;d++)
        {
            if (disruptionAudio[d] == 7000)
            {
                file_names[song] = '/media/wavfiles/' + lineAudio + '.wav';
                song = song + 1;
                
            }
            else if ((disruptionAudio[d] != 7001) && (disruptionAudio[d] != 0))
            {
                file_names[song] = '/media/wavfiles/' + disruptionAudio[d] + '.wav';
                song = song + 1;
            }
        }
    }

    //Reason
    if (reasonAudio)
    {
        file_names[song] = '/media/wavfiles/' + reasonAudio + '.wav';
        song = song + 1;
    } 

        //playSound(file_names);
        var sound = new Howl({
            src: ['/media/wavfiles/1049.wav'],
            onend: function() {
                if (previewEvt)
                {   
                    $(previewEvt.target).prop('disabled',false);
                    previewEvent = null;
                }
            }
        });

        sound.play();
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
