var moment = require('../module/moment');
var DateUtil = require('./DateUtil');
var util = require('../util');

/**
 * @constructor  TimeStep
 * The class TimeStep is an iterator for dates. You provide a start date and an
 * end date. The class itself determines the best scale (step size) based on the
 * provided start Date, end Date, and minimumStep.
 *
 * If minimumStep is provided, the step size is chosen as close as possible
 * to the minimumStep but larger than minimumStep. If minimumStep is not
 * provided, the scale is set to 1 DAY.
 * The minimumStep should correspond with the onscreen size of about 6 characters
 *
 * Alternatively, you can set a scale by hand.
 * After creation, you can initialize the class by executing first(). Then you
 * can iterate from the start date to the end date via next(). You can check if
 * the end date is reached with the function hasNext(). After each step, you can
 * retrieve the current date via getCurrent().
 * The TimeStep has scales ranging from milliseconds, seconds, minutes, hours,
 * days, to years.
 *
 * Version: 1.2
 *
 * @param {Date} [start]         The start date, for example new Date(2010, 9, 21)
 *                               or new Date(2010, 9, 21, 23, 45, 00)
 * @param {Date} [end]           The end date
 * @param {Number} [minimumStep] Optional. Minimum step size in milliseconds
 */
function TimeStep(start, end, minimumStep, hiddenDates) {
  this.moment = moment;

  // variables
  this.current = this.moment();
  this._start = this.moment();
  this._end = this.moment();

  this.autoScale  = true;
  this.scale = 'day';
  this.step = 1;

  // initialize the range
  this.setRange(start, end, minimumStep);

  // hidden Dates options
  this.switchedDay = false;
  this.switchedMonth = false;
  this.switchedYear = false;
  this.hiddenDates = hiddenDates;
  if (hiddenDates === undefined) {
    this.hiddenDates = [];
  }

  this.format = TimeStep.FORMAT; // default formatting
}

// Time formatting
TimeStep.FORMAT = {
  minorLabels: {
    millisecond:'SSS',
    second:     's',
    minute:     'HH:mm',
    hour:       'HH:mm',
    weekday:    'ddd D',
    day:        'D',
    month:      'MMM',
    year:       'YYYY'
  },
  majorLabels: {
    millisecond:'HH:mm:ss',
    second:     'D MMMM HH:mm',
    minute:     'ddd D MMMM',
    hour:       'ddd D MMMM',
    weekday:    'MMMM YYYY',
    day:        'MMMM YYYY',
    month:      'YYYY',
    year:       ''
  }
};

/**
 * Set custom constructor function for moment. Can be used to set dates
 * to UTC or to set a utcOffset.
 * @param {function} moment
 */
TimeStep.prototype.setMoment = function (moment) {
  this.moment = moment;

  // update the date properties, can have a new utcOffset
  this.current = this.moment(this.current);
  this._start = this.moment(this._start);
  this._end = this.moment(this._end);
};

/**
 * Set custom formatting for the minor an major labels of the TimeStep.
 * Both `minorLabels` and `majorLabels` are an Object with properties:
 * 'millisecond', 'second', 'minute', 'hour', 'weekday', 'day', 'month', 'year'.
 * @param {{minorLabels: Object, majorLabels: Object}} format
 */
TimeStep.prototype.setFormat = function (format) {
  var defaultFormat = util.deepExtend({}, TimeStep.FORMAT);
  this.format = util.deepExtend(defaultFormat, format);
};

/**
 * Set a new range
 * If minimumStep is provided, the step size is chosen as close as possible
 * to the minimumStep but larger than minimumStep. If minimumStep is not
 * provided, the scale is set to 1 DAY.
 * The minimumStep should correspond with the onscreen size of about 6 characters
 * @param {Date} [start]      The start date and time.
 * @param {Date} [end]        The end date and time.
 * @param {int} [minimumStep] Optional. Minimum step size in milliseconds
 */
TimeStep.prototype.setRange = function(start, end, minimumStep) {
  if (!(start instanceof Date) || !(end instanceof Date)) {
    throw  "No legal start or end date in method setRange";
  }

  this._start = (start != undefined) ? this.moment(start.valueOf()) : new Date();
  this._end = (end != undefined) ? this.moment(end.valueOf()) : new Date();

  if (this.autoScale) {
    this.setMinimumStep(minimumStep);
  }
};

/**
 * Set the range iterator to the start date.
 */
TimeStep.prototype.start = function() {
  this.current = this._start.clone();
  this.roundToMinor();
};

/**
 * Round the current date to the first minor date value
 * This must be executed once when the current date is set to start Date
 */
TimeStep.prototype.roundToMinor = function() {
  // round to floor
  // IMPORTANT: we have no breaks in this switch! (this is no bug)
  // noinspection FallThroughInSwitchStatementJS
  switch (this.scale) {
    case 'year':
      this.current.year(this.step * Math.floor(this.current.year() / this.step));
      this.current.month(0);
    case 'month':        this.current.date(1);
    case 'day':          // intentional fall through
    case 'weekday':      this.current.hours(0);
    case 'hour':         this.current.minutes(0);
    case 'minute':       this.current.seconds(0);
    case 'second':       this.current.milliseconds(0);
    //case 'millisecond': // nothing to do for milliseconds
  }

  if (this.step != 1) {
    // round down to the first minor value that is a multiple of the current step size
    switch (this.scale) {
      case 'millisecond':  this.current.subtract(this.current.milliseconds() % this.step, 'milliseconds');  break;
      case 'second':       this.current.subtract(this.current.seconds() % this.step, 'seconds'); break;
      case 'minute':       this.current.subtract(this.current.minutes() % this.step, 'minutes'); break;
      case 'hour':         this.current.subtract(this.current.hours() % this.step, 'hours'); break;
      case 'weekday':      // intentional fall through
      case 'day':          this.current.subtract((this.current.date() - 1) % this.step, 'day'); break;
      case 'month':        this.current.subtract(this.current.month() % this.step, 'month');  break;
      case 'year':         this.current.subtract(this.current.year() % this.step, 'year'); break;
      default: break;
    }
  }
};

/**
 * Check if the there is a next step
 * @return {boolean}  true if the current date has not passed the end date
 */
TimeStep.prototype.hasNext = function () {
  return (this.current.valueOf() <= this._end.valueOf());
};

/**
 * Do the next step
 */
TimeStep.prototype.next = function() {
  var prev = this.current.valueOf();

  // Two cases, needed to prevent issues with switching daylight savings
  // (end of March and end of October)
  if (this.current.month() < 6)   {
    switch (this.scale) {
      case 'millisecond':  this.current.add(this.step, 'millisecond'); break;
      case 'second':       this.current.add(this.step, 'second'); break;
      case 'minute':       this.current.add(this.step, 'minute'); break;
      case 'hour':
        this.current.add(this.step, 'hour');
        // in case of skipping an hour for daylight savings, adjust the hour again (else you get: 0h 5h 9h ... instead of 0h 4h 8h ...)
          // TODO: is this still needed now we use the function of moment.js?
        this.current.subtract(this.current.hours() % this.step, 'hour');
        break;
      case 'weekday':      // intentional fall through
      case 'day':          this.current.add(this.step, 'day'); break;
      case 'month':        this.current.add(this.step, 'month'); break;
      case 'year':         this.current.add(this.step, 'year'); break;
      default: break;
    }
  }
  else {
    switch (this.scale) {
      case 'millisecond':  this.current.add(this.step, 'millisecond'); break;
      case 'second':       this.current.add(this.step, 'second'); break;
      case 'minute':       this.current.add(this.step, 'minute'); break;
      case 'hour':         this.current.add(this.step, 'hour'); break;
      case 'weekday':      // intentional fall through
      case 'day':          this.current.add(this.step, 'day'); break;
      case 'month':        this.current.add(this.step, 'month'); break;
      case 'year':         this.current.add(this.step, 'year'); break;
      default:             break;
    }
  }

  if (this.step != 1) {
    // round down to the correct major value
    switch (this.scale) {
      case 'millisecond':  if(this.current.milliseconds() < this.step) this.current.milliseconds(0);  break;
      case 'second':       if(this.current.seconds() < this.step) this.current.seconds(0);  break;
      case 'minute':       if(this.current.minutes() < this.step) this.current.minutes(0);  break;
      case 'hour':         if(this.current.hours() < this.step) this.current.hours(0);  break;
      case 'weekday':      // intentional fall through
      case 'day':          if(this.current.date() < this.step+1) this.current.date(1); break;
      case 'month':        if(this.current.month() < this.step) this.current.month(0);  break;
      case 'year':         break; // nothing to do for year
      default:             break;
    }
  }

  // safety mechanism: if current time is still unchanged, move to the end
  if (this.current.valueOf() == prev) {
    this.current = this._end.clone();
  }

  DateUtil.stepOverHiddenDates(this.moment, this, prev);
};


/**
 * Get the current datetime
 * @return {Moment}  current The current date
 */
TimeStep.prototype.getCurrent = function() {
  return this.current;
};

/**
 * Set a custom scale. Autoscaling will be disabled.
 * For example setScale('minute', 5) will result
 * in minor steps of 5 minutes, and major steps of an hour.
 *
 * @param {{scale: string, step: number}} params
 *                               An object containing two properties:
 *                               - A string 'scale'. Choose from 'millisecond', 'second',
 *                                 'minute', 'hour', 'weekday', 'day', 'month', 'year'.
 *                               - A number 'step'. A step size, by default 1.
 *                                 Choose for example 1, 2, 5, or 10.
 */
TimeStep.prototype.setScale = function(params) {
  if (params && typeof params.scale == 'string') {
    this.scale = params.scale;
    this.step = params.step > 0 ? params.step : 1;
    this.autoScale = false;
  }
};

/**
 * Enable or disable autoscaling
 * @param {boolean} enable  If true, autoascaling is set true
 */
TimeStep.prototype.setAutoScale = function (enable) {
  this.autoScale = enable;
};


/**
 * Automatically determine the scale that bests fits the provided minimum step
 * @param {Number} [minimumStep]  The minimum step size in milliseconds
 */
TimeStep.prototype.setMinimumStep = function(minimumStep) {
  if (minimumStep == undefined) {
    return;
  }

  //var b = asc + ds;

  var stepYear       = (1000 * 60 * 60 * 24 * 30 * 12);
  var stepMonth      = (1000 * 60 * 60 * 24 * 30);
  var stepDay        = (1000 * 60 * 60 * 24);
  var stepHour       = (1000 * 60 * 60);
  var stepMinute     = (1000 * 60);
  var stepSecond     = (1000);
  var stepMillisecond= (1);

  // find the smallest step that is larger than the provided minimumStep
  if (stepYear*1000 > minimumStep)        {this.scale = 'year';        this.step = 1000;}
  if (stepYear*500 > minimumStep)         {this.scale = 'year';        this.step = 500;}
  if (stepYear*100 > minimumStep)         {this.scale = 'year';        this.step = 100;}
  if (stepYear*50 > minimumStep)          {this.scale = 'year';        this.step = 50;}
  if (stepYear*10 > minimumStep)          {this.scale = 'year';        this.step = 10;}
  if (stepYear*5 > minimumStep)           {this.scale = 'year';        this.step = 5;}
  if (stepYear > minimumStep)             {this.scale = 'year';        this.step = 1;}
  if (stepMonth*3 > minimumStep)          {this.scale = 'month';       this.step = 3;}
  if (stepMonth > minimumStep)            {this.scale = 'month';       this.step = 1;}
  if (stepDay*5 > minimumStep)            {this.scale = 'day';         this.step = 5;}
  if (stepDay*2 > minimumStep)            {this.scale = 'day';         this.step = 2;}
  if (stepDay > minimumStep)              {this.scale = 'day';         this.step = 1;}
  if (stepDay/2 > minimumStep)            {this.scale = 'weekday';     this.step = 1;}
  if (stepHour*4 > minimumStep)           {this.scale = 'hour';        this.step = 4;}
  if (stepHour > minimumStep)             {this.scale = 'hour';        this.step = 1;}
  if (stepMinute*15 > minimumStep)        {this.scale = 'minute';      this.step = 15;}
  if (stepMinute*10 > minimumStep)        {this.scale = 'minute';      this.step = 10;}
  if (stepMinute*5 > minimumStep)         {this.scale = 'minute';      this.step = 5;}
  if (stepMinute > minimumStep)           {this.scale = 'minute';      this.step = 1;}
  if (stepSecond*15 > minimumStep)        {this.scale = 'second';      this.step = 15;}
  if (stepSecond*10 > minimumStep)        {this.scale = 'second';      this.step = 10;}
  if (stepSecond*5 > minimumStep)         {this.scale = 'second';      this.step = 5;}
  if (stepSecond > minimumStep)           {this.scale = 'second';      this.step = 1;}
  if (stepMillisecond*200 > minimumStep)  {this.scale = 'millisecond'; this.step = 200;}
  if (stepMillisecond*100 > minimumStep)  {this.scale = 'millisecond'; this.step = 100;}
  if (stepMillisecond*50 > minimumStep)   {this.scale = 'millisecond'; this.step = 50;}
  if (stepMillisecond*10 > minimumStep)   {this.scale = 'millisecond'; this.step = 10;}
  if (stepMillisecond*5 > minimumStep)    {this.scale = 'millisecond'; this.step = 5;}
  if (stepMillisecond > minimumStep)      {this.scale = 'millisecond'; this.step = 1;}
};

/**
 * Snap a date to a rounded value.
 * The snap intervals are dependent on the current scale and step.
 * Static function
 * @param {Date} date    the date to be snapped.
 * @param {string} scale Current scale, can be 'millisecond', 'second',
 *                       'minute', 'hour', 'weekday, 'day', 'month', 'year'.
 * @param {number} step  Current step (1, 2, 4, 5, ...
 * @return {Date} snappedDate
 */
TimeStep.snap = function(date, scale, step) {
  var clone = moment(date);

  if (scale == 'year') {
    var year = clone.year() + Math.round(clone.month() / 12);
    clone.year(Math.round(year / step) * step);
    clone.month(0);
    clone.date(0);
    clone.hours(0);
    clone.minutes(0);
    clone.seconds(0);
    clone.milliseconds(0);
  }
  else if (scale == 'month') {
    if (clone.date() > 15) {
      clone.date(1);
      clone.add(1, 'month');
      // important: first set Date to 1, after that change the month.
    }
    else {
      clone.date(1);
    }

    clone.hours(0);
    clone.minutes(0);
    clone.seconds(0);
    clone.milliseconds(0);
  }
  else if (scale == 'day') {
    //noinspection FallthroughInSwitchStatementJS
    switch (step) {
      case 5:
      case 2:
        clone.hours(Math.round(clone.hours() / 24) * 24); break;
      default:
        clone.hours(Math.round(clone.hours() / 12) * 12); break;
    }
    clone.minutes(0);
    clone.seconds(0);
    clone.milliseconds(0);
  }
  else if (scale == 'weekday') {
    //noinspection FallthroughInSwitchStatementJS
    switch (step) {
      case 5:
      case 2:
        clone.hours(Math.round(clone.hours() / 12) * 12); break;
      default:
        clone.hours(Math.round(clone.hours() / 6) * 6); break;
    }
    clone.minutes(0);
    clone.seconds(0);
    clone.milliseconds(0);
  }
  else if (scale == 'hour') {
    switch (step) {
      case 4:
        clone.minutes(Math.round(clone.minutes() / 60) * 60); break;
      default:
        clone.minutes(Math.round(clone.minutes() / 30) * 30); break;
    }
    clone.seconds(0);
    clone.milliseconds(0);
  } else if (scale == 'minute') {
    //noinspection FallthroughInSwitchStatementJS
    switch (step) {
      case 15:
      case 10:
        clone.minutes(Math.round(clone.minutes() / 5) * 5);
        clone.seconds(0);
        break;
      case 5:
        clone.seconds(Math.round(clone.seconds() / 60) * 60); break;
      default:
        clone.seconds(Math.round(clone.seconds() / 30) * 30); break;
    }
    clone.milliseconds(0);
  }
  else if (scale == 'second') {
    //noinspection FallthroughInSwitchStatementJS
    switch (step) {
      case 15:
      case 10:
        clone.seconds(Math.round(clone.seconds() / 5) * 5);
        clone.milliseconds(0);
        break;
      case 5:
        clone.milliseconds(Math.round(clone.milliseconds() / 1000) * 1000); break;
      default:
        clone.milliseconds(Math.round(clone.milliseconds() / 500) * 500); break;
    }
  }
  else if (scale == 'millisecond') {
    var _step = step > 5 ? step / 2 : 1;
    clone.milliseconds(Math.round(clone.milliseconds() / _step) * _step);
  }
  
  return clone;
};

/**
 * Check if the current value is a major value (for example when the step
 * is DAY, a major value is each first day of the MONTH)
 * @return {boolean} true if current date is major, else false.
 */
TimeStep.prototype.isMajor = function() {
  if (this.switchedYear == true) {
    this.switchedYear = false;
    switch (this.scale) {
      case 'year':
      case 'month':
      case 'weekday':
      case 'day':
      case 'hour':
      case 'minute':
      case 'second':
      case 'millisecond':
        return true;
      default:
        return false;
    }
  }
  else if (this.switchedMonth == true) {
    this.switchedMonth = false;
    switch (this.scale) {
      case 'weekday':
      case 'day':
      case 'hour':
      case 'minute':
      case 'second':
      case 'millisecond':
        return true;
      default:
        return false;
    }
  }
  else if (this.switchedDay == true) {
    this.switchedDay = false;
    switch (this.scale) {
      case 'millisecond':
      case 'second':
      case 'minute':
      case 'hour':
        return true;
      default:
        return false;
    }
  }

  var date = this.moment(this.current);
  switch (this.scale) {
    case 'millisecond':
      return (date.milliseconds() == 0);
    case 'second':
      return (date.seconds() == 0);
    case 'minute':
      return (date.hours() == 0) && (date.minutes() == 0);
    case 'hour':
      return (date.hours() == 0);
    case 'weekday': // intentional fall through
    case 'day':
      return (date.date() == 1);
    case 'month':
      return (date.month() == 0);
    case 'year':
      return false;
    default:
      return false;
  }
};


/**
 * Returns formatted text for the minor axislabel, depending on the current
 * date and the scale. For example when scale is MINUTE, the current time is
 * formatted as "hh:mm".
 * @param {Date} [date] custom date. if not provided, current date is taken
 */
TimeStep.prototype.getLabelMinor = function(date) {
  if (date == undefined) {
    date = this.current;
  }

  var format = this.format.minorLabels[this.scale];
  return (format && format.length > 0) ? this.moment(date).format(format) : '';
};

/**
 * Returns formatted text for the major axis label, depending on the current
 * date and the scale. For example when scale is MINUTE, the major scale is
 * hours, and the hour will be formatted as "hh".
 * @param {Date} [date] custom date. if not provided, current date is taken
 */
TimeStep.prototype.getLabelMajor = function(date) {
  if (date == undefined) {
    date = this.current;
  }

  var format = this.format.majorLabels[this.scale];
  return (format && format.length > 0) ? this.moment(date).format(format) : '';
};

TimeStep.prototype.getClassName = function() {
  var _moment = this.moment;
  var m = this.moment(this.current);
  var current = m.locale ? m.locale('en') : m.lang('en'); // old versions of moment have .lang() function
  var step = this.step;

  function even(value) {
    return (value / step % 2 == 0) ? ' vis-even' : ' vis-odd';
  }

  function today(date) {
    if (date.isSame(new Date(), 'day')) {
      return ' vis-today';
    }
    if (date.isSame(_moment().add(1, 'day'), 'day')) {
      return ' vis-tomorrow';
    }
    if (date.isSame(_moment().add(-1, 'day'), 'day')) {
      return ' vis-yesterday';
    }
    return '';
  }

  function currentWeek(date) {
    return date.isSame(new Date(), 'week') ? ' vis-current-week' : '';
  }

  function currentMonth(date) {
    return date.isSame(new Date(), 'month') ? ' vis-current-month' : '';
  }

  function currentYear(date) {
    return date.isSame(new Date(), 'year') ? ' vis-current-year' : '';
  }

  switch (this.scale) {
    case 'millisecond':
      return even(current.milliseconds()).trim();

    case 'second':
      return even(current.seconds()).trim();

    case 'minute':
      return even(current.minutes()).trim();

    case 'hour':
      var hours = current.hours();
      if (this.step == 4) {
        hours = hours + '-h' + (hours + 4);
      }
      return 'vis-h' + hours + today(current) + even(current.hours());

    case 'weekday':
      return 'vis-' + current.format('dddd').toLowerCase() +
          today(current) + currentWeek(current) + even(current.date());

    case 'day':
      var day = current.date();
      var month = current.format('MMMM').toLowerCase();
      return 'vis-day' + day + ' vis-' + month + currentMonth(current) + even(day - 1);

    case 'month':
      return 'vis-' + current.format('MMMM').toLowerCase() +
          currentMonth(current) + even(current.month());

    case 'year':
      var year = current.year();
      return 'vis-year' + year + currentYear(current)+ even(year);

    default:
      return '';
  }
};

module.exports = TimeStep;
