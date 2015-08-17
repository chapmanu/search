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

  /************************************/
  /***** ::: STATIC FUNCTIONS ::: *****/
  /************************************/

  var resultHandlers = {};

  // Result Type of "WWW"
  resultHandlers.www = {

    buildQuery: function(search_term) {
      var head  = {index: 'chapcrawl'};
      var body  = {query : {bool : {should : [{match: {meta_title: {query : search_term, boost : 7}}},{match: {page_title: {query : search_term, boost : 5}}},{match: {description: {query : search_term, boost : 3}}},{match: {_all: search_term}}]}}, size: 5, from: 0};
      return JSON.stringify(head) + '\n' + JSON.stringify(body) + '\n';
    },

    buildResult: function(item) {
      return buildHTML(filterItem({
        title :       item.page_title,
        image :       item.page_image,
        description : $(item.description).text(),
        url :         item.url
      }));
    }

  };

  // Result Type of "Event"
  resultHandlers.event = {
    buildQuery: function(search_term) {
      var head = {index: 'events_development'};
      var body = {query: {dis_max: {queries: [{match: {"title.word_start": {query: search_term, operator: "and", boost: 7, analyzer: "searchkick_word_search"}}}, {match: {"title.word_start": {query: search_term, operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"title.word_start": {query: search_term, operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}, {match: {"_all": {query: search_term, operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"_all": {query: search_term, operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}]}}, size: 5, from: 0};
      return JSON.stringify(head) + '\n' + JSON.stringify(body) + '\n';
    },
    buildResult: function(item) {
      return buildHTML(filterItem({
        title :       item.title,
        image :       (item.cover_photo) ? item.cover_photo.square.url : '',
        description : $(item.description).text(),
        url :         'https://events.chapman.edu/' + item.id
      }));
    }
  };

  // Result Type of "Post"
  resultHandlers.post =  {
    buildQuery: function(search_term) {
      var head  = {index: 'posts_development'};
      var body  = {query: {dis_max: {queries: [{match: {"text.word_start": {query: search_term, operator: "and", boost: 7, analyzer: "searchkick_word_search"}}}, {match: {"text.word_start": {query: search_term, operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"text.word_start": {query: search_term, operator: "and", boost: 5, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}, {match: {"_all": {query: search_term, operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search"}}}, {match: {"_all": {query: search_term, operator: "and", boost: 3, fuzziness: 2, max_expansions: 3, analyzer: "searchkick_search2"}}}]}}, size: 5, from: 0};
      return JSON.stringify(head) + '\n' + JSON.stringify(body) + '\n';
    },
    buildResult: function(item) {
      return buildHTML(filterItem({
        title :       item.text,
        image :       (item.photos.length) ? item.photos[0].url : '',
        description : 'By ' + item.author.display_name,
        url :         item.external_uri
      }));
    }
  };

  // Maps fields from 'data' to the template vars in 'template'
  var buildHTML = function( data ) {
    return template.replace(/\{\{(.*?)\}\}/g, function(match, token) {
        return data[token];
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


  /******************************************/
  /***** ::: jQuery Object Instance ::: *****/
  /******************************************/
  $.fn.cuSearchBox = function( options ) {
    var $self = this;


    /* ::: Instance Variables ::: */
    var settings = $.extend({
    }, options );

    // References to our DOM nodes
    var $result_container     = $('<div class="search-results"></div>');
    var $result_type_selector = $(settings['selector-id']);

    var types_to_search = [];


    /* ::: Instance Methods ::: */

    var getData = function() {      
      return $.ajax({
        url: api_endpoint,
        type: 'POST',
        crossDomain: true,
        dataType: 'json',
        data: buildQuery(),
        error: function(jqXHR, textStatus, errorThrown) {
            var jso = jQuery.parseJSON(jqXHR.responseText);
            console.log('(' + jqXHR.status + ') ' + errorThrown + ': ' + jso.error);
        }
      });
    };

    var buildQuery = function() {
      var search_term = $self.val();

      return types_to_search.map(function(type) {
        console.log('We are searching for a: '+type);
        console.log(resultHandlers[type].buildQuery(search_term));
        return resultHandlers[type].buildQuery(search_term);
      }).join('');
    };

    var processResults = function(results) {

      // Put all the results into one big flattened array
      var all_results = types_to_search.map(function(type, index) {

        var raw_group_of_hits = results.responses[index].hits.hits;

        // Assign result type to each result within result-type group
        var group_of_hits = raw_group_of_hits.map(function(item) {
          item.type_of_result = type;
          return item;
        });

        return group_of_hits;

      }).reduce(function(prev, cur) {
        return prev.concat(cur);
      });

      // SORTING FUNCTION GOES HERE
      // all_results = all_results.each by score;

      var html = all_results.map(function(item) {
        console.log("Trying to process a: "+item.type_of_result);
        return resultHandlers[item.type_of_result].buildResult(item['_source']);
      }).join('');

      console.log(all_results);

      $result_container.html(html);

    }

    var performSearch = function() {
      getData().then(processResults).then(showResults);
    };

    var showResults = function() {
      $result_container.fadeIn(100);
    };
  
    var hideResults = function() {
      $result_container.fadeOut(100);
    };

    var clearResults = function() {
      $result_container.html('');
    };

    /* ::: Main Method ::: */
    
    // Append result container
    $self.after($result_container);

    // Bind actions
    $self.on('input', debounce(performSearch, 100, false));

    // Close results on esc key
    $('body').on('keyup', function(e) {
      if (e.which == 27) hideResults();
    });

    // Close results on click outside of result box
    $self.on('blur', hideResults);

    // Show results on focus
    $self.on('focus', showResults);

    // Set types of results to search
    types_to_search.push($result_type_selector.val());

    // Update results to search when user changes dropdown
    $result_type_selector.on('change', function() {
      types_to_search = [];
      types_to_search.push($result_type_selector.val());
      clearResults();
      performSearch();
    });


    // It's the jQuery way! (Allows further command chaining)
    return this;

  };

  /************************************/
  /***** ::: LIBRARY FUNCTIONS ::: *****/
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