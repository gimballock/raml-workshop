$(function() {
    //var endpoint = "http://localhost:3000/api/v0.1"; 
    var endpoint = "http://mocksvc.mulesoft.com/mocks/<<mock service hash>>/api/v0.1";
    
    $('#get-events-button').click(function () {    
        $.getJSON(endpoint + '/events', null, function(eventsData) {
            var eventsHtml = '';
            for (event_idx in eventsData) {
                console.log("id:"+eventsData[event_idx].id);
                eventsHtml += '<tr><td>' + eventsData[event_idx].id + '</td><td>' + eventsData[event_idx].name + '</td></tr>';
            }

            var listTable = '<table><thead><tr><th>Id</th><th>Name</th></tr></thead><tbody>' + eventsHtml + '</tbody></table>';
            $('#content').html(listTable);
        });
    });
    $('#get-an-event').click(function () {
        var event_id = $('#event-id').val();
        $.getJSON(endpoint + '/events/'+event_id, null, function(eventData) {
            var details = '<table><tr><td>Name</td><td>' + eventData.name + '</td></tr>'
            + '<tr><td>Location</td><td>' + eventData.location + '</td></tr>'
            + '<tr><td>Time</td><td>' + eventData.starts_at + ' - ' + eventData.ends_at + '</td></tr>'
            + '<tr><td>Description</td><td>' + eventData.description + '</td></tr></table>';
            
            $('#content').html(details);
        });
    });
});
