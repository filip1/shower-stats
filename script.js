// method to convert a Date object to a string as used by HTML input elements of type datetime-local
Date.prototype.toLocalISOString = function() {
  var off = this.getTimezoneOffset();
	return new Date(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes() - off, this.getSeconds(), this.getMilliseconds()).toISOString().slice(0,-1);
}

function dateTimeParseException(str) {
    this.value = str;
    this.message = ' could not be parsed as a date and time.';
    this.toString = function() {
        return this.value + this.message;
    };
}


// takes a datetime string (e.g. from an HTML datetime-local input element) and returns a Date object
function parseDateTime(str) {
    var UTC = str.slice(-1) === "Z" ? true : false;
    if (UTC) {str = str.slice(0,-1)} // remove trailing Z (the UTC marker) from string to continue parsing
    var dateTime = str.split('T');
    if (dateTime.length != 2) {
        throw new dateTimeParseException(str);
    }
    var date = dateTime[0].split('-');
    if (date.length != 3) {
        throw new dateTimeParseException(str);
    }
    var time = dateTime[1].split(':');
    if (time.length < 2 || time.length > 3) {
        throw new dateTimeParseException(str);
    }
    var year = parseInt(date[0], 10),
        month = parseInt(date[1], 10) - 1, // month needs to be 0-11
        day = parseInt(date[2], 10),
        hour = parseInt(time[0], 10),
        minute = parseInt(time[1], 10),
        second = parseInt(time[2].split('.')[0], 10),
        millisecond = parseInt(time[2].split('.')[1], 10);
    if (UTC) {
        var dateObj = new Date(Date.UTC(year, month, day, hour, minute, second, millisecond));
    }
    else {
        var dateObj = new Date(year, month, day, hour, minute, second, millisecond);
    }
    return dateObj;
}

// set a datetime-local input field to the current time and date
function recordTime (startOrStop) {
    var timeField = document.getElementById(startOrStop);
    var now = new Date();
    timeField.value = now.toLocalISOString();
}

function saveToLocalStorage (obj, objName) {
    localStorage.setItem(objName, JSON.stringify(obj));
}

function formSubmit (e) {
    var form = e.target;
    var inputs = form.getElementsByTagName('input');
    var shower = new Shower (inputs);
    showers.push(shower);
    saveToLocalStorage(showers, "showers");
    e.preventDefault();
}

var Shower = function (inputs) {
    this.parseAndAssign = function (key, val) {
        switch (key) {
            case 'startTime':
            case 'endTime':
                this[key] = parseDateTime(val);
                break;
            case 'timeUsed':
                this[key] = parseInt();
                break;
            case 'tempWarm':
            case 'tempCold':
            case 'warmStart':
            case 'coldStart':
            case 'warmEnd':
            case 'coldEnd':
            case 'warmUsed':
            case 'coldUsed':
            case 'waterUsed':
            case 'warmRatio':
            case 'coldRatio':
            case 'avgTemp':
            case 'avgWaterPerSec':
            case 'avgWarmPerSec':
            case 'avgColdPerSec':
                this[key] = parseFloat(val);
                break;
            default:
                console.warn(key + ' not recognized, passing value without parsing');
                this[key] = val;
        }
    }
    
    this.calcResults = function () {    
        this.warmUsed = this.warmEnd - this.warmStart;
        this.coldUsed = this.coldEnd - this.coldStart;
        this.waterUsed = this.warmUsed + this.coldUsed;
        this.timeUsed = this.endTime - this.startTime; // in milliseconds
        this.warmRatio = this.warmUsed / this.waterUsed;
        this.coldRatio = this.coldUsed / this.waterUsed;
        this.avgTemp = (this.warmUsed * this.tempWarm + this.coldUsed * this.tempCold) / this.waterUsed;
        this.avgWaterPerSec = 1000 * this.waterUsed / this.timeUsed;
        this.avgWarmPerSec = 1000 * this.warmUsed / this.timeUsed;
        this.avgColdPerSec = 1000 * this.coldUsed / this.timeUsed;
    }
    
    if (inputs instanceof HTMLCollection) { // data is coming from form inputs
        for (i = 0; i<inputs.length; i++) {
            this.parseAndAssign(inputs[i].id, inputs[i].value);
        }
    }
    else { // data is coming from storage (string-based key-value pairs)
        for (var prop in inputs) {
            this.parseAndAssign(prop, inputs[prop]);
        }
    }
    this.calcResults();
}


// load from localStorage

function loadShowersFromStorage () {
    var showersFromStorage = JSON.parse(localStorage.getItem("showers")) ? JSON.parse(localStorage.getItem("showers")) : [];
    var showers = [];
    for (i = 0; i < showersFromStorage.length; i++) {
        var showerFromStorage = showersFromStorage[i];
        var shower = new Shower(showerFromStorage); // make them proper Shower objects
        showers.push(shower);
    }
    return showers;
}

var showers = loadShowersFromStorage();


document.getElementById('form').addEventListener('submit', formSubmit, false);
document.getElementById('start').addEventListener('click', function() {recordTime('startTime');}, false);
document.getElementById('stop').addEventListener('click', function() {recordTime('endTime');}, false);