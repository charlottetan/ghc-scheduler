// For: http://www.cvent.com/events/grace-hopper-celebration/agenda-6083a0df738343e2ad8b262237e56423.aspx?p=13

function parseGhcSessions() {
    var tracksIdToTextMap = {};
    var tracksTextToIdMap = {};
    var audienceIdToTextMap = {};
    var audienceTextToIdMap = {};
    var focusAreaSet = new Set();
    var ghcDays = new Set();

    var sessionContainerDivs = jQuery(".reg-matrix-header-container");

    var sesArr = [];
    for (var i = 0; i < sessionContainerDivs.length; i++) {
        var oneSes = {};
        oneSes.title = sessionContainerDivs[i].childNodes[1].childNodes[1].innerHTML.trim();
    
        var sessionContentDiv = sessionContainerDivs[i].childNodes[3];
        var sessionInfoDiv = sessionContentDiv.childNodes[1].childNodes[1];
    
        var infoDivChildCounter = 0;
    
        if (sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[0].nodeValue  == "Audience Level: ")
        {
            oneSes.audience = sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[1].innerHTML;
            var audienceKey = oneSes.audience.replace(/[^a-z0-9]/gi, '');
            audienceIdToTextMap[audienceKey] = oneSes.audience;
            audienceTextToIdMap[oneSes.audience] = audienceKey;

            infoDivChildCounter += 2;
        }
    
        if (sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[0].nodeValue  == "Track: ")
        {
            oneSes.track = sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[1].innerHTML;
            var trackKey = oneSes.track.replace(/[^a-z0-9]/gi, '') + "Tr";
            tracksIdToTextMap[trackKey] = oneSes.track;
            tracksTextToIdMap[oneSes.track] = trackKey;

            infoDivChildCounter += 2;
        }
    
        if (sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[0].nodeValue  == "Focus Area: ")
        {
            oneSes.focusArea = sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[1].innerHTML;
            focusAreaSet.add(oneSes.focusArea);
            infoDivChildCounter += 2;
        }
        
        oneSes.startDate = sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[1].innerHTML;
        ghcDays.add(oneSes.startDate);
        infoDivChildCounter += 2;

        oneSes.timeStart = sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[1].innerHTML;
        oneSes.timestampStart = Date.parse(oneSes.startDate + ' ' + oneSes.timeStart);
        infoDivChildCounter += 2;
        
        oneSes.timeEnd = sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[1].innerHTML;
        oneSes.timestampEnd = Date.parse(oneSes.startDate + ' ' + oneSes.timeEnd);
        infoDivChildCounter += 2;
    
        if (infoDivChildCounter < sessionInfoDiv.childNodes.length && 
            sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[0].nodeValue  == "Location: ")
        {
            oneSes.location = sessionInfoDiv.childNodes[infoDivChildCounter].childNodes[1].innerHTML;
            infoDivChildCounter += 2;
        }
    
        if (infoDivChildCounter <= sessionInfoDiv.childNodes.length)
        {
            var speakerDivList = sessionInfoDiv.childNodes[infoDivChildCounter].childNodes;
            oneSes.speakers = [];
    
            for (var j = 0; j < speakerDivList.length; j+=2) {
                oneSes.speakers.push(speakerDivList[j].childNodes[0].nodeValue);
            }
            
            infoDivChildCounter += 2;
        }
    
        oneSes.desc = sessionContentDiv.childNodes[3].innerHTML.trim();
    
        sesArr.push(oneSes);
    }

    localStorage.setItem('ghcSessionArray', JSON.stringify(sesArr));
    localStorage.setItem('ghcDays', [...ghcDays].join('|'));
    localStorage.setItem('tracksIdToTextMap', JSON.stringify(tracksIdToTextMap));
    localStorage.setItem('tracksTextToIdMap', JSON.stringify(tracksTextToIdMap));
    localStorage.setItem('audienceIdToTextMap', JSON.stringify(audienceIdToTextMap));
    localStorage.setItem('audienceTextToIdMap', JSON.stringify(audienceTextToIdMap));
    localStorage.setItem('focusAreaSet', [...focusAreaSet].join('|'));    

    if (!localStorage.getItem('includedTracks')) {
        var includedTracks = Object.keys(tracksIdToTextMap);
        localStorage.setItem('includedTracks', [...includedTracks].join('|'));
    }

    if (!localStorage.getItem('includedAudiences')) {
        var includedAudiences = Object.keys(audienceIdToTextMap);
        localStorage.setItem('includedAudiences', [...includedAudiences].join('|'));
    }
}

function slotSessions() {
    // for some reason this double parse is required for arrays of objects in localStorage
    var sessionArray = JSON.parse(JSON.parse(localStorage.getItem('ghcSessionArray')));
    var sList = {};
    var mList = {};
    var lList = {};

    // sList: 0-2hrs
    // mList: 2.1-3 hrs
    // lList: more than 3 hours
    const sLimit = 1000*60*60*2;
    const mLimit = 1000*60*60*3;
    
    const partyName = "GHC Evening Celebration";

    var dayArray = localStorage.getItem('ghcDays').split('|');

    // get included list
    var includedTracks = localStorage.getItem('includedTracks').split('|');   
    var includedAudiences = localStorage.getItem('includedAudiences').split('|');

    const excludedSessions = [
        'Community Volunteer Orientation',
        'Wednesday Keynote: Padmasree Warrior and Jessica Matthews',
        'Mentoring Circles',
        'CR111: Speed Mentoring',
        'Poster Session 1',
        'Poster Session 2',
        'Poster Session 3',
        'Poster Session 4',
        'Poster Session 5',
        'Faculty Lounge',
        'Speaker Lounge',
        'Student Lounge',
        'Gallery: Our Time',
        'GHC Expo',
        'Open Source Day Code-a-thon for Humanity',
        'AnitaB.org PitcHER',
        'Friday Keynote: Justine Cassell and PitcHER Winners',
        'GHC Evening Celebration',
        'Session Chair Orientation (Invite Only)',
        'Speaker\'s Reception (Invite Only)',
        'AnitaB.org Community Leadership Dinner (Invite Only)',
        'Hoppers Orientation (Invite Only)',
        'BRAID Welcome Reception (Invite Only)',
        'SMASH Academy Networking Reception (Invite Only)',
        'AnitaB.org Partner Meeting (Invite Only)',
        'GHC Scholar Networking Reception (Invite Only)',
        'Technical Executive Forum (Invite Only)',
        'Senior Women\'s Program (Invite Only)',
        'ACM-W Luncheon (Invite Only)',
        'Committee\'s Lunch (Invite Only)',
    ];

    if (localStorage.getItem('showAllSessions') === 'true') {
        excludedSessions = [];
    }

    //showSchedule overrides excludedSessions
    var mySchedule = [];
    var showingSchedule = localStorage.getItem('showSchedule') === 'true';    
    if (showingSchedule) {
        var storageSched = localStorage.getItem('mySchedule');
        if (storageSched) {
            mySchedule = storageSched.split('|');
        }
        excludedSessions = [];
    }

    for (var i = 0; i < sessionArray.length; i++) {
        var sesDay = sessionArray[i].startDate;

        var aDay = [];
        var aTrack = {};
        var trackSessions = [];
        var trackId = 0;
        var days;

        // only proceed to slot if included
        var trackKey = undefined, audienceKey = undefined;
        if (sessionArray[i].track) {
            trackKey = sessionArray[i].track.replace(/[^a-z0-9]/gi, '') + "Tr";
        }
        if (sessionArray[i].audience) {            
            audienceKey = sessionArray[i].audience.replace(/[^a-z0-9]/gi, '');
        }
        var trackKeyIncluded = !trackKey || (trackKey && includedTracks.includes(trackKey));
        var audienceKeyIncluded = !audienceKey || (audienceKey && includedAudiences.includes(audienceKey));
        var isNotAnExcludedSession = (!showingSchedule && !excludedSessions.includes(sessionArray[i].title)) ||
                                     (showingSchedule && mySchedule.includes(sessionArray[i].title));

        if (trackKeyIncluded && audienceKeyIncluded && isNotAnExcludedSession) {
            // get tshirt size
            var duration = sessionArray[i].timestampEnd - sessionArray[i].timestampStart;
            switch (true) {
                case (duration <= sLimit):
                    days = sList;
                    break;
                case (duration <= mLimit):
                    days = mList;
                    break;
                default:
                    days = lList;
            }
            
            // Exception for GHC Evening Celebration
            if (sessionArray[i].title == partyName) {
                days = sList;
            }

            if (days[sesDay]) {
                aDay = days[sesDay];
                
                var foundTrack = false;
                // find a suitable track
                for (var j = 0; j < aDay.length; j++) {
                    var candidateTrack = aDay[j];
                    if (candidateTrack.latest < sessionArray[i].timestampStart) {
                        // we found our track
                        foundTrack = true;
                        trackId = j;
                        aTrack = candidateTrack;
                        trackSessions = candidateTrack.sessions;
                        break;
                    }
                }

                // if none found, add to end
                if (!foundTrack) {
                    trackId = aDay.length;
                }
            }

            // add session to track
            trackSessions.push(sessionArray[i]);
            aTrack.latest = sessionArray[i].timestampEnd;
            aTrack.sessions = trackSessions;

            // add track to day
            aDay[trackId] = aTrack;

            // add day to days
            // Exception for GHC Evening Celebration
            if (sessionArray[i].title == partyName) {
                sList[sesDay] = aDay;
            } else {
                switch (true) {
                    case (duration <= sLimit):
                        sList[sesDay] = aDay;
                        break;
                    case (duration <= mLimit):
                        mList[sesDay] = aDay;
                        break;
                    default:
                        lList[sesDay] = aDay;
                }
            }
        }
    }

    // combine days
    var schedule = {};
    for (let dayItem of dayArray) {
        schedule[dayItem] = [];
        if (sList[dayItem]) {
            schedule[dayItem].push(...sList[dayItem]);
        }
        if (mList[dayItem]) {
            schedule[dayItem].push(...mList[dayItem]);
        }
        if (lList[dayItem]) {
            schedule[dayItem].push(...lList[dayItem]);
        }
    };
    
    return schedule;
}

function toggleTabs(eventObj) {
    var timestampButton = eventObj.target.id;
    var timestamp = eventObj.target.id.replace("button", "");

    var newWidth = jQuery('#' + timestamp).width();
    jQuery('#dayDummyContent').width(newWidth);

    jQuery('.dayDiv').hide();
    jQuery('#dayTabs button').removeClass('selected');
    
    jQuery('#' + timestampButton).addClass('selected');
    jQuery('#' + timestamp).show();

    var bufferSoThatDivWillNotScroll = 250;
    jQuery('#dayContent').height(jQuery(`#${timestamp}`)[0].scrollHeight+bufferSoThatDivWillNotScroll + 'px');

    localStorage.setItem('selectedTimestampButton', timestampButton);
}

function toggleAudienceTrackOff(eventObj) {
    jQuery(".toggleOptions").removeClass("selected");

    switch (eventObj.target.id) {
        case "toggleAudienceDiv":            
            jQuery("#toggleAudienceDiv").addClass("selected");

            jQuery("#audienceLegend").show();
            jQuery("#trackLegend").hide();
            jQuery(".sessionDiv").addClass("audienceColours").removeClass("trackColours");
            break;
        case "toggleTrackDiv":
            jQuery("#toggleTrackDiv").addClass("selected");

            jQuery("#audienceLegend").hide();
            jQuery("#trackLegend").show();
            jQuery(".sessionDiv").removeClass("audienceColours").addClass("trackColours");
            break;
        default:
            jQuery("#toggleOffDiv").addClass("selected");

            jQuery("#audienceLegend").hide();
            jQuery("#trackLegend").hide();
            jQuery(".sessionDiv").removeClass("audienceColours").removeClass("trackColours");
    }

    localStorage.setItem('selectedColouring', eventObj.target.id);
}

function toggleAudienceCategories(eventObj) {
    // update localstorage
    var included = localStorage.getItem('includedAudiences').split('|');
    if (included.includes(eventObj.target.id)) {
        var index = included.indexOf(eventObj.target.id);
        included.splice(index, 1);
    } else {
        included.push(eventObj.target.id);
    }
    localStorage.setItem('includedAudiences', [...included].join('|'));

    jQuery(`#${eventObj.target.id}`).toggleClass("selected");

    reflow();
}

function toggleTrackCategories(eventObj) {
    // update localstorage
    var included = localStorage.getItem('includedTracks').split('|');
    if (included.includes(eventObj.target.id)) {
        var index = included.indexOf(eventObj.target.id);
        included.splice(index, 1);
    } else {
        included.push(eventObj.target.id);
    }
    localStorage.setItem('includedTracks', [...included].join('|'));

    jQuery(`#${eventObj.target.id}`).toggleClass("selected");
    
    reflow();
}

function toggleMainSessions(eventObj) {
    var jQele = jQuery(`#${eventObj.target.id}`);

    if (!jQele.hasClass('disabled')) {
        var newValue = !(localStorage.getItem('showAllSessions') === 'true');
        localStorage.setItem('showAllSessions', newValue);

        if ((newValue && !jQele.hasClass("selected")) ||
            (!newValue && jQele.hasClass("selected"))) {
            jQele.toggleClass("selected");
        }

        reflow();
    }
}

function sessionClick(eventObj) {
    var title = "";
    if (eventObj.target.tagName === "SPAN") {
        if (eventObj.target.className === "title") {
            title = eventObj.target.innerHTML;
        } else {
            title = eventObj.target.siblings()[1].innerHTML;
        }
    } else {
        title = eventObj.target.childNodes[2].innerHTML;
    }

    var mySched = localStorage.getItem('mySchedule');
    if (mySched) {
        mySched += '|' + title;
    } else {
        mySched = title;
    }
    
    localStorage.setItem('mySchedule', mySched);
}

function toggleShowSchedule(eventObj) {
    var jQele = jQuery(`#${eventObj.target.id}`);
    var newValue = !(localStorage.getItem('showSchedule') === 'true');
    localStorage.setItem('showSchedule', newValue);

    // update controls
    if ((newValue && !jQele.hasClass("selected")) ||
        (!newValue && jQele.hasClass("selected"))) {
        jQele.toggleClass("selected");
    }
    
    if (newValue) {
        // disable mainSessionsFilter
        jQuery("#mainSessionsFilter").removeClass("selected");
        jQuery("#mainSessionsFilter").addClass("disabled");
    } else {
        // reenable
        jQuery("#mainSessionsFilter").removeClass("disabled");

        var showingAll = (localStorage.getItem('showAllSessions') === 'true');
        localStorage.setItem('showAllSessions', !showingAll);
        jQuery("#mainSessionsFilter").click();
    }

    reflow();
}

function clearSchedule() {
    localStorage.removeItem('mySchedule');
    localStorage.setItem('showSchedule', false);

    // update controls
    jQuery("#scheduleInput").val('');
    jQuery("#mainSessionsFilter").removeClass("disabled");

    reflow();
}

function exportSchedule() {
    jQuery("#scheduleInput").val(localStorage.getItem('mySchedule'));
}

function importSchedule() {
    localStorage.setItem('mySchedule', jQuery("#scheduleInput").val());
    localStorage.setItem('showSchedule', 'false');
    jQuery("#scheduleShowDiv").click();
}

function createDiv() {
    jQuery('#schedCss').remove();
    jQuery('#output').remove();

    const trackColours = [
        '#bf968f', '#f29979', '#7f5940', '#e5b073', '#fff780',
        '#f2eeb6', '#798060', '#8fcc66', '#53a674', '#79f2da',
        '#53a0a6', '#80d5ff', '#7c98a6', '#80a2ff', '#99a0cc',
        '#8959b3', '#f279da', '#80406a', '#e6accb', '#ff8091',
        '#994d57'
    ];

    const audienceColours = [
        '#d97b6c', '#807560', '#ffe680', '#73e6a1', '#bff2ff',
        '#80c4ff', '#46628c', '#9c66cc', '#f2b6de', '#804059'
    ];

    // hard to see
    var flipColors = [
        '#80406a', '#994d57', '#46628c', '#804059', '#807560'
    ];

    var dayLegend = jQuery('<div/>', {id: 'dayLegend'});

    var dayControls = jQuery('<div/>', {id: 'dayControls'});

    // colour controls
    var toggleColoursDiv = jQuery('<div/>', {id: 'toggleColoursDiv'});
    var toggleAudienceDiv = jQuery('<div/>', {id: 'toggleAudienceDiv', class: 'toggleOptions', text: 'Audience'}).click(toggleAudienceTrackOff);
    var toggleTrackDiv = jQuery('<div/>', {id: 'toggleTrackDiv', class: 'toggleOptions', text: 'Track'}).click(toggleAudienceTrackOff);
    var toggleOffDiv = jQuery('<div/>', {id: 'toggleOffDiv', class: 'toggleOptions', text: 'Off'}).click(toggleAudienceTrackOff);
    toggleColoursDiv.append(toggleAudienceDiv).append(toggleTrackDiv).append(toggleOffDiv);

    // show only main sessions
    var mainSessionsFilter = jQuery('<div/>', {
        id: 'mainSessionsFilter',
        text: 'Show all sessions',
        title: 'Toggle to exclude sessions that occur outside of the main session block'
    }).click(toggleMainSessions);

    if (localStorage.getItem('showSchedule') === 'true') {
        mainSessionsFilter.addClass("disabled");
    } else if (localStorage.getItem('showAllSessions') === 'true') {
        mainSessionsFilter.addClass("selected");
    }

    // mySchedule controls
    var scheduleControlsDiv = jQuery('<div/>', {id: 'scheduleControlsDiv'});
    var scheduleShowDiv = jQuery('<div/>', {id: 'scheduleShowDiv', class: 'scheduleControls', text: 'Show my schedule'}).click(toggleShowSchedule);
    var schduleClearDiv = jQuery('<div/>', {id: 'schduleClearDiv', class: 'scheduleControls', text: 'Clear'}).click(clearSchedule);
    var schduleExportDiv = jQuery('<div/>', {id: 'schduleExportDiv', class: 'scheduleControls', text: 'Export'}).click(exportSchedule);
    var schduleImportDiv = jQuery('<div/>', {id: 'schduleImportDiv', class: 'scheduleControls', text: 'Import'}).click(importSchedule);
    var scheduleInput = jQuery('<input/>', {id: 'scheduleInput', type: 'text', size: '100'});
    scheduleControlsDiv.append(scheduleShowDiv).append(schduleClearDiv).append(schduleExportDiv).append(schduleImportDiv).append(scheduleInput);

    if (localStorage.getItem('showSchedule') === 'true') {
        scheduleShowDiv.addClass("selected");
    }    

    // legends
    var trackLegend = jQuery('<div/>', {id: 'trackLegend'});
    var trackCss = '';
    var trackColourCounter = 0;
    var tracksIdToTextMap = JSON.parse(localStorage.getItem('tracksIdToTextMap'));
    var trackKeys = Object.keys(tracksIdToTextMap);
    trackKeys.sort();
    var includedTracks = localStorage.getItem('includedTracks').split('|');
    for (var trackKey of trackKeys) {
        trackCss += `.sessionDiv.trackColours.${trackKey}, #trackLegend .trackColours.${trackKey}.selected {background-color: ${trackColours[trackColourCounter]};}`;
        trackColourCounter++;

        var swatch = jQuery('<div/>', {id: trackKey, class: 'trackColours ' + trackKey}).text(tracksIdToTextMap[trackKey]).click(toggleTrackCategories);
        if (includedTracks.includes(trackKey)) {
            swatch.addClass("selected");
        }
        trackLegend.append(swatch);
    };

    var audienceLegend = jQuery('<div/>', {id: 'audienceLegend'});
    var audienceCss = '';
    var audienceColourCounter = 0;

    //manual sort
    var audienceKeys = [
        "Student", "Faculty",
        "EarlyCareer", "MidCareer", "SeniorExecutive", 
        "BeginnerTech", "IntermediateTech", "AdvancedTech",
        "All", "InviteOnly"];

    var audienceIdToTextMap = JSON.parse(localStorage.getItem('audienceIdToTextMap'));
    var dataAudienceKeys = Object.keys(audienceIdToTextMap);

    //sanity check to make sure the keys are what we expect, otherwise just use unsorted array
    var manualAudienceStr = audienceKeys.concat().sort().join(',');
    var dataAudienceStr = dataAudienceKeys.concat().sort().join(',');
    if (manualAudienceStr !== dataAudienceStr) {
        audienceKeys = dataAudienceKeys;
    }

    var includedAudiences = localStorage.getItem('includedAudiences').split('|');
    for (var audienceKey of audienceKeys) {
        audienceCss += `.sessionDiv.audienceColours.${audienceKey}, #audienceLegend .audienceColours.${audienceKey}.selected {background-color: ${audienceColours[audienceColourCounter]};}`;
        audienceColourCounter++;

        var swatch = jQuery('<div/>', {id: audienceKey, class: 'audienceColours ' + audienceKey}).text(audienceIdToTextMap[audienceKey]).click(toggleAudienceCategories);
        if (includedAudiences.includes(audienceKey)) {
            swatch.addClass("selected");
        }
        audienceLegend.append(swatch);
    };

    dayControls.append(toggleColoursDiv);
    dayControls.append(mainSessionsFilter);
    dayControls.append(scheduleControlsDiv);
    dayLegend.append(trackLegend);
    dayLegend.append(audienceLegend);

    // colours: http://phrogz.net/css/distinct-colors.html, sat 50-25, val
    var cssStylesHtml = `
    #output {
        font-family: arial, sans-serif; 
    }

    #dayContent {
        display: flex;
        flex-direction: column;
        overflow: auto;
    }

    #dayDummyWrapper {
        overflow-x: scroll;
        overflow-y:hidden;
        height: 20px;
    }
    
    #dayDummyContent {
        height: 20px;
    }

    .dayDiv {
        display: flex;
    }

    .trackDiv {
        display: flex;
        flex-direction: column;
        min-width: 80px;
    }

    .sessionDiv {
        border: solid black 1px;
    }

    .sessionDiv > span {
        font-size: 1.25vh;
    }

    #dayTabs button {
        background-color: #54BCEB;
        color: #fff;
        border: none;
        outline: none;
        cursor: pointer;
        padding: 10px 12px;
        transition: 0.3s;
    }

    #dayTabs button:hover, #dayTabs button.selected {
        background-color: #005c88;
    }

    #toggleColoursDiv {
        display: flex;
    }

    .toggleOptions, #mainSessionsFilter, .scheduleControls {
        background-color: #f1f1f1;
        border: 1px solid grey;
        padding: 6px 8px;
        cursor: pointer;
        transition: 0.3s;
        display: flex;        
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }

    .toggleOptions:hover, #mainSessionsFilter:hover, .scheduleControls:hover {
        background-color: #ddd;
    }
    
    .toggleOptions.selected, #mainSessionsFilter.selected, .scheduleControls.selected {
        background-color: #ababab;
    }

    .toggleOptions.disabled, #mainSessionsFilter.disabled, .scheduleControls.disabled, #mainSessionsFilter.disabled:hover {
        color: #ddd;
        border: 1px solid #ddd;
        background-color: #f1f1f1;
        cursor: default;
    }

    .toggleOptions:first-of-type, .scheduleControls:first-of-type {
        border-radius: 10px 0px 0px 10px;
    }

    .toggleOptions:last-of-type, .scheduleControls:last-of-type {
        border-radius: 0px 10px 10px 0px;
    }

    #scheduleInput {
        padding: 0;
    }

    #dayLegend, #dayLegend > div, #dayControls, #dayControls > div {
        display: flex;
    }

    #trackLegend, #audienceLegend {
        flex-wrap: wrap;
        width: 80%;
    }

    #dayLegend .trackColours, #dayLegend .audienceColours {
        padding: 6px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;        
        cursor: pointer;
    }

    #dayLegend div, #dayControls div, #dayControls input {
        font-size: 13px;
    }

    #mainSessionsFilter {        
        border-radius: 10px;
    }

    ${trackCss}
    ${audienceCss}
    `;

    jQuery("<style>", {id: 'schedCss'})
        .prop("type", "text/css")
        .html(cssStylesHtml)
        .appendTo("head");
    
    var output = jQuery('<div/>', {id: 'output'});
    var dayTabs = jQuery('<div/>', {id: 'dayTabs'});

    var dayArray = localStorage.getItem('ghcDays').split('|');
    for (var dayStr of dayArray) {
        // create tabs
        var dayButton = jQuery('<button/>', {type: 'button', id: Date.parse(dayStr)+'button'});
        dayButton.click(toggleTabs);
        dayButton.text(dayStr);
        dayTabs.append(dayButton);
    }

    var dayContainer = jQuery('<div/>', {id: 'dayContainer'});
    var dayDummyWrapper = jQuery('<div/>', {id: 'dayDummyWrapper'});
    var dayDummyContent = jQuery('<div/>', {id: 'dayDummyContent'});

    // for dummy scrollbar
    dayDummyWrapper.append(dayDummyContent);
    dayContainer.append(dayDummyWrapper);

    output.append(dayTabs);
    output.append(dayControls);
    output.append(dayLegend);
    output.append(dayContainer);
    jQuery('.header').after(output);
}

function reflow() {
    var schedule = slotSessions();

    var dayContainer = jQuery('#dayContainer');
    var dayContent = jQuery('#dayContent').remove();
    dayContent = jQuery('<div/>', {id: 'dayContent'});
    
    var heightMultiplier = 2.5/(1000 * 60);

    for (var dayStr in schedule) {        
        var dayDiv = jQuery('<div/>', {id: Date.parse(dayStr), class: 'dayDiv'});
        var day = schedule[dayStr];

        if (day.length > 0) {
            // create content
            var dayStartTimestamp = day[0]["sessions"][0].timestampStart;

            // change max width based on number of tracks
            var maxW = day.length * 80;
            dayDiv.css('min-width', maxW + 'px');

            var tracksTextToIdMap = JSON.parse(localStorage.getItem('tracksTextToIdMap'));
            var audienceTextToIdMap = JSON.parse(localStorage.getItem('audienceTextToIdMap'));

            for (var trackNum = 0; trackNum < day.length; trackNum++) {
                var trackDiv = jQuery('<div/>', {class: 'trackDiv'});

                var sessions = day[trackNum]["sessions"];
                
                for (var sessionNum = 0; sessionNum < sessions.length; sessionNum++) {
                    // if new day, use day start as last session timestamp
                    var lastSessionTimestamp = dayStartTimestamp;
                    if (sessionNum > 0) {
                        lastSessionTimestamp = sessions[sessionNum-1].timestampEnd;
                    }

                    // if there is a gap, reflect it
                    var gapTimestamp = sessions[sessionNum].timestampStart - lastSessionTimestamp;
                    if (gapTimestamp > 0) {
                        var bufferSessionDiv = jQuery('<div/>');
                        var height = gapTimestamp * heightMultiplier;
                        bufferSessionDiv.height(height);
                        bufferSessionDiv.html("&nbsp;");
                        trackDiv.append(bufferSessionDiv);
                    }

                    var sessionDiv = jQuery('<div/>', {class: 'sessionDiv'});
                    if (sessions[sessionNum].track) {
                        sessionDiv.addClass(tracksTextToIdMap[sessions[sessionNum].track]);
                    }
                    if (sessions[sessionNum].audience) {
                        sessionDiv.addClass(audienceTextToIdMap[sessions[sessionNum].audience]);
                    }
                    var height = (sessions[sessionNum].timestampEnd - sessions[sessionNum].timestampStart) * heightMultiplier;

                    var content = "<span>" + sessions[sessionNum].timeStart + " - " + sessions[sessionNum].timeEnd + "</span><br/>";
                    content += "<span class='title'>" + sessions[sessionNum].title + "</span>";
                    sessionDiv.html(content);
                    sessionDiv.attr('title', sessions[sessionNum].desc);
                    
                    sessionDiv.height(height);

                    sessionDiv.click(sessionClick);

                    trackDiv.append(sessionDiv);
                }

                dayDiv.hide();
                dayDiv.append(trackDiv);
            }
        }

        dayContent.append(dayDiv);
    }

    dayContainer.append(dayContent);

    //add scrollbar fn
    jQuery("#dayDummyWrapper").scroll(function(){
        jQuery("#dayContent")
            .scrollLeft(jQuery("#dayDummyWrapper").scrollLeft());
    });
    jQuery("#dayContent").scroll(function(){
        jQuery("#dayDummyWrapper")
            .scrollLeft(jQuery("#dayContent").scrollLeft());
    });

    var selectedButton = localStorage.getItem('selectedTimestampButton');
    var selectedColouring = localStorage.getItem('selectedColouring');

    if (!selectedButton) {
        // Wednesday = 1537945200000button
        // Thursday = 1538031600000button
        selectedButton = '1537945200000button';
        localStorage.setItem('selectedTimestampButton', selectedButton);
    }

    if (!selectedColouring) {
        selectedColouring = 'toggleAudienceDiv';
        localStorage.setItem('selectedColouring', selectedColouring);
    }

    jQuery('#' + selectedButton).click();
    jQuery('#' + selectedColouring).click();
}

function gogo() {
    console.log("Here we go!");
    // parse again if page was refreshed
    if (!(sessionStorage.isOldSession === "true")) {
        sessionStorage.isOldSession = true;
        parseGhcSessions();
    }    
    createDiv();
    reflow();
}

gogo();
