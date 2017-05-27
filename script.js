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

function parseDateTime(str) {
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
    var dateObj = new Date(year, month, day, hour, minute, second, millisecond);
    return dateObj;
}

function recordTime (startOrStop) {
    var timeField = document.getElementById(startOrStop);
    var now = new Date();
    timeField.value = now.toLocalISOString();
}

function formSubmit (e) {
    var form = e.target;
    var inputs = form.getElementsByTagName('input');
    var formValues = {};
    for (i = 0; i<inputs.length; i++) {
        if (inputs[i].type === "number") {
            formValues[inputs[i].id] = parseFloat(inputs[i].value);
        }
        else if (inputs[i].type === "datetime-local" ||
                 inputs[i].id === 'startTime' ||
                 inputs[i].id === 'endTime') { // not all browsers support datetime-local
            formValues[inputs[i].id] = parseDateTime(inputs[i].value);
        }
        else {
            formValues[inputs[i].id] = inputs[i].value;
        }
        
    }
    
//    var shower = new Shower();
    var shower = new Shower(formValues);
    showers.push(shower);
    localStorage.setItem("showers", JSON.stringify(showers));
    e.preventDefault();
}


var showers = JSON.parse(localStorage.getItem("showers")) ? JSON.parse(localStorage.getItem("showers")) : [];


var Shower = function (formValues) {
    for (var prop in formValues) {
        this[prop] = formValues[prop];
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
    this.calcResults();
};





document.getElementById('form').addEventListener('submit', formSubmit, false);
document.getElementById('start').addEventListener('click', function() {recordTime('startTime');}, false);
document.getElementById('stop').addEventListener('click', function() {recordTime('endTime')}, false);