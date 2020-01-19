$(document).ready(function() {
	window.location.reload(true);
	//PAGE NAVAGATION
	
	$("#home").click(function(){
		document.location.href = "index.html";
	});
	$("#resume").click(function(){
		document.location.href = "resume.html";
	});
	$("#projects").click(function(){
		document.location.href = "projects.html";
	});
	$("#hobbies").click(function(){
		document.location.href = "hobbies.html";
	});
	
	//PROJECTS

	$("#content-h1").click(function(){
		$("#content-p1").slideToggle();
	});
	
	$("#content-h2").click(function(){
		$("#content-p2").slideToggle();
	});
	
	$("#content-h3").click(function(){
		$("#content-p3").slideToggle();
	});
	
	$("#content-h4").click(function(){
		$("#content-p4").slideToggle();
	});
	
	//HOBBIES
	
	var count = 0;
	
	var hobbie_frame = ["#hobbie-header","#hobbie-img","#hobbie-desc"];
	
	var hobbie = [
					[
						"DRAWING",
						"rikki_tikki.jpg",
						"<center><b>I've been drawing most of my life. I went to a high school specifically for the arts where<br/> I majored in visual arts and learned how to make prints and draw.</b></center>"
					],
					[
						"MARTIAL ARTS",
						"martial_arts.jpg",
						"<center><b>I've been doing Muay Thai and Brazilian Jiu Jitsu since 2010. I've even done 3 amateur MMA cage fights.<br/> I mainly do it for fitness and fun these days.</b></center>"
					],
					[
						"GAMING",
						"gaming.jpg",
						"<center><b>I've always love playing videogames since I was a kid.<br/> These days I mostly play Super Smash Bros on my Switch and Beat Saber on my Oculus Quest.</b></center>"
					]
				];
	
	setHobbies();
	
	function setHobbies(){
		$("#hobbie-header").html(hobbie[0][0]);
		$("#hobbie-img").attr("src", hobbie[0][1]);
		$("#hobbie-desc").html(hobbie[0][2]);
	}
	
	$("#left-button").click(function(){
		gotToPage(-1);
	});
	
	$("#right-button").click(function(){
		gotToPage(1);
	});
	
	function gotToPage(c){
		
		clearInterval(slider_timer)
		
		hobbie_frame.forEach(function (h, i) {
			$(h).fadeOut(400);
			$(h).hide();
		});
		
		getCount(c);		
		
		$("#hobbie-header").html(hobbie[count][0]);
		$("#hobbie-img").attr("src", hobbie[count][1]);
		$("#hobbie-desc").html(hobbie[count][2]);
		
		hobbie_frame.forEach(function (h, i) {
			$(h).fadeIn();
		});
		
		slider_timer = setInterval(function(){
		gotToPage(1);
	}, 10000);
	}
	
	function getCount(c) {
		count = count + c;
		if(count < 0){
			count = 2; 
		}
		else if(count > 2){
			count = 0;
		}
	}
	
	var slider_timer = setInterval(function(){
		gotToPage(1);
	}, 10000);
});