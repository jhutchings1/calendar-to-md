# calendar-to-md

This web app can be used to convert a Google calendar event into a simple Markdown file suitable for taking meeting notes. 

<img width="1046" alt="screen shot 2019-01-24 at 3 12 54 pm" src="https://user-images.githubusercontent.com/12853539/51714855-70196980-1feb-11e9-82fa-64a7082e7d8b.png">


# Running this app
Add a file called config.json which follows the same schema as config-sample.json, and add your own `clientId` and `apiKey` using [these instructions from Google]( https://developers.google.com/calendar/quickstart/js). This app can be published onto a web server, or run locally using something like the node app `http-server`. 

