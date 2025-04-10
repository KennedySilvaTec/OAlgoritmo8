modelfilestrs['orient'] = hereDoc(function(){/*!
<script type="text/javascript">

 
	// pageChanged & sizeChanged functions are needed in every model file
	// other functions for model should also be in here to avoid conflicts
	var orient = new function() {		
		// function called every time the page is viewed after it has initially loaded
		this.pageChanged = function() {
			
		}
		
		// function called every time the size of the LO is changed
		this.sizeChanged = function() {
			
		}
		
		this.init = function() {
			// if language attributes aren't in xml will have to use english fall back
			var goalsHeader = x_currentPageXML.getAttribute("goalsHeader");
			if (goalsHeader == undefined) {
				goalsHeader = "Aims and Objectives";
			}
			var audienceHeader = x_currentPageXML.getAttribute("audienceHeader");
			if (audienceHeader == undefined) {
				audienceHeader = "Target Audience";
			}
			var prereqHeader = x_currentPageXML.getAttribute("prereqHeader");
			if (prereqHeader == undefined) {
				prereqHeader = "Pre-requisites";
			}
			var howtoHeader = x_currentPageXML.getAttribute("howtoHeader");
			if (howtoHeader == undefined) {
				howtoHeader = "How to use this resource";
			}
			
			$("#pageContents").html("<h3>" + goalsHeader + "</h3><p>" + x_addLineBreaks(x_currentPageXML.getAttribute("goals")) + "</p><br/><h3>" + audienceHeader + "</h3><p>" + x_addLineBreaks(x_currentPageXML.getAttribute("audience")) + "</p><br/><h3>" + prereqHeader + "</h3><p>" + x_addLineBreaks(x_currentPageXML.getAttribute("prereq")) + "</p><br/><h3>" + howtoHeader + "</h3><p>" + x_addLineBreaks(x_currentPageXML.getAttribute("howto")) + "</p><br/>");
			
			// call this function in every model once everything's loaded
			x_pageLoaded();
		}
	}
	
	orient.init();
	
</script>


<div id="pageContents">
	
</div>

*/});