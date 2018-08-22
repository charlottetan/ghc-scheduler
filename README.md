# ghc-scheduler
Helps with visualising the schedule for GHC 2018.

<a href="https://raw.githubusercontent.com/charlottetan/ghc-scheduler/master/scheduler.PNG"><img src="https://raw.githubusercontent.com/charlottetan/ghc-scheduler/master/scheduler.PNG" width="50%"></a>

## Goals
* Easy to install.
* Make sure we are always operating on current data - If the schedule changes, this script will pick up the changes.

## Install
1. Go to the [raw js](https://raw.githubusercontent.com/charlottetan/ghc-scheduler/master/ghc.js) and copy it (ctrl-c).
2. Go to the [GHC sessions page](http://www.cvent.com/events/grace-hopper-celebration/agenda-6083a0df738343e2ad8b262237e56423.aspx?p=13).
3. Open Developer Tools and paste the js into the console.

## Usage
* **Dates:** Click to toggle between the dates
* **Audience | Track | Off:** Choose to colour the sessions by audience, track, or turn it off.
* **Show all sessions:** Toggle to exclude sessions outside of the main session block. List of excluded sessions is in the code.
* Schedule controls:
  * **Show my schedule:** While viewing sessions, click on a session to add it to your schedule, then click this button to show only the sessions that you have added. Note: This disables the *Show all sessions* filter.
  * **Clear:** Remove all sessions that were in your schedule.
  * **Export:** Export schedule as a `|` delimited list of titles.
  * **Import:** Import a `|` delimited list of titles as a schedule and load it up for viewing.
  * Textbox: For grabbing exported schedule and importing schedule.
* **Audience/Track colour blocks:** These can be toggled to show sessions that match a particular audience or track.
* **Schedule container**: Has two horizontal scrollbars to help with the scrolling.
* **Each session**: Hovering over a session brings up the description of the session. Clicking on a session will add it to your schedule which you can then view and edit using the schedule controls.
