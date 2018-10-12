$.getJSON("/articles", function (data) {
  for (let i = 0; i < data.length; i++) {
    $("#articles").append(`<p data-id='${data[i]._id}'>${data[i].title}<br />${data[i].link} </p>`);
    if (i===data.length-1 && i>0){
      $('.scrapeBtn').hide()
    }
  }
});

$(document).on('click', ".scrapeBtn", function (event) {
  location.href = `/scrape`;
})

$(document).on('click', ".deleteBtn", function (event) {
  const id = $(this).data().id;
  location.href = `/api/note/delete/${id}`;
})

$(document).on("click", "p", function () {
  $("#notes").empty();
  const thisId = $(this).attr("data-id");
  // console.log(`Data-id check ${thisId}`)
  $.ajax({
    method: "GET",
    url: `/articles/${thisId}`
  }).then(function (data) {
    console.log(data)
    $("#notes").append(`<h2>${data[0].title}</h2>`);
    $("#notes").append(`<input id='titleinput' name='title' >`);
    $("#notes").append(`<textarea id='bodyinput' name='body'></textarea>`);
    $("#notes").append(`<button data-id='${data[0]._id}' id='savenote'>Save Note</button>`);
    if (data[0].notes) {
      for (i = 0; i < data[0].notes.length; i++) {
        const articleNote = $('<div>').html(`<h3>${data[0].notes[i].title}</h3><p>${data[0].notes[i].body}</p><button class= "deleteBtn" data-id="${data[0].notes[i]._id}">Delete</button>`)

        $('#notes').append(articleNote)

      }
    }
  });
});

$(document).on("click", "#savenote", function () {
  const thisId = $(this).attr("data-id");
  console.log(`Current ${thisId}`)
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  }).then(function (data) {
    console.log(data);
    $("#notes").empty();
  });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});
