(function ( $ ) {


  /****************************************/
  /***** ::: Static Configuration ::: *****/
  var base_url     = 'https://events.chapman.edu/'
  var api_endpoint = 'https://events.chapman.edu/events.json';


  /*********************************/
  /***** ::: HTML TEMPLATE ::: *****/
  /*********************************/
  var template = '\
    <div class="search-result-item"> \
    This is your item! \
    </div>';
  // End of the lines must be escaped for correct javsacript syntax. 


  /******************************************/
  /***** ::: jQuery Object Instance ::: *****/
  /******************************************/
  $.fn.cuSearchBox = function( options ) {
    var $self = this;


    /* ::: Instance Variables ::: */
    var settings = $.extend({
      group_id: this.data('group-id'),
    }, options );

    var query_params = {
      group_id : settings.group_id,
    };

    var $result_container = $('<div class="search-results">SEARCH RESULTS HERE</div>');


    /* ::: Instance Methods ::: */

    // Maps fields from 'data' to the template vars in 'template'
    var buildHTML = function( data ) {
      return template.replace(/\{\{(.*?)\}\}/g, function(match, token) {
          return data[token];
      });
    };

    var renderEvents = function( data ) {
      var elems = '';

      for (i=0; i < data.events.length; i++) {
        elems += buildHTML(data.events[i]);
      }

      $self.html(elems);

      // Append an appropriate link
      if ( 0 === data.events.length ) {
        showNoResultMessage();
      } else {
        appendMoreInfoLink();
      }

    };

    var showNoResultMessage = function( ) {
      $self.append('<p>Sorry, there are no matching events to display. <a href="'+base_url+'">View all Chapman University events &raquo;</a></p>');
    };

    var appendMoreInfoLink = function( ) {
      var url = base_url + '?' + $.param(query_params);
      $self.append('<p class="more-cu-events"><a href="'+url+'">View more upcoming events &raquo;</a></p>');
    }

    var getData = function( self ) {

      // Remove empty parameters
      if (query_params['group_id'] === '' || query_params['group_id'] == 0) {
        delete query_params['group_id'];
      }

      return $.ajax({
        cache: true,
        dataType: 'json',
        url: api_endpoint,
        data: query_params
      });
    };

    var performSearch = function ( self ) {
      console.log("Hai");
    }


    /* ::: Main Method ::: */
    
    // Append result container
    $self.after($result_container);

    // Bind actions
    $self.on('input', debounce(performSearch, 600, false));


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