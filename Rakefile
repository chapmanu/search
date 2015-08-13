require 'elasticsearch'
require 'rest_client'

namespace :www do
  task :setup do
    data = JSON.generate(
      'mappings' => {
          'chap_1' => {
              '_id' => {
                  'path' => 'meta_url' 
              },
              'properties' => {
                  'meta_url' => {
                      'type'  => 'string',
                      'index'  => 'not_analyzed'
                  }
              },
              'dynamic_templates' => [
                {
                    'page_title' => {
                        'match' => 'page_title',
                        'mapping' => {
                            'type' => 'string',
                            'store' => 'yes',
                            'analyzer' => 'autocomplete'
                        }
                    }
                },
                {
                    'meta_title' => {
                        'match' => 'meta_title',
                        'mapping' => {
                            'type' => 'string',
                            'store' => 'yes',
                            'analyzer' => 'autocomplete'
                        }
                    }
                },
                {
                    'description' => {
                        'match' => 'description',
                        'mapping' => {
                            'type' => 'string',
                            'store' => 'yes',
                            'analyzer' => 'autocomplete'
                        }
                    }
                },
                {
                  'url' => {
                    'match' => 'url',
                    'mapping' => {
                      'type' => 'string',
                      'store' => 'yes',
                      'index' => 'not_analyzed'
                    }
                  }
                },
                {
                  'method' => {
                    'match' => 'method',
                    'mapping' => {
                      'type' => 'string',
                      'store' => 'yes',
                      'index' => 'not_analyzed'
                    }
                  }
                },
                {
                  'charSet' => {
                    'match' => 'charSet',
                    'mapping' => {
                      'type' => 'string',
                      'store' => 'yes',
                      'index' => 'not_analyzed'
                    }
                  }
                },
                {
                  'mimeType' => {
                    'match' => 'mimeType',
                    'mapping' => {
                      'type' => 'string',
                      'store' => 'yes',
                      'index' => 'not_analyzed'
                    }
                  }
                }
              ]
            }
        },
        'settings' => {
          'number_of_shards' => 5, 
          'analysis' => {
            'filter' => {
              'autocomplete_filter' => { 
                'type' =>     'edge_ngram',
                'min_gram' => 1,
                'max_gram' => 20
              }
            },
            'analyzer' => {
              'autocomplete' => {
                'type' =>      'custom',
                'tokenizer' => 'standard',
                'filter' => [
                  'lowercase',
                  'autocomplete_filter' 
                ]
              }
            }
          }
        }
      )

    RestClient.put 'http://localhost:9200/chapcrawl', data, {:content_type => :json}
  end

  task :crawl do
    data = JSON.generate(
      'type' => 'web',
      'crawl' => {
        'index' => 'chapcrawl',
        'url' => ['http://www.chapman.edu/'],
        'includeFilter' => ['http://www.chapman.edu/.*'],
        'maxDepth' => 10,
        'maxAccessCount' => 5000,
        'numOfThread' => 5,
        'interval' => 10,
        'overwrite' => true,
        'target' => [
            {
            'pattern' => {
              'url' => 'http://www.chapman.edu/.*',
              'mimeType' => 'text/html'
            },
            'properties' => {
              'page_title' => {
                'text' => 'title'
              },
              'body' => {
                'text' => 'body'
              },
              'bodyAsHtml' => {
                'html' => 'body'
              },
              'meta_title' => {
                'attr' => 'meta[property=og:title]',
                'args' => ['content']
              },
              'meta_url' => {
                'attr' => 'meta[property=og:url]',
                'args' => ['content']
              },
              'description' => {
                'attr' => 'meta[property=og:description]',
                'args' => ['content']
              },
              'page_image' => {
                'attr' => 'meta[property=og:image]',
                'args' => ['content']
              },
              'canon_url' => {
                'attr' => 'link[rel=canonical]',
                'args' => ['href']
              }
            }
          }
        ]
      }
    )

    RestClient.put 'http://localhost:9200/_river/chap_1/_meta', data, {:content_type => :json}
  end

end