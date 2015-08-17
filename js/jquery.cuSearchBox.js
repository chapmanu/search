(function ( $ ) {


  /****************************************/
  /***** ::: Static Configuration ::: *****/
  var api_endpoint = 'http://127.0.0.1:9200/_msearch';


  /*********************************/
  /***** ::: HTML TEMPLATE ::: *****/
  /*********************************/
  var template = '\
    <a class="search-result-item" href="{{url}}"> \
      <div class="result-media"> \
        <img class="result-thumbnail" src="{{image}}" /> \
      </div> \
      <div class="result-text"> \
        <h3 class="result-title">{{title}}</h3> \
        <p class="result-description">{{description}}</p> \
        <p class="result-url">{{url}}</p> \
      </div> \
    </a>';
  // End of the lines must be escaped for correct javsacript syntax. 


  /******************************************/
  /***** ::: jQuery Object Instance ::: *****/
  /******************************************/
  $.fn.cuSearchBox = function( options ) {
    var $self = this;


    /* ::: Instance Variables ::: */
    var settings = $.extend({
    }, options );

    var query_params = {
      group_id : settings.group_id,
    };

    var $result_container     = $('<div class="search-results"></div>');
    var $result_type_selector = $(settings['selector-id']);

    /* ::: Instance Methods ::: */

    // Maps fields from 'data' to the template vars in 'template'
    var buildHTML = function( data ) {
      return template.replace(/\{\{(.*?)\}\}/g, function(match, token) {
          return data[token];
      });
    };

    var showNoResultMessage = function( ) {
      $self.append('<p>Sorry, there are no matching events to display. <a href="'+base_url+'">View all Chapman University events &raquo;</a></p>');
    };

    var appendMoreInfoLink = function( ) {
      var url = base_url + '?' + $.param(query_params);
      $self.append('<p class="more-cu-events"><a href="'+url+'">View more upcoming events &raquo;</a></p>');
    }

    var getData = function() {

      var search_term = $self.val();

      var chap_head  = {index: 'chapcrawl'};
      var chap_body  = {query : {bool : {should : [{match: {meta_title: {query : search_term, boost : 7}}},{match: {page_title: {query : search_term, boost : 5}}},{match: {description: {query : search_term, boost : 3}}},{match: {_all: search_term}}]}}, size: 5, from: 0};

      var event_head = {index: 'events_development'};
      var event_body = {query: {dis_max: {queries: [{match: {"title.word_start": {query: search_term, operator: "and", boost: 7, analyzer: "searchkick_word_search"}}}, {match: {"title.word_start": {query: search_term, operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"title.word_start": {query: search_term, operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}, {match: {"_all": {query: search_term, operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"_all": {query: search_term, operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}]}}, size: 5, from: 0};

      var post_head  = {index: 'posts_development'};
      var post_body  = {query: {dis_max: {queries: [{match: {"text.word_start": {query: search_term, operator: "and", boost: 7, analyzer: "searchkick_word_search"}}}, {match: {"text.word_start": {query: search_term, operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"text.word_start": {query: search_term, operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}, {match: {"_all": {query: search_term, operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"_all": {query: search_term, operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}]}}, size: 5, from: 0};

      return $.ajax({
        url: api_endpoint,
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        data: JSON.stringify(chap_head) + '\n' + JSON.stringify(chap_body) + '\n' + JSON.stringify(event_head) + '\n' + JSON.stringify(event_body) + '\n' + JSON.stringify(post_head) + '\n' + JSON.stringify(post_body) + '\n',
        error: function(jqXHR, textStatus, errorThrown) {
            var jso = jQuery.parseJSON(jqXHR.responseText);
            console.log('(' + jqXHR.status + ') ' + errorThrown + ': ' + jso.error);
        }
      });
      
    };

    var processResults = function(results) {

      var index = parseInt($result_type_selector.val());
      var data = results.responses[index];
      var elems = '';

      for (i=0; i < data.hits.hits.length; i++) {
        var item = fastAndDirty(data.hits.hits[i]['_source'], index);
        elems += buildHTML(item);
      }

      $result_container.html(elems);
    }

    var fastAndDirty = function(item, index) {
      switch(index){
        case 0:
          return buildWebResult(item);
          break;
        case 1:
          return buildEventResult(item);
          break;
        case 2:
          return buildPostResult(item);
          break;
      }
    }

    // Takes in raw data, returns formatted result
    var buildWebResult = function(item) {
      return filterItem({
        title :       item.page_title,
        image :       item.page_image,
        description : item.description,
        url :         item.url
      });
    };

    // Takes in raw data, returns formatted result
    var buildEventResult = function(item) {
      return filterItem({
        title :       item.title,
        image :       (item.cover_photo) ? item.cover_photo.square.url : '',
        description : item.description,
        url :         'https://events.chapman.edu/' + item.id
      });
    };

    // Takes in raw data, returns formatted result
    var buildPostResult = function(item) {
      return filterItem({
        title :       item.text,
        image :       (item.photos.length) ? item.photos[0].url : '',
        description : 'By ' + item.author.display_name,
        url :         item.external_uri
      });
    };

    // Takes an object in, returns the same object with some stuff filtered
    var filterItem = function(item) {
      if (item.page_title){
        item.page_title = item.page_title.replace('| Chapman University', '');
      }

      if (!item.image) {
        item.image = 'https://blogs.chapman.edu/wp-content/themes/cu-wp-template-1.2/img/brand/cu_general/regular_stories/CUgeneral_default04bw.jpg';
      }

      return item;
    }

    var performSearch = function() {
      getData().then(processResults).then(showResults);
      //showResults()
    };

    var showResults = function() {
      $result_container.fadeIn(100);
    }
  
    var hideResults = function() {
      $result_container.fadeOut(100);
    }

    /* ::: Main Method ::: */
    
    // Append result container
    $self.after($result_container);

    // Bind actions
    $self.on('input', debounce(performSearch, 100, false));
    $result_type_selector.on('change', performSearch);

    // Close results on esc key
    $('body').on('keyup', function(e) {
      if (e.which == 27) hideResults();
    });

    // Close results on click outside of result box
    $self.on('blur', hideResults);

    // Show results on focus
    $self.on('focus', showResults);

    // It's the jQuery way! (Allows further command chaining)
    return this;

  };

  /************************************/
  /***** ::: STATIC FUNCTIONS ::: *****/
  /************************************/
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

}( jQuery ));