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
    
});
