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
        app.appData = appData;
    });

    // Load Fragment Data
    $.getJSON('data/current/fragment_data.json',(fragmentData)=>{
        if(fragmentData){
            app.completeFragmentData = fragmentData;
        }
    });

    // Load Complete Data
    $.getJSON('data/current/complete_data.json',(completeData)=>{
        if (completeData)
        {
            app.completeData = completeData;
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
        app.lineData = lineData;
    });

    // Load the Preamble Data
    $.getJSON('data/current/preamble_data.json',(preambleData)=>{
        app.preambleData = preambleData;
    })
    
    // Load Disruption Data
    $.getJSON('data/current/disruption_data.json',(disruptionData)=>{
        app.disruptionData = disruptionData;
        appComponents.disruptionVueData = disruptionData;
    });

    // Load Reason Data
    $.getJSON('data/current/reason_data.json',(reasonData)=>{
        app.reasonData = reasonData;
    });

    //Load Detail Data
    $.getJSON('data/current/detail_data.json',(detailData)=>{
        app.detailData = detailData;
    });

    // Load Direction Data
    $.getJSON('data/current/direction_data.json',(directionData)=>{
        app.directionData = directionData;
    });


    // Load Ticket Data
    $.getJSON('data/current/ticket_data.json',(ticketData)=>{
        app.ticketData = ticketData;
    })

    // Load Playlist Categories Data
    $.getJSON('data/current/playlist_categories.json',(playlistCategoryData)=>{
        app.playlistCategories= playlistCategoryData;
    })

    // Load Playlist Messages Data
    $.getJSON('data/current/playlist_messages.json',(playlistMessageData)=>{
        app.playlistMessages.messages = playlistMessageData;
    })

    // Load Multipart Messages Data
    if (doesFileExist('data/current/multipart_messages.json'))
    {
        $.getJSON('data/current/multipart_messages.json',(multipartMessageData)=>{
            app.multipartMessages = multipartMessageData;
        })
    }

    // Load MRA Messages Data
    if (doesFileExist('data/current/mra_messages.json'))
    {
        $.getJSON('data/current/mra_messages.json',(mraMessageData)=>{
            app.mraMessages = mraMessageData;
        })
    }

    // Load Quicklist Data
    if (doesFileExist('data/current/quicklist_messages.json'))
    {
        $.getJSON('data/current/quicklist_messages.json',(qlMessageData)=>{
            app.quickList.messages = qlMessageData;
        })
    }

    app.data_loaded_state = true;
}

function addUserPlaylistMessage(title, description, classifier, icon)
{
    let jsonMessage = '';
    let userMessage = '';

    // Set Type ID
    if (app.selected_save_type !== 0)
    {
        type_id = app.selected_save_type;
    }
    else
    {
        type_id = USER_TYPE_ID;
    }

   userMessage = {
                    message_name: title,
                    message_description: description,
                    icon: icon,
                    classifier: classifier,
                    parent_id: -1,
                    message_id: app.userMessageId, 
                    user: app.user_name,
                    type_id: type_id};
    
    app.playlistMessages.messages.push(userMessage);
       
    jsonMessage = JSON.stringify(app.playlistMessages.messages);

    $.ajax({
        type: 'POST',
        data: jsonMessage,
        contentType: 'application/json; charset=utf-8',
        url: '/savePlaylistMessages',
        success: function(data) {
            console.log('Successfully Added playlist message');
        },
        error: function(data) {
            console.log('Error ' + data.status);
        }
    });
}

function addUserMultipartMessage(title, 
                                 description, 
                                 detail, 
                                 duration, 
                                 fragments, 
                                 icon)
{
    let jsonMessage = '';
    let userMessage = '';
    let type_id = 0;

    // Set Type ID
    if (app.selected_save_type !== 0)
    {
        type_id = app.selected_save_type;
    }
    else
    {
        type_id = USER_TYPE_ID;
    }

    userMessage = {
                    message_id: app.userMessageId, 
                    message_name: title,
                    message_description: description,
                    composer_data: "",
                    type_id: type_id,
                    user: app.user_name,
                    icon: icon,
                    detail: detail,
                    Duration: duration,
                    fragments: fragments};

    app.multipartMessages.push(userMessage);
       
    jsonMessage = JSON.stringify(app.multipartMessages);

    $.ajax({
        type: 'POST',
        data: jsonMessage,
        contentType: 'application/json; charset=utf-8',
        url: '/saveMultipartMessages',
        success: function(data) {
            console.log('Successfully Added Multipart message');
        },
        error: function(data) {
            console.log('Error ' + data.status);
        }
    });
}

function addUserMraMessage(title, 
    description, 
    detail, 
    icon)
{
    let jsonMessage = '';
    let userMessage = '';
    let type_id = 0;

    // Set Type ID
    if (app.selected_save_type !== 0)
    {
        type_id = app.selected_save_type;
    }
    else
    {
        type_id = USER_TYPE_ID;
    }

    userMessage = {
                    message_id: app.userMessageId, 
                    message_name: title,
                    message_description: description,
                    detail: detail,
                    type_id: type_id,
                    user: app.user_name,
                    icon: icon};

    app.mraMessages.push(userMessage);

    jsonMessage = JSON.stringify(app.mraMessages);

    $.ajax({
        type: 'POST',
        data: jsonMessage,
        contentType: 'application/json; charset=utf-8',
        url: '/saveMraMessages',
        success: function(data) {
            console.log('Successfully Added MRA message');
        },
        error: function(data) {
            console.log('Error ' + data.status);
        }
    });
}

function addQuicklistMessage(id)
{
    let jsonMessage = '';
    let userMessage = '';
    let classifer = '';

    if (app.getQuicklistMessageIndex (app.playlistMessages.selected) <0)
    {
        classifier = app.getPlaylistClassifier(id);
        userMessage = { message_id: id, 
                        classifier: classifier,
                        user: app.user_name};

        app.quickList.messages.push(userMessage);

        jsonMessage = JSON.stringify(app.quickList.messages);

        $.ajax({
            type: 'POST',
            data: jsonMessage,
            contentType: 'application/json; charset=utf-8',
            url: '/saveQuickListMessages',
            success: function(data) {
                console.log('Successfully Added quicklist message');
            },
            error: function(data) {
                console.log('Error ' + data.status);
            }
        });
    }
}

function deletePlaylistMessage(id)
{
    let jsonMessage = '';
    let index = app.getPlaylistMessageIndex(id);
    
    // Determine if the index is valid
    if (index >= 0 && index < app.playlistMessages.messages.length)
    {
        app.playlistMessages.messages.splice(index,1);
    }
   
    jsonMessage = JSON.stringify(app.playlistMessages.messages);

    $.ajax({
        type: 'POST',
        data: jsonMessage,
        contentType: 'application/json; charset=utf-8',
        url: '/savePlaylistMessages',
        success: function(data) {
            console.log('Successfully Deleted playlist message');
        },
        error: function(data) {
            console.log('Error ' + data.status);
        }
    });

    app.playlistMessages.selected = 0;

}

function deleteMultipartMessage(id)
{
    let jsonMessage = '';
    let index = app.getMultiPartMessageIndex(id);
   
    // Determine if the index is valid
    if (index >= 0 && index < app.multipartMessages.length)
    {
        app.multipartMessages.splice(index,1);
    }
   
    jsonMessage = JSON.stringify(app.multipartMessages);

    $.ajax({
        type: 'POST',
        data: jsonMessage,
        contentType: 'application/json; charset=utf-8',
        url: '/saveMultipartMessages',
        success: function(data) {
            console.log('Successfully Deleted multipart message');
        },
        error: function(data) {
            console.log('Error ' + data.status);
        }
    });
}

function deleteMraMessage(id)
{
    let jsonMessage = '';
    let index = app.getMraMessageIndex(id);
   
    // Determine if the index is valid
    if (index >= 0 && index < app.mraMessages.length)
    {
        app.mraMessages.splice(index,1);
    }
   
    jsonMessage = JSON.stringify(app.mraMessages);

    $.ajax({
        type: 'POST',
        data: jsonMessage,
        contentType: 'application/json; charset=utf-8',
        url: '/saveMraMessages',
        success: function(data) {
            console.log('Successfully Deleted MRA message');
        },
        error: function(data) {
            console.log('Error ' + data.status);
        }
    });
}

function deleteQuicklistMessage(id)
{
    let jsonMessage = '';
    let index = app.getQuicklistMessageIndex(id);

    // Determine if the index is valid
    if (index >= 0 && index < app.quickList.messages.length)
    {
        app.quickList.messages.splice(index,1);
    }

    jsonMessage = JSON.stringify(app.quickList.messages);

    $.ajax({
        type: 'POST',
        data: jsonMessage,
        contentType: 'application/json; charset=utf-8',
        url: '/saveQuickListMessages',
        success: function(data) {
            console.log('Successfully Deleted quicklist message');
        },
        error: function(data) {
            console.log('Error ' + data.status);
        }
    });
}

function doesFileExist(filename)
{
    let data = {filename: filename};
    let jsonData = JSON.stringify(data);
    let result = 0;

    $.ajax({
        type: 'POST',
        data: jsonData,
        contentType: 'application/json; charset=utf-8',
        url: '/checkFileExists',
        success: function(data) {
            result = data.result;
            if (data.result)
            {
                console.log('File ' + filename + ' exists');
            }
            else
            {
                console.log('File ' + filename + ' does not exist');
            }
        }
    });

    return result;
}