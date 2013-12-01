$(document).on("pageinit",function() {
	
	function strip_tags(input, allowed) {
	 allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
	    commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
	    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	  });
	}
	
	// Vars
	
	var initialTime = new Date().getTime();
	
	// Obj
	
	nativeDroid = {
		basic : {
			dateFormat : {
				language : {
					set : "en",
					type : "short",
					en : {
						dayShort : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
						dayLong : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
						monthShort : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
						monthLong : ["January","February","March","April","May","June","July","August","September","October","November","December"],
						order : function(day,dayStr,date,month,monthStr,year) {
							return dayStr+", "+monthStr+" "+date;
						}
					},
					de : {
						dayShort : ["So","Mo","Di","Mi","Do","Fr","Sa"],
						dayLong : ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
						monthShort : ["Jan","Feb","Mrz","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],
						monthLong : ["Januar","Februar","M&auml;rz","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
						order : function(day,dayStr,date,month,monthStr,year) {
							return dayStr+", "+date+". "+monthStr+" "+year;
						}
					}
				},
				getTodayString : function(day,date,month,year) {
					dfLang = nativeDroid.basic.dateFormat.language;
					type = dfLang.type;
					lang = dfLang.set;
					retStr = "--empty-string--";								
					if(type == "long") {
						dayStr = dfLang[lang].dayLong[day];
						monthStr = dfLang[lang].monthLong[month];								
					} else if(type == "short") {
						dayStr = dfLang[lang].dayShort[day];
						monthStr = dfLang[lang].monthShort[month];								
					}
					retStr = dfLang[lang].order(day,dayStr,date,month,monthStr,year);
					return retStr;
				},
				format : function(dateStr) {
					d = new Date(dateStr);
					return nativeDroid.basic.dateFormat.getTodayString(d.getDay(),d.getDate(),d.getMonth(),d.getFullYear());						
				}
			},
			touchEvent : function() {
				return ('ontouchstart' in document.documentElement) ? "touchstart" : "click";
			},
			disableScrollTop : function() {
				$(window).scrollTop(1);
				$(window).on("scroll",function() {
					if($(window).scrollTop() <= 0) {
						$(window).scrollTop(1);
					}
				});
			}
		},
		design : {
			animation : {
				delayedFadeIn : function() {
					obj = $(".delayedFadeIn");
					if(obj) {
						if(obj.length > 0) {
							delay = 2750;
							setTimeout(function() {
								$(".delayedFadeIn:last").fadeIn(1000).removeClass('delayedFadeIn');
								nativeDroid.design.animation.delayedFadeIn();
							},delay);
						}
					}
				}
			},
			progress : {
				loaded : false,
				ini : function() {
					$("body").prepend("<progress id='nativeDroidProgress' data-animation-time='5' value='0' max='100' class='nativeDroidProgress'></progress>");
					$(".ui-header").addClass("noborder");
					$(".nativeDroidProgress").attr("data-animation-time",0).attr("value",0);
					setTimeout(function() {
						nativeDroid.design.progress.createCSS($("body").data("nativedroid-progress-animation"));
						$(".nativeDroidProgress").attr("data-animation-time",5).attr("value",100);
					},300);
				},
				update : function(time) {
					roundedTime = (time % 5) >= 2.5 ? parseInt(time / 5) * 5 + 5 : parseInt(time / 5) * 5;
					nativeDroid.design.progress.createCSS(0);
					$(".nativeDroidProgress").attr("data-animation-time",0).attr("value",0);
					setTimeout(function() {
						$(".nativeDroidProgress").attr("data-animation-time",roundedTime);
						nativeDroid.design.progress.createCSS($(".nativeDroidProgress").attr("data-animation-time"));
						$(".nativeDroidProgress").attr("value",100);
					},300);
				},
				blink : function() {
					$(".nativeDroidProgress").fadeTo(500,0.5,function() {
						$(".nativeDroidProgress").fadeTo(500,1);
					});
				},
				createCSS : function(time) {
				    s = '.nativeDroidProgress::-webkit-progress-value { -webkit-transition: all ' + time + 's !important; }';
				    s += '.nativeDroidProgress::-moz-progress-bar { -moz-transition: all ' + time + 's !important; }';
					$("#progressLoadeStyle").remove();
					$("<style type='text/css' id='progressLoaderStyle'> "+s+" </style>").appendTo("head");
				}
			}
		},
		plugins : {
			cards : {
				ini : function(obj) {
					obj.addClass("nativeDroidCards");
					obj.find(" > li").each(function() {
						type = $(this).attr('data-cards-type');
						nativeDroid.plugins.cards.create[type]($(this));
					});
				},
				create : {
					text : function(obj) {
						console.log("text");
					},
					traffic : function(obj) {
						route = obj.data("cards-traffic-route");
						obj.find(".map").html("Display a route-map here [from: "+route.from+", to: "+route.to+"]");
						route.container = obj.find(".map").get(0);
						nativeDroid.api.helper.googlemaps.directions.getRoute(route);
					},
					weather : function(obj) {
						console.log("weather");
					},
					publictransport : function(obj) {
						console.log("publictransport");
					},
					sports : function(obj) {
						console.log("sports");
					}		
				}
			},
			twitter : {
				container : false,
				results : {
					count : 0,
					rpmin : 0,
					first : 0,
					last : 0,
					pendingResults : [],
					update : function(count) {

						nativeDroid.plugins.twitter.results.count += count;
						lastResult = new Date().getTime() / 1000;

						firstResult = nativeDroid.plugins.twitter.results.first;
						nativeDroid.plugins.twitter.results.first = (firstResult == 0) ? nativeDroid.plugins.twitter.results.last : firstResult;
						nativeDroid.plugins.twitter.results.last = lastResult;

						// Calc RPM
						results = nativeDroid.plugins.twitter.results.count;
						rpm = Math.round(results / ((lastResult - firstResult) / 60));						
						nativeDroid.plugins.twitter.results.rpmin = rpm;
						
						// Update Refresh Timer
						qd = nativeDroid.plugins.twitter.request.queryData;
						rpp = (qd.rpp) ? parseInt(qd.rpp) : 15;
						if(rpm > 0.5) {
							ad = ((rpp*0.8) / rpm) * 60000;
							if(ad > 10000 && ad < 120000) {
								nativeDroid.plugins.twitter.refresh.time = ad;
							}
						}
					}					
				},
				refresh : {
					url : false,
					time : false,
					auto_delay : 45000,
					load : function() {
						nativeDroid.design.progress.update(nativeDroid.plugins.twitter.refresh.time / 1000);
						if(nativeDroid.plugins.twitter.refresh.time > 10000 && nativeDroid.plugins.twitter.refresh.url) {
							nativeDroid.api.get("jsonp",nativeDroid.plugins.twitter.request.queryURL+nativeDroid.plugins.twitter.refresh.url,false,nativeDroid.plugins.twitter.append);
							setTimeout(nativeDroid.plugins.twitter.refresh.load,nativeDroid.plugins.twitter.refresh.time);
						} else {
							console.log("Refresh timer invalid or refresh URL not set.");
						}
						logDate = new Date();
					}
				},
				request : {
					search : {
						q : {
							"parameter" : "q",
							"required" : true,
							"value" : false
						},
						callback : {
							"parameter" : "callback",
							"required" : false,
							"value" : false
						},
						geocode : {
							"parameter" : "geocode",
							"required" : false,
							"value" : false
						},
						lang : {
							"parameter" : "lang",
							"required" : false,
							"value" : false
						},
						locale : {
							"parameter" : "locale",
							"required" : false,
							"value" : false
						},
						page : {
							"parameter" : "page",
							"required" : false,
							"value" : false
						},
						result_type : {
							"parameter" : "result_type",
							"required" : false,
							"value" : false
						},
						rpp : {
							"parameter" : "rpp",
							"required" : false,
							"value" : false
						},
						show_user : {
							"parameter" : "show_user",
							"required" : false,
							"value" : false
						},
						until : {
							"parameter" : "until",
							"required" : false,
							"value" : false
						},
						since_id : {
							"parameter" : "since_id",
							"required" : false,
							"value" : false
						},
						max_id : {
							"parameter" : "max_id",
							"required" : false,
							"value" : false
						},
						include_entities : {
							"parameter" : "include_entities",
							"required" : false,
							"value" : false
						},
					},
					queryURL : false,
					queryData : false,
					prepareQuery : function() {
						obj = nativeDroid.plugins.twitter.container;
						nativeDroid.plugins.twitter.request.queryData = obj.data('nativedroid-twitter-get');
					}
				},
				ini : function(obj) { 
					nativeDroid.plugins.twitter.container = obj;
					t = obj.attr('data-nativedroid-twitter-type');
					nativeDroid.plugins.twitter.load(t);
					
					// Power up the scrollbar:
					if(nativeDroid.plugins.twitter.container.attr('data-nativedroid-twitter-refresh') != "false") {
						nativeDroid.design.progress.ini();	
					}
					
					// Init refresh
					refreshTime = nativeDroid.plugins.twitter.container.attr('data-nativedroid-twitter-refresh');
					if(refreshTime && refreshTime != "false") {
						nativeDroid.plugins.twitter.refresh.time = (refreshTime != "auto") ? parseInt(refreshTime) : nativeDroid.plugins.twitter.refresh.auto_delay;
						setTimeout(nativeDroid.plugins.twitter.refresh.load,parseInt(nativeDroid.plugins.twitter.refresh.time));
					}
				},
				apiUrl : {
					search : "http://search.twitter.com/search.json"
				},
				load : function(type) {
					nativeDroid.plugins.twitter.request.prepareQuery();
					nativeDroid.plugins.twitter.request.queryURL = this.apiUrl[type];
					nativeDroid.api.get("jsonp",this.request.queryURL,this.request.queryData,this.append);
					nativeDroid.plugins.twitter.populate();
				},
				populate : function() {
					setInterval(function() {
						p = nativeDroid.plugins.twitter.results.pendingResults;
						if(p && p.length > 0) {
							nativeDroid.design.progress.blink();
							nativeDroid.plugins.twitter.container.prepend(p[0]);
							nativeDroid.plugins.twitter.results.pendingResults.splice(0,1);
						    $('.ui-page-active .ui-listview').listview('refresh');
						}					
					},3000);
				},
				append : function(data) {
					if(data) {
						nativeDroid.plugins.twitter.refresh.url = (data.refresh_url) ? data.refresh_url : nativeDroid.plugins.twitter.refresh.url;
						data = (data.results) ? data.results : data;

						anz = data.length;
						// Update Result Count
	    				nativeDroid.plugins.twitter.results.update(anz);

						if(anz > 0) {
							for(i = 0; i < anz;i++) {
								entity = data[i];
								html = "";
								html += "<li>";
										html += "<img src='"+entity.profile_image_url+"'>";
										html += "<h2><a href='http://www.twitter.com/"+entity.from_user+"' data-ajax='false' target='_blank'>"+entity.from_user_name+"</a></h2>";
										html += "<p>"+entity.text+"</p>";
//										html += "<p class='ui-li-aside ui-li-desc'>"+nativeDroid.basic.dateFormat.format(entity.created_at)+"</p>";
								html += "</li>";
								toTimer = i * 1000;
								nativeDroid.plugins.twitter.results.pendingResults.splice(0,0,html);								
							}
						}
					}

				}
			},
			flickr : {
				container : false,
				apiKey : false,
				dragStarted : false,
				dragStartX : 0,
				lastSwipe : false,
				request : {
					queryData : false,
					apiUrl : "http://api.flickr.com/services/rest/?method=flickr.",
					requestUrl : false,
					cat : false,
					method : false,
					parameter : false,
					prepareQuery : function() {
						obj = nativeDroid.plugins.flickr.container;
						cat = obj.data("nativedroid-flickr-cat");
						method = obj.data("nativedroid-flickr-method");
						apikey = obj.data("nativedroid-flickr-apikey");
						parameter = obj.data("nativedroid-flickr-parameter");

						nativeDroid.plugins.flickr.request.cat = cat;
						nativeDroid.plugins.flickr.request.method = method;
						nativeDroid.plugins.flickr.request.parameter = parameter;

						nativeDroid.plugins.flickr.request.requestUrl = nativeDroid.plugins.flickr.request.apiUrl+cat+"."+method+"&api_key="+apikey+"&nojsoncallback=1&format=json&"+parameter;
					}
				},
				bindEvents : function() {
					$(".ui-page").on("click",".nativeDroidGallery li:not('.active')",function() {

						lastSwipe = nativeDroid.plugins.flickr.lastSwipe;
						nativeDroid.plugins.flickr.dragStarted = false;

						orig = $(this);
						$(".overlay").show();
						
						if(!lastSwipe) {
							$(this).addClass("active");
						} else if(lastSwipe == "left") {
							$(this).addClass("active").addClass("noTransition").addClass("slideRight");
							setTimeout(function() {
								orig.removeClass("noTransition").removeClass("slideRight");
							},1);
						} else if(lastSwipe == "right") {
							$(this).addClass("active").addClass("noTransition").addClass("slideLeft");
							setTimeout(function() {
								orig.removeClass("noTransition").removeClass("slideLeft");
							},1);
						}

						
						$(this).css({
							"background-image" : "url('"+$(this).data("image-thumb")+"')"
						});
						
						$(this).css({
							"background-image" : "url('"+$(this).data("image-large")+"')"
						});

					}).on("mousedown touchstart",".nativeDroidGallery li.active .closeTrigger",function() {
						$(this).parent().removeClass("active");
						$(".overlay").hide();
					}).on("swipeleft",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						e.preventDefault();
						var orig = $(this);
						orig.addClass("slideLeft");
						setTimeout(function() {
							orig.removeClass("active").css({"left":"auto"}).removeClass("slideLeft").removeClass("slideRight");
						},500);
						next = $(this).next("li");
						if(next.length == 1) {
							nativeDroid.plugins.flickr.lastSwipe = "left";
							next.trigger("click");
						} else {
							nativeDroid.plugins.flickr.lastSwipe = false;
							$(".overlay").hide();
						}

						// Re-Apply thumbnail

						thumb = orig.data("image-thumb");
						$(this).css({
							"background-image" : "url('"+thumb+"')"
						});

					}).on("swiperight",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						e.preventDefault();

						var orig = $(this);

						orig.addClass("slideRight");
						setTimeout(function() {
							orig.removeClass("active").css({"left":"auto"}).removeClass("slideLeft").removeClass("slideRight");
						},500);
						prev = $(this).prev("li");
						if(prev.length == 1) {
							nativeDroid.plugins.flickr.lastSwipe = "right";
							prev.trigger("click");
						} else {
							nativeDroid.plugins.flickr.lastSwipe = false;
							$(".overlay").hide();
						}
						
						// Re-Apply thumbnail

						thumb = orig.data("image-thumb");
						$(this).css({
							"background-image" : "url('"+thumb+"')"
						});
						
					}).on("mousedown touchstart",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						nativeDroid.plugins.flickr.dragStartX = (e.type == "touchstart") ? e.originalEvent.touches[0].screenX : e.screenX;
						nativeDroid.plugins.flickr.dragStarted = true;
						$(this).addClass("noTransition");
					}).on("mouseup touchend",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						$(this).removeClass("noTransition").css({"left":"auto"});
						nativeDroid.plugins.flickr.dragStarted = false;
					}).on("mousemove touchmove",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						e.preventDefault();
						mousedown = nativeDroid.plugins.flickr.dragStarted;
						if(mousedown) {
							distance = (e.type == "touchmove") ? parseInt(e.originalEvent.touches[0].screenX) - parseInt(nativeDroid.plugins.flickr.dragStartX) : e.screenX - nativeDroid.plugins.flickr.dragStartX;
							if(distance > 30 || distance < -30) {
								$(this).css("left",distance+"px");
							}
						}
					}).on("click",".nativeDroidGallerySetList li a",function(e) {
						e.preventDefault();
						setId = $(this).data("photoset-id");
						
						if(setId && !isNaN(setId)) {
							nativeDroid.plugins.flickr.request.cat = "photosets";
							nativeDroid.plugins.flickr.request.method = "getPhotos";
							reqUrl = nativeDroid.plugins.flickr.request.apiUrl+"photosets.getPhotos&api_key="+nativeDroid.plugins.flickr.apiKey+"&photoset_id="+setId+"&nojsoncallback=1&format=json&extras=description,date_upload,geo,views,url_sq,url_l,url_t";
							$("div[data-role='header'] h1").text($(this).text());
							cLink = $("div[data-role='header'] a.ui-btn:first").attr("href");
							$("div[data-role='header'] a.ui-btn:first").attr("href",cLink+"#flickr-back-to-setlist");
							
							new nativeDroid.api.get("json",reqUrl,false,nativeDroid.plugins.flickr.parseData);
						} else {
							console.log("SetId is not a Number");
						}
					});

					$("div[data-role='header']").on("click","a[href$='flickr-back-to-setlist']",function(e) {
						e.preventDefault();
						$("div[data-role='header'] h1").text(document.title);
						href = $(this).attr('href');
						hrefArr = href.split("#flickr-back-to-setlist");
						$("div[data-role='header'] a.ui-btn:first").attr("href",hrefArr[0]);
						$(".nativeDroidGallerySet").remove();
						$(".nativeDroidGallerySetList").removeClass("slideLeft");
					});

				},
				ini : function(obj) {
					nativeDroid.plugins.flickr.container = obj;
					nativeDroid.plugins.flickr.apiKey = obj.data("nativedroid-flickr-apikey");
					new nativeDroid.plugins.flickr.load();
					nativeDroid.plugins.flickr.bindEvents();
				},
				load : function() {
					nativeDroid.plugins.flickr.request.prepareQuery();
					new nativeDroid.api.get("json",nativeDroid.plugins.flickr.request.requestUrl,nativeDroid.plugins.flickr.request.queryData,nativeDroid.plugins.flickr.parseData);
				},
				delayedAppend : function(cont,html,time) {
					setTimeout(function() {
						cont.append(html);
					},time);
				},
				parseByType : {
					photos : {
						search : function(data)	{
							
							nativeDroid.plugins.flickr.container.addClass("nativeDroidGallery");
							nativeDroid.plugins.flickr.container.append("<div class='overlay'></div>");
							
							if(data.photos) {
								var cont = nativeDroid.plugins.flickr.container;
								for(i = 0;i<data.photos.photo.length;i++) {
									p = data.photos.photo[i];
									html = "<li style='background-image:url(\""+p.url_t+"\")' data-image-large='"+p.url_l+"' data-image-thumb='"+p.url_t+"'><div class='closeTrigger'><i class='icon-remove'></i> close</div><span>"+p.title+"</span></li>";
									nativeDroid.plugins.flickr.delayedAppend(cont,html,i*50);
								}
							}
						}
					},
					photosets : {
						getList : function(data) {
							nativeDroid.plugins.flickr.container.addClass("nativeDroidGallerySetList");
							if(data.photosets) {
								html = "";
								var cont = nativeDroid.plugins.flickr.container;
								for(i = 0;i<data.photosets.photoset.length;i++) {
									set = data.photosets.photoset[i];
									html += "<li class='flickrGalleryLoad'><a href='#load-photoset-flickr-"+set.id+"' data-photoset-id='"+set.id+"' data-ajax='false'>"+set.title._content+"</a></li>";
								}
								cont.append(html);
							    $('.ui-page-active .ui-listview').listview('refresh');
							}
						},
						getPhotos : function(data) {
							$(".nativeDroidGallerySetList").addClass("slideLeft");
							if(data.photoset) {
								var html = "";
								html += "<div class='nativeDroidGallerySet'><ul class='nativeDroidGallery'>";
								for(i = 0;i<data.photoset.photo.length;i++) {
									p = data.photoset.photo[i];
									html += "<li style='background-image:url(\""+p.url_t+"\")' data-image-large='"+p.url_l+"' data-image-thumb='"+p.url_t+"'><div class='closeTrigger'><i class='icon-remove'></i> close</div><span>"+p.title+"</span></li>";
								}
								html += "<div class='overlay'></div></ul></div>";
								$(".nativeDroidGallerySet").remove();
								$(".nativeDroidGallerySetList").after(html);
							}
						}
					}
				},
				parseData : function(ret) {
					if(ret) {
						if(ret.stat == "ok") {
							
							cat = nativeDroid.plugins.flickr.request.cat;
							method = nativeDroid.plugins.flickr.request.method;
							if(typeof nativeDroid.plugins.flickr.parseByType[cat] != "undefined") {
								if(typeof nativeDroid.plugins.flickr.parseByType[cat][method] != "undefined") {
									new nativeDroid.plugins.flickr.parseByType[cat][method](ret);
								} else {
									console.log("There no data parser for "+cat+"."+method);
								}
							} else {
								console.log("There no data parser for "+cat+"."+method);
							}
						} else {
							console.log("There is an error. Code: "+ret.stat);
						}
					} else {
						console.log("No data received. Check your request.");
					}
				}
			},
			gallery : {
				lastSwipe : false,
				dragStarted : false,
				dragStartX : 0,
				bindEvents : function() {
					$(".ui-page").on("click",".nativeDroidGallery li:not('.active')",function() {

						lastSwipe = nativeDroid.plugins.gallery.lastSwipe;
						nativeDroid.plugins.gallery.dragStarted = false;

						orig = $(this);
						$(".overlay").show();
						
						if(!lastSwipe) {
							$(this).addClass("active");
						} else if(lastSwipe == "left") {
							$(this).addClass("active").addClass("noTransition").addClass("slideRight");
							setTimeout(function() {
								orig.removeClass("noTransition").removeClass("slideRight");
							},1);
						} else if(lastSwipe == "right") {
							$(this).addClass("active").addClass("noTransition").addClass("slideLeft");
							setTimeout(function() {
								orig.removeClass("noTransition").removeClass("slideLeft");
							},1);
						}

						$(this).css({
							"background-image" : "url('"+$(this).data("image-thumb")+"')"
						});
						
						$(this).css({
							"background-image" : "url('"+$(this).data("image-large")+"')"
						});

					}).on("mousedown touchstart",".nativeDroidGallery li.active .closeTrigger",function() {
						$(this).parent().removeClass("active");
						$(".overlay").hide();
					}).on("swipeleft",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						e.preventDefault();
						var orig = $(this);
						orig.addClass("slideLeft");
						setTimeout(function() {
							orig.removeClass("active").css({"left":"auto"}).removeClass("slideLeft").removeClass("slideRight");
						},500);
						next = $(this).next("li");
						if(next.length == 1) {
							nativeDroid.plugins.gallery.lastSwipe = "left";
							next.trigger("click");
						} else {
							nativeDroid.plugins.gallery.lastSwipe = false;
							$(".overlay").hide();
						}

						// Re-Apply thumbnail

						thumb = orig.data("image-thumb");
						$(this).css({
							"background-image" : "url('"+thumb+"')"
						});

					}).on("swiperight",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						e.preventDefault();

						var orig = $(this);

						orig.addClass("slideRight");
						setTimeout(function() {
							orig.removeClass("active").css({"left":"auto"}).removeClass("slideLeft").removeClass("slideRight");
						},500);
						prev = $(this).prev("li");
						if(prev.length == 1) {
							nativeDroid.plugins.gallery.lastSwipe = "right";
							prev.trigger("click");
						} else {
							nativeDroid.plugins.gallery.lastSwipe = false;
							$(".overlay").hide();
						}
						
						// Re-Apply thumbnail

						thumb = orig.data("image-thumb");
						$(this).css({
							"background-image" : "url('"+thumb+"')"
						});
						
					}).on("mousedown touchstart",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						nativeDroid.plugins.gallery.dragStartX = (e.type == "touchstart") ? e.originalEvent.touches[0].screenX : e.screenX;
						nativeDroid.plugins.gallery.dragStarted = true;
						$(this).addClass("noTransition");
					}).on("mouseup touchend",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						$(this).removeClass("noTransition").css({"left":"auto"});
						nativeDroid.plugins.gallery.dragStarted = false;
					}).on("mousemove touchmove",".nativeDroidGallery li.active:not('.zoom')",function(e) {
						e.preventDefault();
						mousedown = nativeDroid.plugins.gallery.dragStarted;
						if(mousedown) {
							distance = (e.type == "touchmove") ? parseInt(e.originalEvent.touches[0].screenX) - parseInt(nativeDroid.plugins.gallery.dragStartX) : e.screenX - nativeDroid.plugins.gallery.dragStartX;
							if(distance > 30 || distance < -30) {
								$(this).css("left",distance+"px");
							}
						}
					});
				},
				ini : function(obj) {
					obj.addClass("nativeDroidGallery");
					nativeDroid.plugins.gallery.bindEvents();					
				}
			},
			splashscreen : {
				container : false,
				background : false,
				time : 3,
				animation : false,
				bindEvents : function() {
					// No events yet
				},
				create : function() {
					var obj = nativeDroid.plugins.splashscreen.container;
					var bg = nativeDroid.plugins.splashscreen.background;
					var animation = nativeDroid.plugins.splashscreen.animation;
					if(bg) {
						obj.addClass("nativeDroidSplashscreen").css({
							"background-image" : "url('"+bg+"')"
						});
						delay = nativeDroid.plugins.splashscreen.time * 1000;
						setTimeout(function() {
							if(animation) {
								obj.addClass(animation);
							}
							setTimeout(function() {
								obj.remove();
							},500);
						},delay);
					}					
				},
				ini : function(obj) {
					nativeDroid.plugins.splashscreen.container = obj;
					nativeDroid.plugins.splashscreen.time = parseInt(obj.data("nativedroid-splashscreen-time"));
					nativeDroid.plugins.splashscreen.background = obj.data("nativedroid-background");
					nativeDroid.plugins.splashscreen.animation = obj.data("nativedroid-splashscreen-animation");
					nativeDroid.plugins.splashscreen.create();
				}
			},
			lockscreen : {
				container : false,
				background : false,
				delay : 25,
				display : false,
				lastactivity : initialTime,
				animation : "fadeOut",
				bindEvents : function() {
					$(".ui-page").on("click",".nativeDroidLockscreen .unlock",function() {
						nativeDroid.plugins.lockscreen.close();
					}).on("touchstart touchend touchmove mousemove click tap",function() {
						nativeDroid.plugins.lockscreen.lastactivity = new Date().getTime();
					});
					nativeDroid.plugins.lockscreen.startCheckInactivity();
				},
				startCheckInactivity : function() {
					delay = nativeDroid.plugins.lockscreen.delay * 1000;
					setTimeout(function() {
						setTimeout(function() {
							nativeDroid.plugins.lockscreen.checkInactivity();
						},delay);
					});
				},
				checkInactivity : function() {
					display = nativeDroid.plugins.lockscreen.display;
					activity = nativeDroid.plugins.lockscreen.lastactivity;
					delay = nativeDroid.plugins.lockscreen.delay * 1000;
					now = new Date().getTime();
					if(!display && (delay < (now - activity))) {
						nativeDroid.plugins.lockscreen.open();
					} else {
						// Calculate next check
						nextCheck = delay - (now - activity);
						setTimeout(function() {
							nativeDroid.plugins.lockscreen.checkInactivity();
						},nextCheck);
					}
				},
				open : function() {
					nativeDroid.plugins.lockscreen.container.fadeIn(500);
					nativeDroid.plugins.lockscreen.display = true;
				},
				close : function() {
					nativeDroid.plugins.lockscreen.container.fadeOut(500);
					nativeDroid.plugins.lockscreen.display = false;
					nativeDroid.plugins.lockscreen.startCheckInactivity();
				},
				create : function() {
					nativeDroid.plugins.lockscreen.bindEvents();
					var obj = nativeDroid.plugins.lockscreen.container;
					var bg = nativeDroid.plugins.lockscreen.background;
					var animation = nativeDroid.plugins.lockscreen.animation;
					if(bg) {
						obj.addClass("nativeDroidLockscreen").css({
							"background-image" : "url('"+bg+"')"
						});
					}
				},
				ini : function(obj) {
					nativeDroid.plugins.lockscreen.container = obj;
					nativeDroid.plugins.lockscreen.delay = parseInt(obj.data("nativedroid-lockscreen-delay"));
					nativeDroid.plugins.lockscreen.background = obj.data("nativedroid-background");
					nativeDroid.plugins.lockscreen.animation = obj.data("nativedroid-lockscreen-animation");
					nativeDroid.plugins.lockscreen.create();
				}
			},
			homescreen : {
				container : false,
				background : false,
				currentslide : 1,
				dragStartX : 0,
				dragStated : false,
				slides : false,
				bindEvents : function() {
					$(".ui-page").on("swipeleft swiperight","div[data-nativedroid-role='screenslide']",function(e) {
						direction = e.type;
						e.preventDefault();
						slides = nativeDroid.plugins.homescreen.slides;
						thisIdx = parseInt($(this).data("nativedroid-screenslide-idx"));
						nextIdx = thisIdx + 1;
						prevIdx = thisIdx - 1;
						nextIdx = (nextIdx > slides) ? 1 : nextIdx;
						prevIdx = (prevIdx < 1) ? slides : prevIdx;
						if(slides > 1) {
							if(direction == "swiperight") {
								nativeDroid.plugins.homescreen.slide(thisIdx,prevIdx,direction);
							} else {
								nativeDroid.plugins.homescreen.slide(thisIdx,nextIdx,direction);
							}											
						}
					}).on("mousedown touchstart",".nativeDroidHomescreen",function(e) {
						nativeDroid.plugins.homescreen.dragStartX = (e.type == "touchstart") ? e.originalEvent.touches[0].screenX : e.screenX;
						nativeDroid.plugins.homescreen.dragStarted = true;
						homeScreenSlideObj = $(".nativeDroidHomescreen div[data-nativedroid-screenslide-idx='"+nativeDroid.plugins.homescreen.currentslide+"']");
						homeScreenSlideObj.addClass("noTransition");
					}).on("mouseup touchend",".nativeDroidHomescreen",function(e) {
						homeScreenSlideObj = $(".nativeDroidHomescreen div[data-nativedroid-screenslide-idx='"+nativeDroid.plugins.homescreen.currentslide+"']");
						homeScreenSlideObj.removeAttr('style').removeClass("noTransition");
						nativeDroid.plugins.homescreen.dragStarted = false;
					}).on("mousemove touchmove",".nativeDroidHomescreen",function(e) {
						mousedown = nativeDroid.plugins.homescreen.dragStarted;
						e.preventDefault();
						if(mousedown) {
							distance = (e.type == "touchmove") ? parseInt(e.originalEvent.touches[0].screenX) - parseInt(nativeDroid.plugins.homescreen.dragStartX) : e.screenX - nativeDroid.plugins.homescreen.dragStartX;
							if(distance > 30 || distance < -30) {
								homeScreenSlideObj = $(".nativeDroidHomescreen div[data-nativedroid-screenslide-idx='"+nativeDroid.plugins.homescreen.currentslide+"']");
								homeScreenSlideObj.css("left",distance+"px");
							}
						}
					});
					$("body,.ui-page,.ui-body,.ui-content").css({
						"overflow" : "hidden"
					});
				},
				slide : function(from,to,direction) {
					newClassFrom = (direction == "swipeleft") ? "left" : "right";
					$(".nativeDroidHomescreen div[data-nativedroid-screenslide-idx='"+from+"']").removeClass("left").removeClass("right").addClass(newClassFrom);
					
					var tmpClassTo = (direction == "swipeleft") ? "rightNoTransition" : "leftNoTransition";
					var toObj = $(".nativeDroidHomescreen div[data-nativedroid-screenslide-idx='"+to+"']");
					toObj.addClass(tmpClassTo).removeClass("left").removeClass("right");
					setTimeout(function() {
						toObj.removeClass(tmpClassTo);
						nativeDroid.plugins.homescreen.currentslide = to;
						nativeDroid.plugins.homescreen.updateSlideIndicators();
					},50);
				},
				create : function() {
					obj = nativeDroid.plugins.homescreen.container;
					obj.addClass("nativeDroidHomescreen");
					bg = nativeDroid.plugins.homescreen.background;
					if(bg) {
						obj.css({
							"background-image" : "url('"+bg+"')"
						});
					}
					i = 1;
					obj.find("[data-nativedroid-role='screenslide']").each(function() {
						$(this).attr("data-nativedroid-screenslide-idx",i);
						if(i > 1) {
							$(this).addClass("right");/*.attr("draggable",true);*/
						}
						i++;						
					});
					nativeDroid.plugins.homescreen.slides = i - 1;
					nativeDroid.plugins.homescreen.createSlideIndicators();
					nativeDroid.plugins.homescreen.createWidgets();
					nativeDroid.plugins.homescreen.bindEvents();
				},
				createSlideIndicators : function() {
					total = nativeDroid.plugins.homescreen.slides;
					current = nativeDroid.plugins.homescreen.currentslide;
					if(total > 1) {
						html = "<div class='nativeDroidScreenSlideIndicators'>";
						for(i = 1; i <= total; i++) {
							currentClass = (i == current) ? " active" : "";
							html += "<div class='blobs"+currentClass+"' data-nativedroid-screenslide-indicator='"+i+"'></div>";
						}
						html += "</div>";
						nativeDroid.plugins.homescreen.container.append(html);
					}
				},
				updateSlideIndicators : function() {
					current = nativeDroid.plugins.homescreen.currentslide;
					$(".nativeDroidScreenSlideIndicators .blobs").removeClass("active");
					$(".nativeDroidScreenSlideIndicators .blobs[data-nativedroid-screenslide-indicator='"+current+"']").addClass("active")
				},
				createWidgets : function() {
					widgetsObj = nativeDroid.plugins.homescreen.container.find("[data-nativedroid-role='widget']");
					widgetsObj.addClass("nativeDroidHomescreenWidget");
					widgetsObj.each(function() {
						type = $(this).data("nativedroid-widget-type");
							if(type && nativeDroid.plugins.homescreen.widget[type]) {
								new nativeDroid.plugins.homescreen.widget[type].ini($(this));
							} else if(type) {
								console.log(type+" - is not a valid nativeDroid homescreen widget.")
							}
						});
				},
				widget : {
					clock : {
						container : false,
						currentMin : 0,
						language : {
							set : "en",
							type : "short",
							en : {
								dayShort : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
								dayLong : ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
								monthShort : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
								monthLong : ["January","February","March","April","May","June","July","August","September","October","November","December"],
								order : function(day,dayStr,date,month,monthStr,year) {
									return dayStr+", "+monthStr+" "+date;
								}
							},
							de : {
								dayShort : ["So","Mo","Di","Mi","Do","Fr","Sa"],
								dayLong : ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
								monthShort : ["Jan","Feb","Mrz","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],
								monthLong : ["Januar","Februar","M&auml;rz","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
								order : function(day,dayStr,date,month,monthStr,year) {
									return dayStr+", "+date+". "+monthStr+" "+year;
								}
							}
						},
						getTodayString : function(day,date,month,year) {
							cLang = nativeDroid.plugins.homescreen.widget.clock.language;
							type = cLang.type;
							lang = cLang.set;
							retStr = "--empty-string--";								
							if(type == "long") {
								dayStr = cLang[lang].dayLong[day];
								monthStr = cLang[lang].monthLong[month];								
							} else if(type == "short") {
								dayStr = cLang[lang].dayShort[day];
								monthStr = cLang[lang].monthShort[month];								
							}
							retStr = cLang[lang].order(day,dayStr,date,month,monthStr,year);
							return retStr;
						},
						getClockHTML : function() {
							html = "<div class='ClockTime'>";
								d = new Date();
								hours = (d.getHours() < 10) ? "0"+d.getHours() : d.getHours();
								min = (d.getMinutes() < 10) ? "0"+d.getMinutes() : d.getMinutes();
								time = hours+":"+min;						
								nativeDroid.plugins.homescreen.widget.clock.currentMin = d.getMinutes();
								html += "<div class='time'>"+time+"</div>";
								date = nativeDroid.plugins.homescreen.widget.clock.getTodayString(d.getDay(),d.getDate(),d.getMonth(),d.getFullYear());						
								html += "<div class='date'><i class='icon-calendar'></i> "+date+"</div>";
							html += "</div>";
							return html;
						},
						create : function() {
							cObj = nativeDroid.plugins.homescreen.widget.clock;
							cObj.container.addClass("nativeDroidWidgetClock");
							cObj.container.html(cObj.getClockHTML());
							cObj.run(); 
						},
						update : function() {
							nativeDroid.plugins.homescreen.widget.clock.container.html(nativeDroid.plugins.homescreen.widget.clock.getClockHTML());
						},
						run : function() {
							cMin = nativeDroid.plugins.homescreen.widget.clock.currentMin;
							now = new Date();
							if(cMin != now.getMinutes()) {
								nativeDroid.plugins.homescreen.widget.clock.update();
							}
							nextRun = (61 - now.getSeconds()) * 1000;
							setTimeout(function() {
								nativeDroid.plugins.homescreen.widget.clock.run();
							},nextRun);
						},
						ini : function(obj) {
							nativeDroid.plugins.homescreen.widget.clock.container = obj;
							if(obj.data("nativedroid-widget-clock-format")) {
								nativeDroid.plugins.homescreen.widget.clock.language.type = obj.data("nativedroid-widget-clock-format");
							}
							if(obj.data("nativedroid-widget-clock-lang")) {
								nativeDroid.plugins.homescreen.widget.clock.language.set = obj.data("nativedroid-widget-clock-lang");
							}
							nativeDroid.plugins.homescreen.widget.clock.create();
						}
					},
					reader : {
						container : false,
						type : "rss",
						source : false,
						bindEvents : function() {

						},
						create : function() {
							rObj = nativeDroid.plugins.homescreen.widget.reader;
							rObj.container.addClass("nativeDroidWidgetReader");
							if(rObj.type == "rss" && rObj.source) {
								queryUrl = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&q="+encodeURIComponent(rObj.source);
								nativeDroid.api.get("jsonp",queryUrl,false,rObj.parseFeed);
							}
						},
						parseFeed : function(data) {
							feedTitle = false;
							feedLink = false;
							feedDescription = false;
							feedAuthor = false;
							
							if(data && data.responseStatus == "200") {
								// Filter Data
								data = data.responseData.feed;

								// Prepare main data
								feedTitle = data.title;					
								feedLink = data.link;					
								feedDescription = data.description;					
								feedAuthor = data.author;					

								feedHTML = "";

								// Loop entries
								for(i = 0;i < data.entries.length; i++) {
									entry = data.entries[i];
									feedHTML += "<li>";
										feedHTML += "<div class='feedActionBox'><a href='"+entry.link+"' target='_blank'><i class='icon-share-alt'></i></a></div>";
										feedHTML += "<strong>"+entry.title+"</strong>";
										feedHTML += "<p>"+nativeDroid.basic.dateFormat.format(entry.publishedDate)+" | "+entry.contentSnippet+"</p>";
									feedHTML += "</li>";
								}

									html = "<ul>";
										html += "<li class='widgetTitleBar'>";
											html += "<h3>"+feedTitle+"</h3>";
										html += "</li>";
										html += feedHTML;
									html += "</ul>";
	
								nativeDroid.plugins.homescreen.widget.reader.container.html(html);
								
							}
						},
						ini : function(obj) {
							nativeDroid.plugins.homescreen.widget.reader.container = obj;
							if(obj.data("nativedroid-widget-reader-type")) {
								nativeDroid.plugins.homescreen.widget.reader.type = obj.data("nativedroid-widget-reader-type");
							}
							if(obj.data("nativedroid-widget-reader-source")) {
								nativeDroid.plugins.homescreen.widget.reader.source = obj.data("nativedroid-widget-reader-source");
							}
							nativeDroid.plugins.homescreen.widget.reader.create();									
						}
					},
					icon : {
						container : false,
						iconType : "text",
						iconClass : "icon-question-sign",
						iconTitle : "Your Icon",
						iconLink : "#",
						bindEvents : function() {
							$("div[data-nativedroid-role='widget']").on("click",".nativeDroidIconWidget",function() {
								window.location.href = $(this).attr('data-nativedroid-icon-href');
							});
						},
						create : function() {
							html = "";
							if(nativeDroid.plugins.homescreen.widget.icon.iconType == "text") {
								html = "<div class='nativeDroidIconWidget' data-nativedroid-icon-href='"+nativeDroid.plugins.homescreen.widget.icon.iconLink+"'><i class='"+nativeDroid.plugins.homescreen.widget.icon.iconClass+"'></i><span>"+nativeDroid.plugins.homescreen.widget.icon.iconTitle+"</span></div>";
							}
							if(html != "") {
								nativeDroid.plugins.homescreen.widget.icon.container.html(html);
							}
							nativeDroid.plugins.homescreen.widget.icon.bindEvents();
						},
						ini : function(obj) {

							nativeDroid.plugins.homescreen.widget.icon.container = obj;

							nativeDroid.plugins.homescreen.widget.icon.iconType = obj.data("nativedroid-widget-icon-type");
							nativeDroid.plugins.homescreen.widget.icon.iconClass = obj.data("nativedroid-widget-icon-class");
							nativeDroid.plugins.homescreen.widget.icon.iconTitle = obj.data("nativedroid-widget-icon-title");
							nativeDroid.plugins.homescreen.widget.icon.iconLink = obj.data("nativedroid-widget-icon-link");

							nativeDroid.plugins.homescreen.widget.icon.create();							

						}
					}
				},
				ini : function(obj) {
					nativeDroid.plugins.homescreen.container = obj;
					bg = obj.data("nativedroid-background");
					nativeDroid.plugins.homescreen.background = (bg) ? bg : false;
					nativeDroid.plugins.homescreen.create();
				}
			}
		},
		api : {
			get : function(datatype,query,queryData,returnFn) {
			
			    $.ajax({
			        dataType: datatype,
			        url: query,
			        data : (queryData !== false) ? queryData : "",
			        success: returnFn,
			        error : function(errorData) {
			        	console.log("There is an error while your ajaxRequest: ");
			        	console.log("Query: "+query);
			        	console.log(errorData.responseText);
			        }
			    });
			},
			helper : {
				googlemaps : {
					apiScript : "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false",
					apiScriptLoaded : false,
					ini : function(returnFn) {
						if(typeof google=='undefined') {
							$.getScript(nativeDroid.api.helper.googlemaps.apiScript).done(function() {
								returnFn(true);
							});
						} else {
							returnFn(true);
						}
					},
					directions : {
						from : false,
						to : false,
						container : false,
						type : "string",
						prepareRoute : function(data) {

							nativeDroid.api.helper.googlemaps.directions.type = (data.type) ? data.type : nativeDroid.api.helper.googlemaps.directions.type;							

							if(nativeDroid.api.helper.googlemaps.directions.type == "coords") {
																
								from = data.from.split(',');
								fromLat = parseFloat(from[0])
								fromLng = parseFloat(from[1]);
								nativeDroid.api.helper.googlemaps.directions.from = new google.maps.LatLng(fromLat,fromLng);

								to = data.to.split(',');
								toLat = parseFloat(to[0])
								toLng = parseFloat(to[1]);
								nativeDroid.api.helper.googlemaps.directions.to = new google.maps.LatLng(toLat,toLng);
																
							} else {
								nativeDroid.api.helper.googlemaps.directions.from = data.from;
								nativeDroid.api.helper.googlemaps.directions.to = data.to;
								nativeDroid.api.helper.googlemaps.directions.container = data.container;
							}
							
						},
						getRoute : function(data) {

							if(data && data.from && data.to && data.container) {
								
								nativeDroid.api.helper.googlemaps.directions.prepareRoute(data);

								$(window).on("load",function() {
									
									var rendererOptions = {
									  draggable: false
									};
									var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
									var directionsService = new google.maps.DirectionsService();
									var map;
									
									function initialize() {
									
									  var mapOptions = {
									    zoom: 7,
									    disableDefaultUI : true,
									    draggable : false,
									    keyboardShortcuts : false,
									    scrollwheel : false,
									    mapTypeId: google.maps.MapTypeId.ROADMAP
									  };
									  map = new google.maps.Map(data.container, mapOptions);
									  directionsDisplay.setMap(map);

									
									  calcRoute();
									}
									
									function calcRoute() {
									
									  var request = {
									    origin: nativeDroid.api.helper.googlemaps.directions.from,
									    destination: nativeDroid.api.helper.googlemaps.directions.to,
									    travelMode: google.maps.TravelMode.DRIVING
									  };
									  directionsService.route(request, function(response, status) {
									    if (status == google.maps.DirectionsStatus.OK) {
									      directionsDisplay.setDirections(response);
									    }
									  });
									}
									
									initialize();
									
	
								});

							}
						}
					}
				}
			}
		}
	}
	
	
	// Events

	$("[data-nativedroid-plugin]").each(function(){
		if(nativeDroid.plugins[$(this).attr('data-nativedroid-plugin')]) {
			new nativeDroid.plugins[$(this).attr('data-nativedroid-plugin')].ini($(this));
		} else {
			console.log($(this).attr('data-nativedroid-plugin')+" - is not a valid nativeDroid plugin.")
		}
	});
	
	// Disabling scrollTop
	
	if(nativeDroid.basic.touchEvent() == "touchstart") {
		nativeDroid.basic.disableScrollTop();
	}
	
});