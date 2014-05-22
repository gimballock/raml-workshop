$(function() {
    var endpoint = "<<endpoint url here>>";
    
    $('#get-groups-button').click(function () {    
        $.getJSON(endpoint + '/groups', null, function(groupsData) {
            var groupsHtml = '';
            for (group_idx in groupsData) {
                groupsHtml += groupsData[group_idx].id + ": " + groupsData[group_idx].name + '<br/>';
            }
            $('#content').html(groupsHtml);
        });
    });
    $('#get-a-group').click(function () {
        var group_id = $('#group-id').val();
        $.getJSON(endpoint + '/groups/'+group_id, null, function(groupData) {
            $('#content').html('<h2>'+groupData.name 
            + '</h2><p>ID:' + groupData.id 
            + '</p><p>Category:' + groupData.category +'</p><p>'
            + '</p><p>Slug:' + groupData.slug +'</p><p>'
            + '</p><p>Parent:' + groupData.parentGroup_id +'</p>'
            );
        });
    });
    $('#post-a-group').click(function() {
        var body = {
            'name': $('#g-name').val(), 
            'category': $('#g-category').val(),
            'id': $('#g-id').val(), //parseInt($('#g-id').val()),
            'parentGroup_id': $('#g-parent-id').val() //parseInt($('#g-parent-id').val())
        };
        var response = $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: endpoint + '/groups',
            data: JSON.stringify(body),
        })
        .done(function(data) {
            $('#content').html(data);
        })
        .fail(function(response) {
            $('#content').html(response.text);
        });
    });
});