# Search
This repository is the home of Chapman's internally built search functionality

### First Time Local Setup
- Clone this repository with 'git clone git@github.com:chapmanu/search.git'
- Download [Elasticsearch v1.4.2](https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.4.2.zip)
- While in your Elasticsearch directory, install Elasticsearch Quartz with '/bin/plugin --install org.codelibs/elasticsearch-quartz/1.0.1'
- In the same spot, install Elasticsearch River Web with '/bin/plugin --install org.codelibs/elasticsearch-river-web/1.4.0'
- (Optional) Download and Install the [Sense(Beta)](https://chrome.google.com/webstore/detail/sense-beta/lhjgkmllcaadmopgmanpapmpjgmfcfig?hl=en) plugin for your Google Chrome browser (Specifically designed to make HTTP requests with Elasticsearch queries easy to run)
  - Alternatively use 'curl' commands in your terminal app to make HTTP requests

### Indexing Search Data (Temporary Method)
##### www.chapman.edu
- Run each http PUT request as listed in the 'example_http_requests.json' file to build a Web Crawler for www.chapman.edu (Use Sense or curl for this). 
  - The crawler is created in the '_river' PUT request, it may be modified per this [README](https://github.com/codelibs/elasticsearch-river-web/blob/master/README_old.md)
  - The DELETE command allow you to delete and recreate with new attributes at will

##### [inside.chapman.edu](inside.chapman.edu)
- Assuming you have Ruby & Ruby on Rails installed and running, start up your Rails Console
- Run 'Event.reindex' and 'Post.reindex'
  - These may take a while to complete, as there are well over 60,000 posts in our database

### How to Use
1. After indexing data, run the index.html file and interface with the currently built application
2. Run any of the listed GET requests in the 'example_http_requests.json' file with Sense or curl. (You may also create your own)