$(document).ready(function() {

	var globals = {
		query: null,
		image: null,
		extract: null,
		title: null,
		keys: null,
		obj: null,
		categories: null,
		url: null
	};

	var elements = {
		$title: $("#showExcerpt > h2"),
		$image: $("#showExcerpt > img"),
		$extract: $("#showExcerpt > div")
	};

	var config = {
		baseUrl: "https://en.wikipedia.org/w/api.php",
		disambiguationRegex: new RegExp(".*disambiguation.*", "i"),
		noImage: "no_image.png",
		noExtract: "<p>No article found.</p>",
		$excerpt: $("#showExcerpt")
	};

	var reset = function() {
		for (var prop in globals) {
			globals[prop] = null;
		}
		for (var el in elements) {
			elements[el].empty();
		}
		elements.$image.attr("src", "");
	};

	var setDisambiguation = function(data) {
		var pages = data.query.pages;
		for (var obj in pages) {
			var title = pages[obj].title;
			var url = pages[obj].fullurl;
			config.$excerpt.fadeIn();
			var $link = $("<p>" + title + "</p>");
			$link.attr("data-url", url);
			$link.addClass("wikiLink");
			elements.$extract.append($link);
		}
		elements.$title.text(globals.query + " — Disambiguation");
	};

	var getDisambiguationPage = function() {
		$.ajax({
			url: config.baseUrl,
			dataType: "jsonp",
			data: {
				action: "query",
				origin: "*",
				format: "json",
				titles: globals.title,
				prop: "info",
				inprop: "url",
				generator: "links"
			}
		}).done(function(data) {
			setDisambiguation(data);
		});
	};

	var getExcerpt = function(input) {
		reset();
		globals.query = input;
		$.ajax({
			url: config.baseUrl,
			dataType: "jsonp",
			data: {
				action: "query",
				redirects: "resolve",
				origin: "*",
				format: "json",
				prop: "extracts|pageimages|categories|info",
				titles: input,
				exsentences: 3,
				piprop: "original",
				inprop: "url"
			}
		}).done(function(data) {
			checkExcerpt(data);
		});
	};

	var disambiguation = function() {
		for (var i = 0; i < globals.categories.length; i++) {
			if (globals.categories[i].title.match(config.disambiguationRegex)) {
				return true;
			}
		}
	};

	var getThumbnail = function() {
		if (!globals.obj.original.source) {
			globals.image = config.noImage;
		} else {
			globals.image = globals.obj.original.source;
		}
	};

	var getExtract = function() {
		if (globals.keys[0] === "-1") {
			globals.extract = config.noExtract;
		} else {
			globals.extract = globals.obj.extract;
		}
	};

	var getTitle = function() {
		globals.title = globals.obj.title;
	};

	var getUrl = function() {
		globals.url = globals.obj.fullurl;
	};

	var getCategories = function() {
		globals.categories = globals.obj.categories;
	};

	var setExcerpt = function(articleFound) {
		config.$excerpt.fadeIn();
		elements.$title.text(globals.title);
		elements.$image.attr("src", globals.image);
		elements.$extract.html(globals.extract);
		if (articleFound === "found") {
			var $linkToArticle = $("<p>");
			$linkToArticle.html("View <span class='bold'>" + globals.title + "</span> on Wikipedia");
			$linkToArticle.attr("data-url", globals.url);
			$linkToArticle.addClass("wikiLink");
			elements.$extract.append($linkToArticle);
		}
	};

	var checkExcerpt = function(data) {
		globals.keys = Object.keys(data.query.pages);
		globals.obj = data.query.pages[globals.keys[0]];
		getCategories();
		getThumbnail();
		getExtract();
		getTitle();
		getUrl();
		if (globals.categories === undefined) {
			setExcerpt("notFound");
		} else if (disambiguation()) {
			getDisambiguationPage();
		} else {
			setExcerpt("found");
		}
	};

	$("body").on("click", ".wikiLink", function(e) {
		chrome.tabs.create({
			url: $(this).data('url')
		});
		return false;
	});

	// Get the event page
	chrome.runtime.getBackgroundPage(function(eventPage) {
		// Call the getPageInfo function in the event page, passing in
		// our onPageDetailsReceived function as the callback. This injects
		// content.js into the current tab's HTML
		eventPage.getPageDetails(onPageDetailsReceived);
		// eventPage.onClickHandler(onPageDetailsReceived);
	});

	config.$excerpt.hide();

	var onPageDetailsReceived = function(pageDetails) {
		query = pageDetails.selection;
		if (query.length < 1) {
			config.$excerpt.fadeIn();
			elements.$title.text("Welcome to Clickpedia");
			elements.$extract.text("Select text in your browser before running the Clickipedia action to get an excerpt and (where available) an image of related content on Wikipedia.");
		} else {
			getExcerpt(query);
		}
	};


});
