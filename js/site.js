/* GLOBAL VARIABLES */
var ndx;


//console.log("Hello from site.js!");

var commas = d3.format(",");

var chart_lg_width, chart_lg_height;

var size = function(){
    chart_lg_width = $(".chart-lg").width();
    chart_lg_height = 600;

}

size();

//GET NUMBER function
function getNumber(string){
  return (isNaN(parseFloat(str))) ? 0 : parseFloat(str);
}

var csv, fullDateFormat, yearFormat, monthFormat, dayOfWeekFormat;

function getData(){

  d3.csv("data/maysbusiness_facebook_statuses.csv", function(error, data) {
    csv = data;

    //date format is Y-M-D hh:mm:ss, ex 2017-10-25 12:30:21
    fullDateFormat = d3.time.format('%Y-%m-%d %X');
    //console.log("Full Date Format: " + fullDateFormat);
    yearFormat = d3.time.format('%Y');
    monthFormat = d3.time.format('%b');
    dayOfWeekFormat = d3.time.format('%a')

    //console.log("before crunch data");
    crunchData();

  });

}

/* BEGIN CRUNCH DATA FUNCTION */
function crunchData(){

  console.log("inside crunchData");

  for(var i=0; i < csv.length; i++){

    //console.log("i = " + i + " type = " + type);
    var timePublished = fullDateFormat.parse(csv[i].status_published);
    //console.log(timePublished);
    csv[i].publishedYear = +yearFormat(timePublished);
    //console.log(csv[i].publishedYear = +yearFormat(timePublished));
    csv[i].publishedMonth = monthFormat(timePublished);
    csv[i].publishedDay = dayOfWeekFormat(timePublished);
    //console.log("inside for loop in getData!");
    var type = csv[i].status_type;
    var likes = csv[i].num_likes;
    var comments = csv[i].num_comments;
    var shares = csv[i].num_shares;

  }


  //crossfilter
  ndx = crossfilter(csv);


  // creating the dimensions (x-axis values)
  var yearDimension = ndx.dimension(function(d) {return d.publishedYear;} );
  var monthDimension = ndx.dimension(function(d) {return d.publishedMonth;} );
  var dayDimension = ndx.dimension(function(d) {return d.publishedDay;} );
  var typeDimension = ndx.dimension(function(d) {return d.status_type;} );
  var numLikesDimension = ndx.dimension(function(d) {return d.num_likes;} );
  var allDimension = ndx.dimension(function(d) {return d;} );
  console.log("Top 5 Daily Likes is: ");
  console.log(numLikesDimension.top(5));

  //console.log(yearDimension);
  /**
       likesDimension = cf.dimension(function(d) {return d["num_likes"];});
      commentsDimension = cf.dimension(function(d) {return d["num_comments"];});
      sharesDimension = cf.dimension(function(d) {return d["num_shares"];});
      allDimension = cf.dimension(function(d) {return d;});
**/

  //create groups (y-axis values)
  var all = ndx.groupAll();

  var yearCount = yearDimension.group().reduceCount();
  var monthCount = monthDimension.group().reduceCount();
  var dayCount = dayDimension.group().reduceCount();
  var typeCount = typeDimension.group().reduceCount();
  var likesCount = numLikesDimension.group().reduceCount();


  //specify the types of charts we want
  var yearChart = dc.pieChart('#year-ring-chart'),
      monthChart = dc.pieChart('#month-ring-chart'),
      dayChart = dc.pieChart('#day-ring-chart'),
      typeChart = dc.rowChart('#status-type-row-chart'),
      likesChart = dc.lineChart('#num-likes-line-graph');

  yearChart
    .width(150)
    .height(150)
    .dimension(yearDimension)
    .group(yearCount)
    .innerRadius(30);

  monthChart
    .width(150)
    .height(150)
    .dimension(monthDimension)
    .group(monthCount)
    .innerRadius(30)
    .ordering(function (d) {
      var order = {
        'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
        'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
        'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
      }
      return order[d.key];
    })

  dayChart
    .width(150)
    .height(150)
    .dimension(dayDimension)
    .group(dayCount)
    .innerRadius(30)
    .ordering(function (d) {
      var order = {
        'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3,
        'Fri': 4, 'Sat': 5, 'Sun': 6
      }
      return order[d.key];
    });

    typeChart
      .width(400)
      .height(400)
      .dimension(typeDimension)
      .group(typeCount)
      //.colors(['#500000'])
      .elasticX(true).xAxis().ticks(4);

    likesChart
      .width(990)
      .height(300)
      .renderArea(true)
      .dimension(numLikesDimension)
      .group(likesCount)
      .x(d3.time.scale().domain([new Date(2009,0,1), new Date(2017,8,30)]))
      //.round(d3.time.month.round)
      .xUnits(d3.time.months)
      .renderHorizontalGridLines(true)
      .elasticY(true);



  //dataCount
    //.dimension(ndx)
    //.group(all);


  //register handlers
  d3.selectAll('a#all').on('click', function () {
    dc.filterAll();
    dc.renderAll();
  });

  d3.selectAll('a#year').on('click', function () {
    yearChart.filterAll();
    dc.redrawAll();
  });

  d3.selectAll('a#month').on('click', function () {
    monthChart.filterAll();
    dc.redrawAll();
  });

  d3.selectAll('a#day').on('click', function () {
    dayChart.filterAll();
    dc.redrawAll();
  });

  d3.selectAll('a#type').on('click', function () {
    typeChart.filterAll();
    dc.redrawAll();
  });
  d3.selectAll('a#likes').on('click', function () {
    typeChart.filterAll();
    dc.redrawAll();
  });

  dc.renderAll();


}

getData();
