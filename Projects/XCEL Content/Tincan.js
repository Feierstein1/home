	
	var options = decodeURIComponent(window.location.search).slice(1)
            .split('&')
            .reduce(function _reduce(/*Object*/ a, /*String*/ b) {
                b = b.split('=');
                a[b[0]] = decodeURIComponent(b[1]);
                return a;
            }, {});
	userId = (JSON.parse(options.actor)).account.name;  //this gets the userId of the current user logged in 
    var _index = parent.window.document.location.href.lastIndexOf('/');
    courseId = parent.window.document.location.href.substr(_index + 1); // this gets the current courseId of the course the student is currently in
		
        var lastpage = ((pageArray.length) - 1);  //defines "last page" for index which starts counting at 0 instead of 1
        var lastpagenumber = (pageArray.length);  //defines "last page" for page number
		var completeCh = false;	//Allows completion for reaching last page

        var BookmarkingTracking = function () {
            this.currentPage = 0;
            this.startTimeStamp = new Date();
            this.startAttemptDuration = 0;
            this.attemptComplete = false;
        };

        BookmarkingTracking.prototype = {
            initFromBookmark: function (bookmark) {
                this.setPage(parseInt(bookmark.location, 10));
                this.setStartDuration(bookmark.attemptDuration);
                this.getCompletion(bookmark.attemptComplete);
            },
            reset: function () {
                this.setPage(0);
                this.setStartDuration(0);
                this.setCompletion(false);
            },
            save: function (callback) {
                var bookmarking = {
                    location: this.currentPage,
                    attemptDuration: this.getAttemptDuration(),
                    attemptComplete: this.attemptComplete
                };
                tincan.setState("bookmarking-data", bookmarking, {
                    contentType: "application/json",
                    overwriteJSON: true,
                    callback: callback
                });
            },
            get: function () {
                var stateResult = tincan.getState("bookmarking-data");
                if (stateResult.err === null && stateResult.state !== null && stateResult.state.contents !== "") {
                    return stateResult.state.contents;
                }
                return null;
            },
            setStartDuration: function (duration) {
                this.startAttemptDuration = duration;
            },
            setPage: function (page) {
                this.currentPage = page;
                return true;
            },
            getPage: function () {
                return this.currentPage;
            },
            incrementPage: function () {
                this.currentPage++;
            },
            decrementPage: function () {
                this.currentPage--;
            },
            setCompletion: function (completion) {
                this.attemptComplete = completion;
                return true;
            },
            getCompletion: function (completion) {
                return this.attemptComplete;
            },
            getAttemptDuration: function () {
                return this.startAttemptDuration + this.getSessionDuration();
            },
            getSessionDuration: function () {
                return Math.abs((new Date()) - this.startTimeStamp);
            }
        };

        var bookmarkingData = new BookmarkingTracking();

        //
        // functions for sizing the iFrame
        //
        function setIframeHeight(id, navWidth) {
            if (document.getElementById) {
                var theIframe = document.getElementById(id);
                if (theIframe) {
                    var height = getWindowHeight();
                    theIframe.style.height = Math.round(height) - navWidth + "px";
                    theIframe.style.marginTop = Math.round(((height - navWidth) - parseInt(theIframe.style.height)) / 2) + "px";
                }
            }
        }

        function getWindowHeight() {
            var height = 0;
            if (window.innerHeight) {
                height = window.innerHeight - 18;
            }
            else if (document.documentElement && document.documentElement.clientHeight) {
                height = document.documentElement.clientHeight;
            }
            else if (document.body && document.body.clientHeight) {
                height = document.body.clientHeight;
            }
            return height;
        }

        function SetupIFrame() {
            //set our iFrame for the content to take up the full screen except for our navigation
            var navWidth = 80; //120; // 80;
            var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (iOS) {
                navWidth = 380;
            }

            setIframeHeight("div_content", navWidth);
            window.onresize = function () { setIframeHeight("div_content", navWidth); };
            if (true == true) {
                if (iOS) {
                    setIframeHeight("contentFrame", 120);
                    window.onresize = function () { setIframeHeight("contentFrame", 120); };
                }
            }
        }
		
		
        function doStart() {
			
            //alert(navigator.appVersion)
            try {
                parent.AbsorbLMS.Absorb.Learn.data.course.playerLesson().skipUpdate = true;
            }
            catch (e) { }
            finally { }
            var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
			//var Android = /(android)/i.test(navigator.userAgent);
            if (!iOS) {
                try {
                    window.parent.document.getElementsByTagName('meta')['viewport'].content = '';
                }
                catch (e) { }
                finally { }
            }

            //get the iFrame sized correctly and set up
            SetupIFrame();
			//
			
            var statements = [];
            statements.push({
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/initialized",
                    display: {
                        "en-US": "initialized"
                    }
                },
                context: XCELlesson.getContext(),
                result: {
                    duration: "PT0S"
                }
            });
            var attemptedStatement = {
                verb: {
                    id: "http://adlnet.gov/expapi/verbs/attempted",
                    display: {
                        "en-US": "attempted"
                    }
                },
                context: XCELlesson.getContext(),
                result: {
                    duration: "PT0S"
                }
            };
            //get activity_id bookmark if it exists
            var bookmark = JSON.parse(bookmarkingData.get());
            if (bookmark !== null) {
                bookmarkingData.initFromBookmark(bookmark);
                if (!bookmarkingData.getCompletion()) {
                    var resumedStatement = {
                        verb: {
                            id: "http://adlnet.gov/expapi/verbs/resumed",
                            display: {
                                "en-US": "resumed"
                            }
                        },
                        context: XCELlesson.getContext(),
                        result: {
                            duration: TinCan.Utils.convertMillisecondsToISO8601Duration(bookmark.attemptDuration)
                        }
                    };
                    statements.push(resumedStatement);
                }
            }
            else {
				console.log("bookmark not found");
                bookmarkingData.setPage(0);
                statements.push(attemptedStatement);
            }
            tincan.sendStatements(statements);
            goToPage();

            // kill the timer (Id number as zero) for saving time spend in abosorb
            var killId = setTimeout(function () {
            }, 1000);
            if (killId >= 3) {
                clearInterval(killId);
                clearInterval(0);
            }
        }
		
		function goToPage() {
            var div_contentFrame = document.getElementById("div_content");
            var theIframe = document.getElementById("contentFrame"),
                prevButton = document.getElementById("butPrevious"),
                nextButton = document.getElementById("butNext");
				
			SaveSpendTime();
			checkCourseCompletion();

            //pass the TC arguments to the iFrame
            var tc_argStr = (pageArray[bookmarkingData.getPage()].indexOf("?") != -1) ? "&" + location.search.slice(1) : location.search;

            //navigate the iFrame to the content
            theIframe.src = pageArray[bookmarkingData.getPage()] + tc_argStr;

            //displays current page vs number of pages
            pageNum = (bookmarkingData.getPage() + 1);
            document.getElementById("DisplayPgNum").innerHTML = "&nbsp" + pageNum + "/" + lastpagenumber;

            //disable the prev/next buttons if we are on the first or last page.
            var _currentpageindex = bookmarkingData.getPage();
            prevButton.disabled = (_currentpageindex == 0);
			
			if (bookmarkingData.getPage() == lastpage) {
                completeCh = true; //complete chapter when last page is reached
            }

            bookmarkingData.save();
			console.log(bookmarkingData);
			
			if(pageWait == true){
				Wait(.02); //percent of a minute example .03 = 1.8 seconds; .02 = 1.2 seconds
			}
			
			function Wait(t) {

                //document.getElementById("butNext").hide();
                nextButton.disabled = true;
				//prevButton.disabled = true;

                var oTime = new Date();
                //checking time every second
                var MAXt = t;
                var tTick = 1000;
                var oMinutes = 0;

                function tOut() {
                    oMinutes = Math.abs((oTime - new Date()) / 1000 / 60);

                    if (oMinutes > MAXt) {
                        nextButton.disabled = false;
                        clearInterval(nextT);
                    }


                } // closing the function

                var nextT = setInterval(tOut, tTick);
            }
        }

        function doPrevious() {
            if (bookmarkingData.getPage() > 0) {
                bookmarkingData.decrementPage();
            }
            goToPage();
        }

        function doNext() {
            if (bookmarkingData.getPage() < (pageArray.length - 1)) {
                bookmarkingData.incrementPage();
            }
            else
                bookmarkingData.setPage(0);

            goToPage();
        }
		
		//check to see if the chapter can be completed
		function checkCourseCompletion(){
			if (completeCh == true) {
                bookmarkingData.save(function () {
                    var statements = [];
                    statements.push({
						verb: {
							id: "http://adlnet.gov/expapi/verbs/completed",
							display: {
								 "en-US": "completed"
							}
						},
						context: XCELlesson.getContext(),
						result: {
							duration: "PT0S"
						}
					});
					tincan.sendStatements(statements, function () {});
				});
			}
		}
		
		function doExit() {
            checkCourseCompletion();
			SaveClose("Course exited and progress saved. You may now close this window.");
        }
		
		function SaveClose(message) {
			
			SaveSpendTime();
            ShowCloseButton();
			$("body").html("<br/><center><h1 class='display-font'>" + message + "</h1></center>");
           // document.write("<br/><br/><br/><center><h1>" + message + "</h1></center>");
			//console.log("saveClose");
            setTimeout(function () {
                window.parent.location.reload();
            }, 5000);

        }
						
		function SaveSpendTime() {

            bookmarkingData.save(function () {

				var statements = [];
				if (!bookmarkingData.getCompletion()) {
					statements.push({
					verb: {
						id: "http://adlnet.gov/expapi/verbs/suspended",
						display: {
						"en-US": "suspended"
						}
					},
					context: XCELlesson.getContext(),
					result: {
						duration: TinCan.Utils.convertMillisecondsToISO8601Duration(bookmarkingData.getAttemptDuration())
					}
					});
				}
				statements.push({
					verb: {
						id: "http://adlnet.gov/expapi/verbs/terminated",
						display: {
							"en-US": "terminated"
						}
					},
					context: XCELlesson.getContext(),
					result: {
						duration: TinCan.Utils.convertMillisecondsToISO8601Duration(bookmarkingData.getAttemptDuration())
					}
				});
				tincan.sendStatements(statements, function () {});
			});
        }
	
		
		//hide the Navigation bar to prevent save and exit or going through course (for prompt purposes)
		function hideNav(){  
			$('#navDiv').fadeOut();
			//console.log('hideNav');
		}
		function showNav(){//show the Navigation bar
			$('#navDiv').fadeIn();
			//console.log('showNav');
		}
		
		//hide content to allow prompts to appear clearly
		function hideContent(){ 
			$('#div_content').fadeOut();
			//console.log('hideContent');
		}
		function showContent(){  //show content
			$('#div_content').fadeIn();
			//console.log('showContent');
		}
		
		//hide red X to prevent users from exiting without saving progress
		function HideCloseButton() {  
			CloseButtonDisplay('none')
        }
        function ShowCloseButton() {  //show red X after save and close is hit
			CloseButtonDisplay('')
        }
		
		//toggles the X button display based on inputs
		function CloseButtonDisplay(x){
			var ahrefs = window.parent.document.getElementsByTagName('button');
            for (var i = 0; i < ahrefs.length; i++) {
                var ahref = ahrefs[i];
                if (ahref.className == 'icon-button-module__btn___Zb89b' || ahref.className == 'icon icon-x-thin lesson-player-module__close_btn___1SlvO lesson-player__close_btn')
                    ahref.style.display = x;
            }
		} 
        
        //var tokendatetime = null;
		
        function GetStudentData() {
            var settings = {
                "async": false,
                "crossDomain": true,
                "url": "/api/Rest/v1/Users/" + userId,
				"tryCount" : 0,
				"retryLimit" : 3,
                "method": "GET",
                "headers": {
                    //"Authorization": token,
                    "Content-Type": "application/json",
                    "cache-control": "no-cache"
                }
            }

            $.ajax(settings).done(function (response) {
                DepartmentId = response.DepartmentId;
                FirstName = response.FirstName;
                LastName = response.LastName;
                Username = response.Username;
                Password = response.Password;
                EmailAddress = response.EmailAddress;
                Zip = response.PostalCode;
                Phone = response.Phone;
				getSSN = response.CustomFields.String1;
				getDOB = response.CustomFields.String5;

            }).fail(function (msg) {
				SaveClose("There was an issue loading your profile information.  Please close all internet browsers, clear your browser history and try again.  For optimum performance, complete course with a single browser and tab open.  If you continue to receive this error, please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7720.");
            });
            v_q_array = [Zip, Phone, EmailAddress];
        }

        GetStudentData();
		
		//make the Save and Exit button visible, 
		//if not move the help button between the next and previous button
		if(saveExit == false){
			//SaveSpendTime();
			//checkCourseCompletion();
			Hide_X = false;
			document.getElementById("navButtons").innerHTML = 
						"<div class = 'row'>" +
							"<input type='button' class='blk_buttons' value='<- PREVIOUS' id='butPrevious' onclick='doPrevious();'>" +
							"<input type='button' class='red_buttons' value='NEED HELP?' id='HELP_button' />" +
							"<input type='button' class='blk_buttons' value='NEXT ->' id='butNext' onclick='doNext();'>" +
						"</div>";
		}
		
		//Get the time spent in the course and display it if true.
		//if false, then hide the time display
		if(showTime == true){
			document.getElementById("time").innerHTML = getTimeSpent();
		}
		else{
			$('#timeSpent').fadeOut()
		}
		
		//function to get the time ticks of a course and convert to hours, mins, sec
		function getTimeSpent(){
			var settings = {
                "async": false,
                "crossDomain": true,
                "url": "/api/Rest/v1/Users/" + userId + "/enrollments/" + courseId,
				"tryCount" : 0,
				"retryLimit" : 3,
                "method": "GET",
                "headers": {
                    //"Authorization": token,
                    "Content-Type": "application/json",
                    "cache-control": "no-cache"
                }
            }

            $.ajax(settings).done(function (response) {
                TimeSpentTicks = response.TimeSpentTicks;
            }).fail(function (msg) {
				SaveClose("There was an issue loading your course. Please close all internet browsers and try again. If you continue to receive this error please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7728.");
            });
			
			var convertTimeTicks = "<span style='color:white'>" + Math.floor(((TimeSpentTicks/10000000)/60)/60) + "</span> Hours: <span style='color:white'>   " + Math.floor(((TimeSpentTicks/10000000)/60) % 60) + "</span> Minutes";
			return convertTimeTicks;
		}	
		
		//toggle for allowing students to view content  in more than one session. 
		//if Allow_Multiple_tab == false; Will sign out of previous session if new session is made
		if(Allow_Multiple_tab == false){
			currentStatus = Math.floor((Math.random() * 5000) + 1); //active session number
			changeLessonStatus(currentStatus);  //change the lesson status number			
		}
		
		//change the lesson status number
		function changeLessonStatus(s) {  
		
           /* var _now = (new Date()).getTime();
            var _ageoftoken = (_now - tokendatetime) / 1000.00;

            if (_ageoftoken > 10000)
                GetToken();*/
			
            var changeLesson = { //changes lessons number every new attempt
                "async": true,
                "crossDomain": true,
				"url": "/api/Rest/v1/Users/" + userId,
				"tryCount" : 0,
				"retryLimit" : 3,
                "method": "PUT",
                "headers": {
                    //Authorization": token,
                    "Content-Type": "application/json",
                    "cache-control": "no-cache"
                },
                "processData": false,
                "data": "{\n    \"DepartmentId\": \"" + DepartmentId + "\",\n    \"FirstName\": \"" + FirstName + "\",\n    \"LastName\": \"" + LastName + "\",\n    \"Username\": \"" + Username + "\",\n   \"EmailAddress\": \"" + EmailAddress + "\",\n    \"ReferenceNumber\": \"" + s + "\"    \n}"
            }

            $.ajax(changeLesson).done(function (response) {
             }).fail(function (msg) {
					SaveClose("There was an issue loading your course. Please close all internet browsers, clear your browser history and try again. If you continue to receive this error please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7729.");
            });
			
			checkLessonStatus(currentStatus);

        }
       
        //active lesson checker. Checks to see if the lesson number has changed, 
		//thus meaning a new session has started and old session must be terminated
        function checkLessonStatus() {
			
            function check() {
				
                /*var _now = (new Date()).getTime();
                var _ageoftoken = (_now - tokendatetime) / 1000.00;

                if (_ageoftoken > 10000)
                    GetToken();*/
				
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": "/api/Rest/v1/Users/" + userId,
                    "method": "GET",
					"tryCount" : 0,
					"retryLimit" : 3,
                    "headers": {
                       // "Authorization": token,
                        "Content-Type": "application/json",
                        "cache-control": "no-cache"
                    }
                }
                $.ajax(settings).done(function (response) {
                    Status = response.ReferenceNumber;
                   // console.log('Status', Status);
                    if (Status != currentStatus) {
						clearInterval(checkSession);
                        SaveClose("There was an issue loading your profile information.  Please close all internet browsers, clear your browser history and try again.  For optimum performance, complete course with a single browser and tab open.  If you continue to receive this error, please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7720."); //message if multiple active attempts
					}
                }).fail(function (msg) {
                    if (msg.status == 401) {
                        console.log('msg.status', '401');
                        GetToken();
                    }
					else{
						clearInterval(checkSession);
						SaveClose("There was an issue loading your course. Please close all internet browsers, clear your browser history and try again. If you continue to receive this error please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7730.");
					}
                });

            }
            var checkSession = setInterval(check, 3000); //checking every 3 seconds for multiple attempts
        }
		
		function getAttemptStorageKey(a){
			// A utility function to get a parameter from the query string
			var getParameterByName = function (name) {
				var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
				return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
			};

			var attemptId = getParameterByName('attemptId');

			return a + ":" + attemptId;
		}

		// Retrieves the start date for the attempt stored in the browser
		function getStoredAttemptStartDate(a) {
			var startDateKey = getAttemptStorageKey(a);
			return localStorage.getItem(startDateKey) ? new Date(localStorage.getItem(startDateKey)) : null;
		}

		function setStoredAttemptStartDate(a) {
			var startDateKey = getAttemptStorageKey(a);
			localStorage.setItem(startDateKey, new Date());
		}

		// Run this at startup of lesson
		function initializeAttemptStartDateOnLessonStart(){

			var storedAttemptStartDate = getStoredAttemptStartDate("attemptStart");
			var storedTenMinuteDate = getStoredAttemptStartDate("TenMinute");

			if (!storedAttemptStartDate) {
				// persist the start date in browser local storage
				setStoredAttemptStartDate("attemptStart");
			}
			if (!storedTenMinuteDate) {
				// persist the start date in browser local storage
				setStoredAttemptStartDate("TenMinute");
			}
		}
		
		initializeAttemptStartDateOnLessonStart();
				
		if(Timeout_10_minute == true){
			TenMinuteTimeout();
		}
		
		if(Timeout_90_minute == true){
			NinteyMinuteTimeout();
		}
		
		function TenMinuteTimeout(){
			
			TenMinuteDate = getStoredAttemptStartDate("TenMinute");
			
			//if there is no start date, then local storage was erased
			if(TenMinuteDate == null){
				SaveClose("There was an issue loading your course. Please close all internet browsers. Before attempting to access this course again, please enable cookies and local storage.  If you continue to receive this error, please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7722.");
			}
			else{
				//if the user changes their time, log out
				if (getStoredAttemptStartDate("TenMinute") > (new Date())){
					SaveClose("There was an issue loading your course. Please make sure your device is set to detect or set local time and time zone automatically. Close all browsers, sign back in, and  try again.  Do not adjust while studying.  If you continue to receive this error, please reach out to our student support team (904.999.4923 or support-xcelsolutions.com) and provide error code 7723.."); 
				}
				else{
				
					// Do the following to check if the current date is greater then the stored attempt start date
					var captcha = ["insurance", "life", "health", "licensing"];
					var i = Math.floor(Math.random() * (captcha.length));
					var pword = captcha[i];
					var timeTick = 1000; //compares time every 1 second

					var expireDelay;

					function setTenMinuteTimeout() {
						var elapsed = new Date() - getStoredAttemptStartDate("TenMinute");
						lastMouseMove_minutes = elapsed / 1000 / 60;
						console.log("Ten Minute", lastMouseMove_minutes);

						if (lastMouseMove_minutes > 9) //9 minute inactivity alert
						{
							document.getElementById("pword").innerHTML = pword;
							document.getElementById("pword").value = pword;
							
							hideNav();
							hideContent();
							$('#showdiv').fadeIn();

							if (lastMouseMove_minutes >= 10) //10 minute inactivity time out reset if alert acknowledge
							{
								sessionLogout();
							}
						}
					}
					$("#butNext").click(function () {
						setStoredAttemptStartDate("TenMinute");
					});
					
					$("#butPrevious").click(function () {
						setStoredAttemptStartDate("TenMinute");
					});

					$("#captcha_check").click(function () {
						var x = document.getElementById("pword").value;
						var y = document.getElementById("user_input").value;

						if (x.toUpperCase() == y.toUpperCase()) {
							$('#showdiv').fadeOut();
							showContent();
							showNav();
							i = Math.floor(Math.random() * (captcha.length));
							pword = captcha[i];
							setStoredAttemptStartDate("TenMinute");
						}
						else {
							sessionLogout();
						}
					});
					expireDelay = setInterval(setTenMinuteTimeout, timeTick);
				}
			}
		}

		function NinteyMinuteTimeout(){
			MAXtime = 75 + (Math.floor(Math.random() * (15)));
			expireDelay = setInterval(setNinteyMinuteTimeout, 3000);
		}
				
		function setNinteyMinuteTimeout() {
		
			SessionStartDate = getStoredAttemptStartDate("attemptStart");
			
			//if there is no start date, then local storage was erased
			if(SessionStartDate == null){
				SaveClose("There was an issue loading your course. Please close all internet browsers. Before attempting to access this course again, please enable cookies and local storage.  If you continue to receive this error, please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7732.");
			}
			else{
				if (getStoredAttemptStartDate("attemptStart") > (new Date())){
					SaveClose("There was an issue loading your course. Please make sure your device is set to detect or set local time and time zone automatically. Close all browsers, sign back in, and  try again.  Do not adjust while studying.  If you continue to receive this error, please reach out to our student support team (904.999.4923 or support-xcelsolutions.com) and provide error code 7723."); 
				}
				else{
				
					var elapsedMilliseconds = new Date() - getStoredAttemptStartDate("attemptStart");
					var elapsedMinutes = elapsedMilliseconds / 1000 / 60;
					console.log(elapsedMinutes);

					if (elapsedMinutes > MAXtime) {
						hideContent();
						 $('#expire').fadeIn();
						// log user out here.
					}
					if (elapsedMinutes > (MAXtime+2)){
						SaveClose("You are required to save your progress periodically. This lesson exceed the maximum period of time between progress saves.  Please close this window and restart your lesson. If you continue to receive this error, please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7725."); 
					}
					if (elapsedMinutes > 95) {
						SaveClose("You are required to save your progress periodically. This lesson exceed the maximum period of time between progress saves.  Please close this window and restart your lesson. If you continue to receive this error, please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7724."); 				
					}
				}
			}
		}
		
		
		(function ($) {
			$(document).ready(function () {
				if(Complete_All == false && PII_Validation == false){
					completeCh = true;	//Allows completion on opening
					checkCourseCompletion();
				}
				initiate_validation();
			});
		})(jQuery)
		
		function initiate_validation () {
			if(PII_Validation == true){
				InitValidationQuestion();	//comment out to not verify PII //before line
			}
        }

		function InitValidationQuestion(){
			if(Chapter == "Basic"){
				document.getElementById("student_name").innerHTML = FirstName + " " + LastName;
				hideNav();
				hideContent();
				$('#identify_student').fadeIn();
				getTimer(1); //1 minute to validate
				$("#identify_student_submit").click(function()
				{
					$('#identify_student').fadeOut();
					showContent();
					showNav();
					clearInterval(nextTick);
					if(Complete_All == false){
						completeCh = true;
						checkCourseCompletion();
					}
				});
			}
			
			else if(Chapter == "Laws"){
				get_PII_Collection();
			}
			else{
				validation_questions();
				
				function validation_questions(){
					var q = Math.floor(Math.random() * (v_q_array.length));
					var verfication_answer = v_q_array[q];
					if (q ==0){
					verification_q = "zip code";
					}
					if (q ==1){
					verification_q = "phone number";
					}
					string4 = "last";
					chr_dig = "digits";
					
					if (q ==2){
					verification_q = "email address";
					string4 = "first";
					chr_dig = "charaters";
					}

					var verification_string = "Please enter the "+ string4 +" 4 " + chr_dig + " of your "+ verification_q +" to confirm your identity."; <!--Validation Question-->

					document.getElementById("v_q").innerHTML = verification_string;

					validate(q, verfication_answer);
				}

				function validate(question, validate_answer) {

					getTimer(1); //1 minute to validate
					
					hideNav();
					hideContent();
					
					$('#validation').fadeIn();

					if(question == 2){
						validate_answer = validate_answer.substr(0, 4);
					}
					else{
						validate_answer = validate_answer.substr(validate_answer.length - 4);
					}

					$("#validate").click(function()
					{
						var val = document.getElementById("val").value;
						if (val == validate_answer) {
							$('#validation').fadeOut();
							showContent();
							showNav();
							clearInterval(nextTick);
							if(Complete_All == false){
								completeCh = true;
								checkCourseCompletion();
							}
						} else {
							SaveClose("The information you entered did not match the information in your student profile. Please close this window and try again (please note:  special characters and additional spaces are not allowed).  If you continue to receive this error, please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7726."); 
						//message if info does not verify
						}
					});

				}
			}
		}
		
		function get_PII_Collection(){
			
			//console.log("PII_Collection",PII_Collection);
			//console.log("getDOB",getDOB);
			//console.log("getSSN",getSSN);
			
			if((PII_Collection == "SSN" && (getSSN == null || getSSN == "")) || (PII_Collection == "DOB" && (getDOB == null || getDOB == "")) || (PII_Collection == "Both" && (getSSN == null || getSSN == "" || getDOB == null || getDOB == ""))){
				getTimer(3); //3 minutes to validate
				hideNav();
				hideContent();
				$('#pii_collection').fadeIn();
			}
			else{
				clearInterval(nextTick);
			}
			
			$("#pii_submit").click(function()
			{
				var SSN,DOB;
				
				if(PII_Collection == "DOB"){
					SSN = "0000";
					DOB = check_DOB();
				}
				else if(PII_Collection == "SSN"){
					SSN = check_SSN();
					DOB = "00/00/0000";
				}
				else if(PII_Collection == "Both"){
					SSN = check_SSN();
					DOB = check_DOB();
				}
				//console.log(SSN);
				//console.log(DOB);
				//console.log("here");
				
				var sendData = "{\n    \"DepartmentId\": \"" + DepartmentId + "\",\n    \"FirstName\": \"" + FirstName + "\",\n    \"LastName\": \"" + LastName + "\",\n    \"Username\": \"" + Username + "\",\n    \"EmailAddress\": \"" + EmailAddress + "\",\n   \"CustomFields\":{\n    \t\"String1\": \"" + SSN + "\",\n  \t\t\"String5\": \"" + DOB + "\"\n  }\n}";
				console.log(sendData);
				if(SSN && DOB){
					var changeLesson = { //changes lessons number every new attempt
						"async": true,
						"crossDomain": true,
						"url": "/api/Rest/v1/Users/" + userId,
						"tryCount" : 0,
						"retryLimit" : 3,
						"method": "PUT",
						"headers": {
							
							"Content-Type": "application/json",
							"cache-control": "no-cache"
						},
						"processData": false,
						"data": sendData,
					}
					
					/*  
					***************************************MAKE SURE TO PUT THE CORRECT STRING CALL
					"String1": "SSN",
					"String5": "DOB"
					
					*/

					$.ajax(changeLesson).done(function (response) {
							$('#pii_collection').fadeOut();
							showContent();
							showNav();
							clearInterval(nextTick);
							if(Complete_All == false){
								completeCh = true;
								checkCourseCompletion();
							}
					 }).fail(function (msg) {
							//alert("There was an issue saving your profile information. Please close all internet browsers, clear your browser history and try again. If you continue to receive this error please reach out to our student support team (904.999.4923 or support@xcelsolutions.com) and provide error code 7731.");
						alert("There is an update being made for this lesson, please wait a few minutes and try again -  error code 7731.");
					});
					
				}
			});
		}
		
		function check_SSN(){
			var input_SSN = document.getElementById("SSN").value;
			var confirm_SSN = document.getElementById("confirm_SSN").value;
			if(SSN_format == 9){
				var SSN_regex = /^((\d{9})|((\d{3})\-(\d{2})\-(\d{4})))$/;
			}
			else if(SSN_format == 4){
				var SSN_regex = /^((\d{4}))$/;
			}
			else{
				alert("ERROR");
			}
			
			if(SSN_regex.test(input_SSN) == false && SSN_format == 9){
				alert("Please enter all 9 digits of your Social Security number without dashes.");
				return false;
			}
			else if(SSN_regex.test(input_SSN) == false && SSN_format == 4){
				alert("Please enter the last 4 digits of your Social Security number.");
				return false;
			}
			else if(input_SSN != confirm_SSN){
				alert("Inputs do not match for SSN");
				return false
			}
			else{
				return input_SSN;
			}
		}
		function check_DOB(){
			var input_DOB = document.getElementById("DOB").value;
			var confirm_DOB = document.getElementById("confirm_DOB").value;
			var DOB_regex = /^((\d{8})|((\d{2})\/(\d{2})\/(\d{4})))$/;
			if(DOB_regex.test(input_DOB) == false){
				alert("Please enter your DOB as mm/dd/yyyy");
				return false
			}
			else if(input_DOB != confirm_DOB){
				alert("Inputs do not match for DOB");
				return false
			}
			else{
				return input_DOB;
			}
		}
		
		function getTimer(t) {

			var originTime = new Date();

			 var MAXtimeout = t;
			 var timerTick = 5000;
			 var originTime_minutes = 0;

			 function timeOut()
			 {
				originTime_minutes = Math.abs((originTime - new Date()) / 1000 / 60);

				if(originTime_minutes > MAXtimeout)
				 {
					SaveClose("Your information could not be verified. Please close this window and try again."); //message if learner does not enter information
				 }
			 }
			 nextTick = setInterval(timeOut, timerTick);
		}

	//redirects iframe to logout waits 5 seconds and redirects parent to logout
	function sessionLogout(){

        var theIframe = document.getElementById("contentFrame")

        theIframe.src = "https://xcelsolutions.myabsorb.com/#/logout";

		setTimeout(function () {
			window.parent.location.reload();
		}, 5000);

    }
		//Help button 

		current_url = location.href;
		urlParams = new URLSearchParams(current_url);
		urlParse = current_url.split("?");
		lesson = urlParse[0];;
		url_meta = urlParse[1];
		console.log(url_meta);
		actorParam = JSON.parse(urlParams.get('actor')); 
		student_name = actorParam.name; 
        document.getElementById("HELP_button").onclick = function () {
			showHelp();
		};
        document.getElementById("EXIT_button").onclick = function () { 
			exitHelp();
		};

        function showHelp() {
			hideNav();
			hideContent();
            $('#HELP_div').slideDown(800);
        }
        function exitHelp() {
            $('#HELP_div').slideUp(800);
			showContent();
			showNav();
        }

       $("#submit_help").on("click", function () {
		    document.getElementById('submit_help').disabled = true;
			//document.getElementById("submit_help").setAttribute("value", "Processing...");
		    username = document.getElementById('username').value;
		    loc = document.getElementById('location').value;
		    comment = document.getElementById('comment').value;
		    issue = document.getElementById('issue').value;
			console.log("help requested");
		   if(validate_help_info()){
			   //exitHelp();
			   getUserAgent();
			   console.log("validate_help_info", validate_help_info());
		   }
		   else{
			   document.getElementById('submit_help').disabled = false;
			   $("#help_error_message").fadeIn();
		   }
       });
	   
	   function validate_help_info(){
		   var x = document.getElementById("Help_form").querySelectorAll(".help");
		   //console.log(x);
		   for(i=0;i<x.length;i++){
				console.log(x[i].value);
				if(x[i].value == "" || x[i].value == null ){
					return false
				}
		   }
		   return true
	   }
	   
	   function getUserAgent(){
		   var uAgent = navigator.userAgent;
		   var settings = {
			  "url": "https://api.whatismybrowser.com/api/v2/user_agent_parse",
			  "method": "POST",
			  "timeout": 0,
			  "headers": {
				"X-API-KEY": "91fc074d24bd309d74ab61a2e823a185",
				"Content-Type": "text/plain"
			  },
			  "data": '{\r\n  \"user_agent\": \"' + uAgent + '\",\r\n \"parse_options\": { \"allow_servers_to_impersonate_devices\": true }}\r\n',
			};

			$.ajax(settings).done(function (response) {
			  console.log(response);
			  simple_software_string = response.parse.simple_software_string;
			  simple_sub_description_string = response.parse.simple_sub_description_string;
			  simple_operating_platform_string = response.parse.simple_operating_platform_string;
			  software_version_full = response.parse.software_version_full;
			  operating_system_version_full = response.parse.operating_system_version_full;
			  operating_system_flavour = response.parse.operating_system_flavour;
			  operating_platform = response.parse.operating_platform;
			  extra_info = response.parse.extra_info;
			  capabilities = response.parse.capabilities;
			  detected_addons = response.parse.detected_addons;
			  is_weird = response.parse.is_weird;
			  user_agent = response.parse.user_agent;
			  is_checkable = response.version_check.is_checkable;
			  is_up_to_date = response.version_check.is_up_to_date;
			  latest_version = response.version_check.latest_version;
			  download_url = response.version_check.download_url;
			  software_type = response.parse.software_type;
			  software_sub_type = response.parse.software_sub_type;
			  hardware_type = response.parse.hardware_type;
			  hardware_sub_type = response.parse.hardware_sub_type;
			  layout_engine_name = response.parse.layout_engine_name;
			  extra_info_dict = response.parse.extra_info_dict;
			  is_abusive = response.parse.is_abusive;
			  is_restricted = response.parse.is_restricted;
			  is_spam = response.parse.is_spam;
			  sendHelpRequest();
			});
	   }
	   
	   function sendHelpRequest(){
		   var curDate = new Date();
		   var DateString = curDate.toString();
		   $.ajax({
				   type: "POST",
				   data: {
							name:student_name,
							username:username,
							lesson:lesson,
							url_meta:url_meta,
							slide:pageNum,
							loc:loc,
							comment:comment,
							issue:issue,
							simple_software_string:simple_software_string,
							simple_sub_description_string:simple_sub_description_string,
							simple_operating_platform_string:simple_operating_platform_string,
							software_version_full:software_version_full,
							operating_system_version_full:operating_system_version_full,
							operating_system_flavour:operating_system_flavour,
							operating_platform:operating_platform,
							extra_info:extra_info,
							capabilities:capabilities,
							detected_addons:detected_addons,
							is_weird:is_weird,
							user_agent:user_agent,
							is_checkable:is_checkable,
							is_up_to_date:is_up_to_date,
							latest_version:latest_version,
							download_url:download_url,
							DateString:DateString,
							software_type:software_type,
							software_sub_type:software_sub_type,
							hardware_type:hardware_type,
							hardware_sub_type:hardware_sub_type,
							layout_engine_name:layout_engine_name,
							extra_info_dict:extra_info_dict,
							is_abusive:is_abusive,
							is_restricted:is_restricted,
							is_spam:is_spam,
				   },
				   url: "https://prepare2pass.com/CLIENT_SERVICES/CLIENT_FORMS/HELP_Tester.php",
				   crossDomain: true,
			   }).done(function (data) {
				   //message went through
				   activateSuccessMessage();
				   console.log("help message successful");
			   }).fail(function (data) {
				   console.log('fail', data);
			   });
	   }
	   
	   function activateSuccessMessage(){
		   var message = "Thank you for contacting XCEL Solutions, the leader in the insurance prelicensing industry.</br><br/>"+
				"Your message has been received. We will respond to your message as quickly as possible! While we strive to answer all student inquiries as quickly as possible, due to higher inquiry volume, our response time is ranging anywhere from 2 â€“ 4 business days.<br/><br/>"+
				"If your matter is urgent, please contact us directly at (866) 559-9235. You may choose to wait on-the-line and be connected or request a callback from one of our agents.<br/>"+
				"Thank you! We appreciate your business!<br/><br/>"+
				"XCEL Solutions";
		
			$("#help_content").html("<br/><center><p class='help_message'>" + message + "</p></center>");
	   }
	   
	   
	   
	   
	   