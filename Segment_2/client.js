$(function() {
    //var endpoint = "http://localhost:3000/api/v0.1";
    var endpoint = "http://mocksvc.mulesoft.com/mocks/<<mock hash>>/api/v0.1";
    
    $('#get-events-button').click(function () {    
        $.getJSON(endpoint + '/events', null, function(eventsData) {
            var eventsHtml = '';
            for (event_idx in eventsData) {
                console.log("id:"+eventsData[event_idx].id);
                eventsHtml += '<tr><td>' + eventsData[event_idx].id + '</td><td>' + eventsData[event_idx].name + '</td></tr>';
            }

            var listTable = '<table><thead><tr><th align="left">Id</th><th align="left">Name</th></tr></thead><tbody>' + eventsHtml + '</tbody></table>';
            $('#content').html(listTable);
        });
    });
    $('#get-an-event').click(function () {
        var event_id = $('#event-id').val();
        $.getJSON(endpoint + '/events/'+event_id, null, function(eventData) {
            var details = '<b>Name: </b>' + eventData.name + '<br>'
            + '<b>Location: </b>' + eventData.location + '<br>'
            + '<b>Time: </b>' + eventData.starts_at + ' - ' + eventData.ends_at + '<br>'
            + '<b>Description: </b>' + eventData.description;
            
            $('#content').html(details);
        });
    });
    $('#post-an-event').submit(function(event) {
        event.preventDefault();
        
        var body = {
            'id': parseInt($('#new-event-id').val(), 10) || 0,
            'name': $('#event-name').val(), 
            'description': $('#event-description').val(),
            'location': $('#event-location').val(),
            'starts_at': $('#event-start').val(),
            'ends_at': $('#event-end').val(),
        };
       
        //x-www-form-urlencoded
        /*var posting = $.post( endpoint + '/events', body ).done(function( data ) {
            $( "#content" ).html(data.message);
        });*/

        //application/json
        var response = $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: endpoint + '/events',
            data: JSON.stringify(body),
            error: function(xhr, error){
                $('#content').html(error);
            }
        }).done(function(data) {
            $('#content').html(data.message);
        })
    });
});