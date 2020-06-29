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
        let id = 0;
        if(fragmentData){
            app.completeFragmentData = fragmentData;
            $.each(fragmentData, (key, value)=>{
                id = value.section_id;
                app.fragmentText.section[id] = value.section_position.toUpperCase();
                app.fragmentText.text[id] = value.message_name.trim();
            })
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

    app.data_loaded_state = true;
}