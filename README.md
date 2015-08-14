# Search
This repository is the home of Chapman's internally built search functionality

### First Time Local Setup
- Clone this repository with `git clone git@github.com:chapmanu/search.git`
- Run `bundle install`
- Run `foreman start`
- Switch to a new tab, run `bundle exec rake www:setup`
- Navigate to 'localhost:4000'

### Load Search Data & Use Search
- Run `foreman start`
- Switch tabs, cd into your Inside project and run `rake search:index`
  - WARNING: There is no visualization of progress, but this will take a while (As there are > 60,000 posts, could take around 10 minutes). Please be patient.
- cd into Search project and run `bundle exec rake www:crawl`
  - This could also take a while, but you can view progress in your foreman tab
- Once all data is loaded, navigate to `localhost:4000/demo.html`