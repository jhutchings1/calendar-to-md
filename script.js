/** 
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.

To run this project, set apiKey to your application's API key and clientId to
your application's OAuth 2.0 client ID. They can be generated at:
  https://console.developers.google.com/apis/credentials?project=_
Then, add a JavaScript origin to the client that corresponds to the domain
where you will be running the script. Finally, activate the People API at:
  https://console.developers.google.com/apis/library?project=_
*/


// Enter the API Discovery Docs that describes the APIs you want to
// access. In this example, we are accessing the People API, so we load
// Discovery Doc found here: https://developers.google.com/people/api/rest/
var discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];


// Enter one or more authorization scopes. Refer to the documentation for
// the API or https://developers.google.com/people/v1/how-tos/authorizing
// for details.
var scopes = 'profile https://www.googleapis.com/auth/calendar.events.readonly';

// Configure this if you want to convert a mailto: in the meeting notes into an `@username` mention. 
var convertEmailToMention = true;
var convertEmailToMentionDomain = "@github.com";

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

function handleClientLoad() {
    $.getJSON("config.json", function (value) {
        window.apiKey = value.apikey;
        window.clientId = value.clientid;
        // Load the API client and auth2 library
        gapi.load('client:auth2', initClient);
    });

}

function initClient() {
    gapi.client.init({
        apiKey: window.apiKey,
        discoveryDocs: discoveryDocs,
        clientId: window.clientId,
        scope: scopes
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        makeApiCall();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function addMeetingPicker(events) {
    var content = document.getElementById('content');
    var select = document.createElement("select");
    select.id = "meetingPicker";


    events.forEach((item, index) => {
        var element = document.createElement("option");
        element.text = item.summary;
        select.appendChild(element);
    });
    select.onchange = showDetails;
    select.onload = showDetails;
    content.appendChild(select);

    showDetails();
}

function copy() {
    var template = document.getElementById("meetingTemplate2");
    template.select();
    document.execCommand("copy");
}

function showDetails() {
    var template = document.getElementById("meetingTemplate");
    var template2 = document.getElementById("meetingTemplate2");
    var picker = document.getElementById("meetingPicker");

    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    }).then(function (response) {
        var events = response.result.items;

        if (events.length > 0) {
            var selected = events[picker.selectedIndex];

            template.textContent = "# " + selected.summary + "\n"
                + selected.start.dateTime + "\n\n"
                + "### Attendees \n";

            var organizer = selected.organizer;
            if (convertEmailToMention && organizer.email.includes(convertEmailToMentionDomain)) {
                template.textContent += "* [ ] @" + organizer.email.substring(0, organizer.email.indexOf("@")) + "\n";
            } else if (organizer.displayName == null) {
                template.textContent += "* [ ] [" + organizer.email + "](mailto:" + organizer.email + ") \n";
            } else {
                template.textContent += "* [ ] [" + organizer.displayName + "](mailto:" + organizer.email + ") \n";
            }

            if (selected.attendees != null) {
                selected.attendees.forEach((item, index) => {
                    if (convertEmailToMention && item.email.includes(convertEmailToMentionDomain)) {
                        template.textContent += "* [ ] @" + item.email.substring(0, item.email.indexOf("@")) + "\n";
                    } else if (item.displayName == null) {
                        template.textContent += "* [ ] [" + item.email + "](mailto:" + item.email + ") \n";
                    } else {
                        template.textContent += "* [ ] [" + item.displayName + "](mailto:" + item.email + ") \n";
                    }
                });
            }

            template.textContent += "\n### Notes\n";
            template.textContent += selected.description;
            template2.textContent = template.textContent;

        } else {
            appendPre('No upcoming events found.');
        }
    });
}

function addAttendee(item, index, template) {
    if (item.email.includes("@github.com")) {
        template.textContent += "* [ ] @" + item.email.substring(0, item.email.indexOf("@")) + "\n";
    } else if (item.displayName == null) {
        template.textContent += "* [ ] [" + item.email + "](mailto:" + item.email + ") \n";
    } else {
        template.textContent += "* [ ] [" + item.displayName + "](mailto:" + item.email + ") \n";
    }
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
    gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    }).then(function (response) {
        var events = response.result.items;

        if (events.length > 0) {
            addMeetingPicker(events);
        } else {
            appendPre('No upcoming events found.');
        }
    });
}
