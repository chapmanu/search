$(document).ready(function() {

    var timer = null;
    function results_search() {
        var box = $('#search_bar').val();

        var chap_head  = {index: 'chapcrawl'};

        var chap_body  = {query : {bool : {should : [{match: {meta_title: {query : $('#search_bar').val(), boost : 7}}},{match: {page_title: {query : $('#search_bar').val(), boost : 5}}},{match: {description: {query : $('#search_bar').val(), boost : 3}}},{match: {_all: $('#search_bar').val()}}]}}};

        var event_head = {index: 'events_development'};

        var event_body = {query: {dis_max: {queries: [{match: {"title.word_start": {query: $('#search_bar').val(), operator: "and", boost: 7, analyzer: "searchkick_word_search"}}}, {match: {"title.word_start": {query: $('#search_bar').val(), operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"title.word_start": {query: $('#search_bar').val(), operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}, {match: {"_all": {query: $('#search_bar').val(), operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"_all": {query: $('#search_bar').val(), operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}]}}, size: 10, from: 0};

        var post_head  = {index: 'posts_development'};

        var post_body  = {query: {dis_max: {queries: [{match: {"text.word_start": {query: $('#search_bar').val(), operator: "and", boost: 7, analyzer: "searchkick_word_search"}}}, {match: {"text.word_start": {query: $('#search_bar').val(), operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"text.word_start": {query: $('#search_bar').val(), operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}, {match: {"_all": {query: $('#search_bar').val(), operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"_all": {query: $('#search_bar').val(), operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}]}}, size: 10, from: 0};

        $.ajax({
            url: 'http://127.0.0.1:9200/_msearch',
            type: 'POST',
            crossDomain: true,
            dataType: 'json',
            data: JSON.stringify(chap_head) + '\n' + JSON.stringify(chap_body) + '\n' + JSON.stringify(event_head) + '\n' + JSON.stringify(event_body) + '\n' + JSON.stringify(post_head) + '\n' + JSON.stringify(post_body) + '\n',
            success: function(response) {

                var data = response.responses;
                console.log(data);
                var doc_titles = [];

                $('#results').empty();

                for(var i = 0; i < data.length; i++){
                    if (i === 0){
                        var list = append_all("Webpages", "www_results", data, 0, doc_titles);
                        
                        $('#results').append(list);
                    }else if (i === 1){
                        var list = append_all("Events", "event_results", data, 1, doc_titles);
                        
                        $('#results').append(list);
                    }else if (i === 2){
                        var list = append_all("Posts", "post_results", data, 2, doc_titles);

                        $('#results').append(list);
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                var jso = jQuery.parseJSON(jqXHR.responseText);
                console.log('(' + jqXHR.status + ') ' + errorThrown + ': ' + jso.error);
            }
        });
    }

    var append_all = function(title, list_id, data, index, doc_titles) {

        $('#results').append( $('<h3/>').text(title) );
        
        var $ol = $("<ol id=" + list_id + "></ol>");

        var page_data = data[index].hits.hits;

        if (page_data.length > 0) {
            for (var i = 0; i < page_data.length; i++) {
                if (page_data[i]._index === 'chapcrawl'){
                    var source = page_data[i]._source.page_title;
                    pic = page_data[i]._source.page_image;
                    doc_titles.push(source);
                    $ol.append("<li><img style='display:inline-block;margin-right:5px;' src='" + pic + "' alt='pic' height='25.385' width='30'><p style='display:inline-block;'>" + source + "</p></li>");
                }else if (page_data[i]._index.substring(0, 18) === 'events_development'){
                    var source = page_data[i]._source.title;
                    doc_titles.push(source);
                    $ol.append("<li><p style='display:inline-block;'>" + source + "</p></li>");
                }else{
                    var source = page_data[i]._source.service;
                    var body = page_data[i]._source.text;
                    doc_titles.push(source);
                    $ol.append("<li><p style='display:inline-block;text-transform:capitalize;margin-right:5px;'>" + source + ":</p><p style='display:inline-block;'>" + body + "</p></li>");
                }
            }
        } else {
            $ol.append("<li>No results found.</li>");
        }

        return $ol;
    }

    var keyup_func = function() {
        if(timer){
            clearTimeout(timer);
        }
        timer = setTimeout(results_search, 100);
    }

    $('#search_bar').keyup(keyup_func);

    $('#live-search').on('submit', function(e){
        console.log("submitting form");
        e.preventDefault();
    });

    $('#search_bar').on('keypress', function(e){
        console.log(e.which);
        if(e.which === 13){ //Enter key pressed
            console.log("Enter fire");
            $('#search_bar').keyup(keyup_func); //Trigger keyup event
        }
    });
});