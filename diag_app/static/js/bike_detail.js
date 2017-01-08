function getCookie(name) {
   var cookieValue = null;
   if (document.cookie && document.cookie !== '') {
       var cookies = document.cookie.split(';');
       for (var i = 0; i < cookies.length; i++) {
           var cookie = jQuery.trim(cookies[i]);
           if (cookie.substring(0, name.length + 1) === (name + '=')) {
               cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
               break;
           }
       }
   }
   return cookieValue;
}


var csrftoken = getCookie('csrftoken');
function csrfSafeMethod(method) {
   return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});


// get current url
function currentURL(){
    var url = window.location.href
    showBike(url)

}
currentURL()


// get bike details
function showBike(url){
    var id = url.split('/')
    id = id[5]
    var url = '/api/models/' + id
    $.ajax({
        url: url,
        type: 'GET',
    }).done(function(results){
        var source = $("#bike-template").html()
        var template = Handlebars.compile(source)
        var html = template(results)
        $("#bikeSpecs").append(html)

    })
}


function loadProblemsBySystemForModel(id){
    var probId = id
    var modelId = $("#modelId").val()
    $.ajax({
        url: '/api/get-problems?system=' + probId + '&model=' + modelId,
        type: 'GET',
    }).done(function(results){
        var problems = results.results
        var source = $('#problem-template').html()
        var template = Handlebars.compile(source)
        var html = template(problems)
        $('#problems' + probId).empty()
        $('#problems' + probId).append(html)
    })
}


// load systems
function loadSystemModals(){
    $.ajax({
        url: '/api/systems/',
        type: 'GET',
    }).done(function(results){
        var systems = results.results
        console.log(systems)
        var source = $('#system-template').html()
        var template = Handlebars.compile(source)
        var html = template(systems)
        console.log(html)
        $('#system').append(html)
    })
}
loadSystemModals()


Handlebars.registerHelper('linkURL', function (object){
    id = Handlebars.Utils.escapeExpression(object.id)
    title = Handlebars.Utils.escapeExpression(object.title)
    url = '/diag_app/problem_detail/' + id
    console.log(url)
    return '<a href="' +  url + '">' + '<b>' + title + '</b>' + '</a>'
})


// modal functions
function loadBrandsAskModal(){
    $.ajax({
        url: '/api/brands/',
        type: 'GET',
    }).done(function(results){
        $('#brandSelect').empty()
        var source = $('#brand-modal-template').html()
        var template = Handlebars.compile(source)
        var html = template(results.results)
        $('#brandSelect').append(html)
        var brand =  $("#probBrand option:selected").val()
        loadYearsAskModal(brand)
    })

}

$("#ask").click(loadBrandsAskModal)


// year select step modal
function loadYearsAskModal(id){
    $.ajax({
        url: '/api/models?brand=' + id,
        type: 'GET'
    }).done(function(results){
        $('#yearSelect').empty()
        var bike = results.results
        var years = []

        for(var i=0; i < bike.length; i++){
            if (!(years.includes(bike[i].year))){
                years.push(bike[i].year)
            }
        }
        var source = $('#year-modal-template').html()
        var template = Handlebars.compile(source)
        var html = template(years)
        $('#yearSelect').append(html)
    })
}


// model step 3
function loadModelsAskModal(year){
    var brandId =  $("#probBrand option:selected").val()
    $.ajax({
        url: '/api/models?brand=' + brandId + '&year=' + year,
        type: 'GET'
    }).done(function(results){
        $('#modelSelect').empty()
        var bikes = results.results
        var source = $('#model-modal-template').html()
        var template = Handlebars.compile(source)
        var html = template(bikes)
        $('#modelSelect').append(html)
    })
}

// load systems modal
function loadSystemsAskModal(){
    $.ajax({
        url: '/api/systems/',
        type: 'GET',
    }).done(function(results){
        $('#systemSelect').empty()
        var systems = results.results
        var source = $('#system-modal-template').html()
        var template = Handlebars.compile(source)
        var html = template(systems)
        $('#systemSelect').append(html)
    })
}
$("#ask").click(loadSystemsAskModal)


// post new problem modal
function postProblem(){
    var bike =  $("#probModel option:selected").val()
    var sys =  $("#probSystem option:selected").val()
    var text = $("#probText").val()
    var user = $("#userId").val()
    var header = $("#probTitle").val()
    var context = {
        system: sys,
        description: text,
        tech: user,
        model: bike,
        title: header,
    }
    $.ajax({
        url: '/api/post-problems/',
        type: 'POST',
        data: context,
    }).done(function(results){
    })
}

$("#newProbSubmit").click(postProblem)
