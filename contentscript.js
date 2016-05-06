/*****************************************************************************
 * LinkedGlass                                                               *
 *                                                                           *
 * Purpose: Show a company's Glassdoor rating while searching LinkedIn jobs  *
 * Author: Nicholas Condo                                                    *
 * Date: 11/06/2015                                                          *
 *                                                                           *
 *****************************************************************************/


// Get user ip for glassdoor api requirements using ipinfo service
function getIP() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://ipinfo.io/ip", true);

  xhr.onreadystatechange = function() {
    if (xhr.status == 200) {
      var resp = xhr.responseText;
      if (resp != null) {
        userIP = resp;
      } else {
        userIP = randomIP();
      }
    } else {
      userIP = randomIP();
    }
  };
  xhr.send();
}

// generate a random ip in case ipinfo fails to return the client's ip
function randomIP() {
  return Math.floor((Math.random() * 256)) + "." + Math.floor((Math.random() * 256)) +
  "." + Math.floor((Math.random() * 256)) + "." + Math.floor((Math.random() * 256));
}

// Get the company's Glassdoor data for each request
function glassData(companyName) {
  // link to view company on Glassdoor if requests are throttled
  var link = "<a href='https://glassdoor.com/Reviews/index.htm' target='_blank'>" +
    "View " + companyName + " on Glassdoor</a>";
  // link to search on Glassdoor if requests aren't recognized (possible name mismatch)
  var searchLink = "<a href='https://glassdoor.com/Reviews/index.htm' target='_blank'>" +
    "Search for " + companyName + " on Glassdoor</a>";

  // store recent searches to reduce throttling by Glassdoor
  if (sessionStorage.getItem(companyName)) {
    var rating = sessionStorage.getItem(companyName);
    renderData(companyName, rating, link);
  } else {
    // construct the url to access Glassdoor api
    var url = "https://api.glassdoor.com/api/api.htm?v=1&format=json&t.p=47052" + 
       "&t.k=jx81AhIrSE7&action=employers&userip=" + userIP + "&useragent=" +
       navigator.userAgent + "&q=" + companyName;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    xhr.onreadystatechange = function() {
      if (xhr.status == 200) {
        var resp = JSON.parse(xhr.responseText || null);
        if (resp != null) {
          if (resp["success"] == true) {
            if (resp["response"].employers[0].overallRating) {
              var rating = resp["response"].employers[0].overallRating;
              renderData(companyName, rating, link);
              sessionStorage.setItem(companyName, rating);
            } else {
              var rating = "rating not found";
              renderData(companyName, rating, searchLink);
              sessionStorage.setItem(companyName, rating);
            }
            
          } else {
            var rating = "Requests throttled...";
            renderData(companyName, rating, link);
          }
        } else {
          var rating = "rating not found";
          renderData(companyName, rating, searchLink);
          sessionStorage.setItem(companyName, rating);
        }
      } else {
        var rating = "Could not connect to Glassdoor";
        renderData(companyName, rating, link);
      }
    };
    xhr.send();
  }
}

// append the extension's display to 'top-header' of LinkedIn page
function appendDisplay() {
  var display = document.createElement("div");
  display.innerHTML = "<div class='gd-display-wrapper'><div id='linked-glass'>" +
    "<center><p style='color: #7CB228;'>LinkedGlass</p><center></div></ br><div id='gd-info-label'>" +
    "<p>Company: <span id='gd-company-name'></span></p><p>Rating: " +
    "<span id='gd-company-rating'></span></p><p id='gd-company-link'></p></div>" +
    "</ br><div id='gd-logo'><a href='https://www.glassdoor.com/index.htm' target='_blank'>" +
    "powered by  <img id='gd-image' src='https://www.glassdoor.com/static/img/api/glassdoor_logo_80.png' " +
    "title='Job Search' /></a></div></div>";

  document.getElementById('header-banner').appendChild(display);
}

// show the Glassdoor data in the display
function renderData(companyName, rating, link) {
  document.getElementById('gd-company-name').textContent = companyName;
  document.getElementById('gd-company-rating').textContent = rating;
  document.getElementById('gd-company-link').innerHTML = link;
}

appendDisplay();
getIP();

// extract the company name from html to get glassdoor data
var getCompanyName = function() {
  var companySpan = this.getElementsByTagName("span");
  var companyName = companySpan[0].textContent;
  if (typeof(companyName) !== "undefined") {
    glassData(companyName);
  }
};

// get company name when mouse enters the div
var companyDivs = document.querySelectorAll(".company-name");
for (var i = 0; i < companyDivs.length; i++) {
  companyDivs[i].addEventListener("mouseenter", getCompanyName, false);
}
