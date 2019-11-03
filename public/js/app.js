$(document).ready(function () {

  $('#tags').tagsInput({
    'height': '60px',
    'width': '280px'
  });

});

window.onscroll = function() {myFunction()};

var navbar = document.getElementById("trigger");

var sticky = navbar.offsetTop;

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("fixed")
  } else {
    navbar.classList.remove("fixed");
  }
}

var xhReq = new XMLHttpRequest();
xhReq.open(
  "GET",
  "https://discordapp.com/api/guilds/622160862605737990/widget.json",
  false
);
xhReq.send(null);
var discordjson = JSON.parse(xhReq.responseText);

if (discordjson != null) {
  function showMembersCount() {
    var membersCount = discordjson.members.length;

    var countElem = (document.getElementById("members-count").innerHTML =
      membersCount + "<span class='member-label'> Usuários Online<span>");
  }

  function showMembers() {
    discordjson.members.reverse().forEach(function(members) {
      var td = document.createElement("td");

      var span = document.createElement("span");
      span.innerHTML = members.username;

      var img = document.createElement("img");
      img.src = members.avatar_url;

      var table = document.getElementById("members-list");
      var row = table.insertRow(0);
      var td1 = row.insertCell(0);
      var td2 = row.insertCell(1);
      td1.className = "member-avatar";
      td2.className = "member-name";
      td1.appendChild(img);
      td2.appendChild(span);
    });
  }
}

setTimeout(function() {
    showMembersCount();
    showMembers();
}, 500);

/* workaround to display regular table instead of liquid table plugin  */
/* the plugin sets the regular table to display:none, this fixes it */
setTimeout(function() {
document.getElementById("members-list").style.display = "block";
}, 2000);