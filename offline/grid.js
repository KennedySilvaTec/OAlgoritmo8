modelfilestrs['grid'] = hereDoc(function(){/*!
<script type="text/javascript">

	// pageChanged & sizeChanged functions are needed in every model file
	// other functions for model should also be in here to avoid conflicts
	var grid = new function() {
		var fixedRows = [],
			fixedCols = [],
			fixedCells = [],
			timeout,
			labelData = [],
			separator = "|",
			$pageContents,
            checked = false;
		var numOfQuestions = 0, correct = 0;

		// function called every time the page is viewed after it has initially loaded
		this.pageChanged = function() {
			labelData = $("#pageContents").data("labelData");
			$pageContents = $("#pageContents");
			$("#checkBtn").show();
			$(".ui-draggable").draggable("enable");
			this.removeFocus();
		}

		// function called every time the size of the LO is changed
		this.sizeChanged = function() {

		}

        this.leavePage = function()
        {
            if (!this.checked)
            {
                this.showFeedBackandTrackScore();
            }
        };

        this.showFeedBackandTrackScore = function()
        {
            // there are loads of variations on how we could mark this - at the moment it has to be in exact position (taking identical labels into account)
            // maybe at some point add an option to editor for how they want it marked (e.g. mark correct if in correct row but order in row irrelevant)
            var Correct = true,
                l_options = [],
                l_answers = [],
                l_feedbacks = [],
                l_answer,
                l_option,
                l_feedback,
                counter = 0;
                this.allCorrect = true;
            $("#grid").find("ul:not(.preview) li:not(.static)").each(function() {
                Correct = true;
                var $this = $(this);
                var columnLength = x_currentPageXML.getAttribute("data").split("||")[0].split("|").length;
                var xPos = ($this.index() % columnLength) + 1;
                var yPos = (Math.floor($this.index() / columnLength)) + 1;
                l_answer = ($this.text().trim() + " --> [" + yPos + "," + xPos + "]");
                l_option = {source: $this.text().trim(),target: "[" + xPos + "," + yPos + "]"};

                if ($this.data("correct") == $this.index() || labelData[$("#grid .listHolder").index($this.parents(".listHolder"))][$this.index()] == $this.html()) {
					$this.append('<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("tick")[0], "label", "Correct") + '</span><span class="result fa fa-fw fa-x-tick"></span></span>');
                    numOfQuestions++;
                    correct++;
                    l_option.result = true;
                    l_feedback = "Correct";
                } else {
                    Correct = false;
					$this.append('<span class="tick"><span class="ui-helper-hidden-accessible">' + x_getLangInfo(x_languageData.find("cross")[0], "label", "Incorrect") + '</span><span class="result fa fa-fw fa-x-cross"></span></span>');
                    numOfQuestions++;
                    l_option.result = false;
                    l_feedback = "Incorrect";
                    this.allCorrect = false;
                }
                l_options.push(l_option);
                l_answers.push(l_answer);
                l_feedbacks.push(l_feedback);
                counter++;
            });
            var result = {
                success: this.allCorrect,
                score: ((correct/numOfQuestions)*100.0)
            };
            XTExitInteraction(x_currentPage, 0, result, l_options, l_answers, l_feedbacks, x_currentPageXML.getAttribute("trackinglabel"));


            if(XTGetMode() == "normal") {
                $("#checkBtn").hide();
                $(".ui-draggable").draggable("disable");
            }
            XTSetPageScore(x_currentPage, ((correct/numOfQuestions)*100.0), x_currentPageXML.getAttribute("trackinglabel"));
        };

		this.init = function() {
		    this.checked = false;
			$pageContents = $("#pageContents");

			$("#textHolder").html(x_addLineBreaks(x_currentPageXML.getAttribute("text")));
			if (x_currentPageXML.getAttribute("feedback") != undefined && x_currentPageXML.getAttribute("feedback") != "") {
				$("#feedback")
					.html(x_addLineBreaks(x_currentPageXML.getAttribute("feedback")))
					.hide();
			} else {
				$("#feedback").remove();
			}

			if (x_currentPageXML.getAttribute("align") == "top") {
				$("#gridHolder")
					.appendTo($pageContents)
					.css({
						"margin":"auto",
						"margin-top":"10px"
					});
				$("#feedback").appendTo($pageContents);
				$("#btnHolder").appendTo($pageContents);
			} else if (x_currentPageXML.getAttribute("align") == "right") {
				$("#gridHolder")
					.addClass("x_floatLeft")
			} else if (x_currentPageXML.getAttribute("align") == "left") {
				$("#gridHolder")
					.addClass("x_floatRight")
				$("#btnHolder").appendTo($pageContents)
						.addClass("x_floatRight")
			}

			$("#checkBtn")
				.button({label:	x_currentPageXML.getAttribute("checkBtnTxt") != undefined ? x_currentPageXML.getAttribute("checkBtnTxt") : "Check Answers"})
				.click(function() {
                    if ($(this).data("state") == "check") {
                        grid.removeFocus();
				        grid.showFeedBackandTrackScore();
                        if (grid.allCorrect == true) {
                            $(this)
                                .button({label: x_currentPageXML.getAttribute("resetBtnTxt") != undefined ? x_currentPageXML.getAttribute("resetBtnTxt") : "Reset"})
                                .data("state", "reset");
                            $("#feedback").show();
                            $("#grid .listHolder ul li.ui-draggable")
                                .draggable( "option", "disabled", true )
                                .off("focusin focusout keypress");
                        }
                    } else {
                        $(this)
                            .button({label:	x_currentPageXML.getAttribute("checkBtnTxt") != undefined ? x_currentPageXML.getAttribute("checkBtnTxt") : "Check Answers"})
                            .data("state", "check");

                        $("#feedback").hide();
                        $("#grid .tick").remove();
                        $("#grid .listHolder ul li.ui-draggable")
                            .draggable( "option", "disabled", false )
                            .on("focusin focusout keypress"); //
                        grid.randomiseLabels();
                    }
                })
				.data("state", "check");

			if (x_currentPageXML.getAttribute("url") != undefined && x_currentPageXML.getAttribute("url") != "") {
				$.ajax({
					type: "GET",
					url: x_evalURL(x_currentPageXML.getAttribute("url")),
					dataType: "text",
					success: function(csv) {
						var csvData = csv.split("\r\n");
						if (csvData[csvData.length-1] == "") {
							csvData.splice(csvData.length-1, 1);
						}
						separator = ","
						grid.sortData(csvData);
					},
					error: function () {
						grid.sortData(x_currentPageXML.getAttribute("data").split("||"), false);
					}
				});
			} else {
				grid.sortData(x_currentPageXML.getAttribute("data").split("||"), false);
			}
			this.initTracking();
			// call this function in every model once everything has loaded
			x_pageLoaded();
		}

		this.sortData = function(data) {
			var $grid = $("#grid"), $ul, $holder, row,
				$gridBorders = $("#gridBorders"), $tr;

			// rows, columns & individual labels can be fixed
			var tempR = x_currentPageXML.getAttribute("fixedRows") != undefined ? x_currentPageXML.getAttribute("fixedRows").split(",") : [],
				tempC = x_currentPageXML.getAttribute("fixedCols") != undefined ? x_currentPageXML.getAttribute("fixedCols").split(",") : [],
				tempCE = x_currentPageXML.getAttribute("fixedCells") ? x_currentPageXML.getAttribute("fixedCells").split("|") : [],
				i, j;

			for (i=0; i<tempR.length; i++) {
				if ($.isNumeric(tempR[i])) {
					fixedRows.push(Number(tempR[i]) - 1);
				}
			}

			if (x_currentPageXML.getAttribute("header") == "row" || x_currentPageXML.getAttribute("header") == "both") {
				$gridBorders.addClass("header");
				if ($.inArray(0, fixedRows) == -1) {
					fixedRows.push(0);
				}
			}

			for (i=0; i<tempC.length; i++) {
				if ($.isNumeric(tempC[i])) {
					fixedCols.push(Number(tempC[i]) - 1);
				}
			}

			if (x_currentPageXML.getAttribute("header") == "col" || x_currentPageXML.getAttribute("header") == "both") {
				$gridBorders.addClass("headerCol");
				if ($.inArray(0, fixedCols) == -1) {
					fixedCols.push(0);
				}
			}

			for (i=0; i<tempCE.length; i++) {
				var cells = tempCE[i].split(",");
				if (cells.length == 2) {
					if ($.isNumeric(cells[0]) && $.isNumeric(cells[1])) {
						fixedCells.push([Number(cells[0]) - 1, Number(cells[1]) - 1]);
					}
				}
			}

			// create labels - each label is a li with its parent ul determining which labels it can be sorted/swapped with
			// labels can be constrained to their row or column, or can be placed anywhere
			if (x_currentPageXML.getAttribute("constrain") == "col") {
				for (i=0; i<data.length; i++) {
					row = data[i].split(separator);
					$tr = $('<tr/>').appendTo($gridBorders);

					if (i == 0) {
						for (j=0; j<row.length; j++) {
							$holder = $('<div class="listHolder constrainC"></div>').appendTo($grid);
							$('<ul></ul>').appendTo($holder);
							labelData.push([]);
						}
					}
					for (j=0; j<row.length; j++) {
						this.addLabel(row[j], $grid.find(".listHolder:eq(" + j + ") ul"), i, j);
						$tr.append('<td/>');
					}
				}

				// labels on each column should be same width & all labels should be same height...
				var maxW, maxH = 0;
				$grid.find("ul").each(function() {
					maxW = 0;
					$(this).find("li").each(function(i) {
						maxW = Math.max(maxW, $(this).width());
						if ($.inArray(i,fixedRows) == -1) {
							maxH = Math.max(maxH, $(this).height());
						}
					}).width(maxW + 5 + "px");
				}).find("li")
					.height(maxH + "px");

				// ...unless they're in a fixed row when they must just have same height as other labels on that row
				for (i=0; i<fixedRows.length; i++) {
					maxH = 0;
					$grid.find("ul li:eq(" + fixedRows[i] + ")").each(function() {
						$(this).css("height", "");
						maxH = Math.max(maxH, $(this).height());
					}).height(maxH + "px");
				}

			} else if (x_currentPageXML.getAttribute("constrain") == "row") {
				for (i=0; i<data.length; i++) {
					$holder = $('<div class="listHolder constrainR"></div>').appendTo($grid);
					$ul = $('<ul/>').appendTo($holder);
					labelData.push([]);
					row = data[i].split(separator);
					$tr = $('<tr/>').appendTo($gridBorders);

					for (j=0; j<row.length; j++) {
						this.addLabel(row[j], $ul, i, j);
						$tr.append('<td/>');
					}
				}

				// labels on each row should be same height & all labels should be same width...
				var maxW = 0, maxH;
				$grid.find("ul").each(function() {
					maxH = 0;
					$(this).find("li").each(function(i) {
						maxH = Math.max(maxH, $(this).height());
						if ($.inArray(i,fixedCols) == -1) {
							maxW = Math.max(maxW, $(this).width());
						}
					}).height(maxH + "px");
				}).find("li")
					.width(maxW + 5 + "px");

				// ...unless they're in a fixed column when they must just have same width as other labels on that column
				for (i=0; i<fixedCols.length; i++) {
					maxW = 0;
					$grid.find("ul").find("li:eq(" + fixedCols[i] + ")").each(function() {
						$(this).css("width", "");
						maxW = Math.max(maxW, $(this).width());
					}).width(maxW + 5 + "px");
				}

			} else {
				$holder = $('<div class="listHolder"></div>').appendTo($grid);
				$ul = $('<ul/>').appendTo($holder);
				labelData.push([]);

				for (i=0; i<data.length; i++) {
					row = data[i].split(separator);
					$tr = $('<tr/>').appendTo($gridBorders);

					for (j=0; j<row.length; j++) {
						this.addLabel(row[j], $ul, i, j);
						$tr.append('<td/>');
					}
				}

				// every label should be same width & height...
				var maxW = 0, maxH = 0;
				$grid.find("ul li").each(function(i) {
					if ($.inArray($(this).data("xy")[0],fixedCols) == -1) {
						maxW = Math.max(maxW, $(this).width());
					}
					if ($.inArray(i,fixedRows) == -1) {
						maxH = Math.max(maxH, $(this).height());
					}
				})
				  .width(maxW + 5 + "px")
				  .height(maxH + "px");

				// ...unless they're in a fixed column/row when they must just have same width/height as other labels on that column/row
				for (i=0; i<fixedCols.length; i++) {
					maxW = 0;
					var $labels = $([]);
					$grid.find("ul li.static").each(function() {
						if ($(this).data("xy")[0] == fixedCols[i]) {
							$(this).css("width", "");
							maxW = Math.max(maxW, $(this).width());
							if ($labels == undefined) { $labels = $(this); } else { $labels = $labels.add($(this));}
						}
					});
					$labels.width(maxW + 5 + "px");
				}

				for (i=0; i<fixedRows.length; i++) {
					maxH = 0;
					var $labels = $([]);
					$grid.find("ul li.static").each(function() {
						if ($(this).data("xy")[1] == fixedRows[i]) {
							$(this).css("height", "");
							maxH = Math.max(maxH, $(this).height());
							if ($labels == undefined) { $labels = $(this) } else { $labels = $labels.add($(this)); }
						}
					});
					$labels.height(maxH);
				}
			}

			$pageContents.data("labelData", labelData);

			// insert rows & cells that make up grid borders (has to be overlaid as the swapping of labels would be too complicated if labels were really in the table)
			$gridBorders.insertBefore($grid);

			// fix width of grid so the correct amount of labels are on each row
			if (x_currentPageXML.getAttribute("constrain") != "col") {
				var $li = $grid.find("li"),
					rowW = 0;
				for (i=0; i<data[0].split(separator).length; i++) {
					rowW += $grid.find("li:eq(" + i + ")").width();
				}
				$grid.find("ul").width(rowW + (((parseInt($li.css("padding-left")) + parseInt($li.css("margin-left")) + parseInt($li.css("border-left-width"))) * 2) * data[0].split(separator).length));
			}

			// style borders & match their size to grid labels
			if (x_currentPageXML.getAttribute("style") != "none") {
				$gridBorders.addClass(x_currentPageXML.getAttribute("style"));

				if (x_currentPageXML.getAttribute("constrain") != "col") {
					$gridBorders.width($grid.find("ul:eq(0)").width());
					$gridBorders.find("tr:eq(0) td").each(function(i) {
						$(this).width($grid.find("ul:eq(0) li:eq(" + i + ")").width());
					});

					if (x_currentPageXML.getAttribute("constrain") == "row") {
						$gridBorders.find("tr").each(function(i) {
							$(this).height($grid.find("ul:eq(" + i + ") li:eq(0)").outerHeight(true));
						});
					} else {
						var num = data[0].split(separator).length;
						$gridBorders.find("tr").each(function(i) {
							for (j=0; j<data.length; j++) {
								rowW += $grid.find("li:eq(" + i + ")").width();
								$(this).height($grid.find("li:eq(" + j * num + ")").outerHeight(true));
							}
						});
					}
				} else {
					var totalW = 0;
					$grid.find("ul").each(function() {
						totalW += $(this).width();
					});
					$gridBorders
						.width(totalW)
						.find("tr:eq(0) td").each(function(i) {
							$(this).width($grid.find("ul:eq(" + i + ") li:eq(0)").width());
						});
					$gridBorders.find("tr").each(function(i) {
						$(this).height($grid.find("li:eq(" + i + ")").outerHeight(true) - 5);
					});
				}

				// additional styling of table - shade alternative rows / shade headers etc.
				if (x_currentPageXML.getAttribute("shadeHeader") == "true") {
					$gridBorders.addClass("shaded");
				}

				if (x_currentPageXML.getAttribute("shade") == "true") {
					$gridBorders.find("tr").each(function() {
						var $this = $(this),
							thisIndex = $this.index();
						if ($gridBorders.hasClass("header") && $gridBorders.hasClass("shaded")) { // shade even no. rows, except for 1st row
							if (thisIndex%2 == 0 && thisIndex != 0) {
								$this.addClass("shaded");
							}
						} else if (thisIndex%2 != 0) { // shade odd no. rows
							$this.addClass("shaded");
						}
					});
				}

				if ((x_currentPageXML.getAttribute("header") == "col" || x_currentPageXML.getAttribute("header") == "both") && x_currentPageXML.getAttribute("shadeHeader") == "true") {
					$gridBorders.find("tr td:first-child").addClass("header");
				}

				$grid.width($gridBorders.width() + 2);

			} else {
				$gridBorders.remove();
				if (x_currentPageXML.getAttribute("constrain") != "col") {
					$grid.width($grid.find("ul:eq(0)").width());
				} else {
					var totalW = 0;
					$grid.find("ul").each(function() {
						totalW += $(this).width();
					});
					$grid.width(totalW);
				}
			}

			$("#gridHolder")
				.width($grid.width())
				.height($grid.height());

			this.randomiseLabels();

			// create duplicate labels used to show previews when dragging the real labels
			$grid.find("ul").each(function() {
				$(this).clone()
					.insertBefore($(this))
					.addClass("preview")
					.find("li")
						.css("visibility", "hidden")
						.removeClass("shadow");
			});

			var tabIndex = 3;

			// this uses draggable & droppable rather than sortable as sortable doesn't deal with fixed labels well
			$grid
				.find("ul:not(.preview) li:not(.static)")
					.draggable({
						stack:	"#grid ul:not(.preview) li", // item being dragged is always on top (z-index)
						revert:	"invalid", // snap back to original position if not dropped on target
						start:	function() {
							grid.removeFocus();

							$(this)
								.removeClass("shadow")
								.addClass("panel");

							$grid.find(".tick").hide();
						},
						stop:	function() {
							$(this)
								.removeClass("panel")
								.addClass("shadow");
						}
						})

					// set up events used when keyboard rather than mouse is used
					.on("focusin", function() {
						var $this = $(this);
						if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") { // a label has been selected...
							if ($this.is($pageContents.data("selectedLabel")) == false) { // ...it's not the label in focus...
								if ($this.parent().is($pageContents.data("selectedLabel").parent())) { // ... and the label in focus can have the selected label dropped on it
									grid.overEvent($this, $pageContents.data("selectedLabel"));
									$this
										.html($pageContents.data("selectedLabel").html())
										.addClass("selected");
								} else {
									$this.addClass("focus");
								}
							}

						} else {
							$this.addClass("focus");
						}
						})
					.on("focusout", function() {
						var $this = $(this);
						$this.removeClass("focus selected");
						if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "" && $this.is($pageContents.data("selectedLabel")) == false) {
							if ($this.parent().is($pageContents.data("selectedLabel").parent())) {
								grid.outEvent($this, 0);
								$this.html(labelData[$("#grid .listHolder").index($this.parents(".listHolder"))][$this.data("correct")]);
							}
						}
						})
					.on("keypress", function(e) {
						var charCode = e.charCode || e.keyCode;
						if (charCode == 32) {
							var $this = $(this);
							if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") { // a label has been selected...
								if ($this.is($pageContents.data("selectedLabel")) == false) { // ...it's not the label in focus...
									if ($this.parent().is($pageContents.data("selectedLabel").parent())) { // ... and the label in focus can have the selected label dropped on it
										$this.html(labelData[$("#grid .listHolder").index($this.parents(".listHolder"))][$this.data("correct")]);

										$pageContents.data("selectedLabel")
											.removeClass("selected")
											.addClass("focus");

										$this.removeClass("focus");

										grid.dropEvent($this, $pageContents.data("selectedLabel"));
									}

								} else {
									$this
										.removeClass("selected")
										.addClass("focus");
								}

								$pageContents.data("selectedLabel", "");

							} else {
								$this
									.removeClass("focus")
									.addClass("selected");

								$pageContents.data("selectedLabel", $this);
							}
						}
					})
					.disableSelection()
					.each(function(i) {
						$(this).attr({
							"tabindex"	:tabIndex
						});
						tabIndex++;
					});

			$grid.find("ul:not(.preview) li:not(.static)")
				.droppable({
					accept:	function($dragged) {
						if ($(this).parent()[0] == $dragged.parent()[0]) {
							return true;
						}},
					drop:	function(event, ui) {
						grid.dropEvent($(this), ui.draggable);
						},
					over:	function(event, ui) {
						grid.overEvent($(this), ui.draggable);
						},
					out:	function() {
						grid.outEvent($(this), 200);
					},
					hoverClass:	"ui-state-highlight"
					});

			$grid.find("ul li").css("color",$x_body.css("color")); // override jquery ui style
		}

		this.addLabel = function(txt, $parent, i, j) {
			var $li = $('<li>' + txt + '</li>')
				.appendTo($parent)
				.addClass("ui-state-default");

			if (i == 0 && (x_currentPageXML.getAttribute("header") == "row" || x_currentPageXML.getAttribute("header") == "both")) {
				$li.addClass("header static");
			} else if (j == 0 && (x_currentPageXML.getAttribute("header") == "col" || x_currentPageXML.getAttribute("header") == "both")) {
				$li.addClass("header static");
			} else {
				if ($.inArray(i,fixedRows) >= 0 || $.inArray(j,fixedCols) >= 0) {
					$li.addClass("static");
				} else {
					for (var k=0; k<fixedCells.length; k++) {
						if (j == fixedCells[k][0] && i == fixedCells[k][1]) {
							$li.addClass("static");
						}
					}
				}
			}

			if (!$li.hasClass("static")) {
				$li.addClass("shadow");
			}

			$li
			 .data({
				"correct" : $li.index(),
				"xy" : [j,i]
			 });

			labelData[$parent.parent().index()].push(txt);
		}

		// randomise labels (keeping fixed ones in correct place)
		this.randomiseLabels = function() {
			$("#grid").find("ul").each(function(i) {
				var fixedLabels = $(this).find("li.static"),
					$ul = $(this);

				$ul.find("li.static").detach();

				var labels = $ul.children("li");
				labels = x_shuffleArray(labels);
				$ul.children("li").detach();
				for (var i=0; i<labels.length; i++) {
					$ul.append(labels[i]);
				}

				fixedLabels.each(function() {
					if ($ul.find("li").length <= $(this).data("correct")) {
						$ul.append($(this));
					} else {
						$ul.find("li:eq(" + ($(this).data("correct")) + ")").before($(this));
					}
				});
			});
		}

		this.overEvent = function($this, draggable) {
			clearTimeout(timeout);
			var $thisParent = $this.parent();

			if (x_currentPageXML.getAttribute("drag") == "insert") {
				// show preview for all labels that will be moved
				var toPreview = [], newTxt = [],
					indexDrag = draggable.index(),
					indexDrop = $this.index(),
					lowest = Math.min(indexDrop, indexDrag),
					highest = Math.max(indexDrag, indexDrop);

				$this.parent().find("li").css("visibility", "visible");
				$this.parent().prev(".preview").find("li").css("visibility", "hidden");

				for (var i=0; i<highest - lowest + 1; i++) {
					if (!$thisParent.find("li:eq(" + (i + lowest) + ")").hasClass("static")) {
						toPreview.push(i + lowest);
						newTxt.push(i + lowest);
					}
				}
				toPreview.splice(lowest == indexDrag ? toPreview.length-1 : 0, 1);
				newTxt.splice(lowest == indexDrag ? 0 : newTxt.length-1, 1);

				for (i=0; i<toPreview.length; i++) {
					$thisParent.prev(".preview").find("li:eq(" + toPreview[i] + ")")
						.html($thisParent.find("li:eq(" + newTxt[i] + ")").html())
						.css("visibility", "visible");

					var $label = $thisParent.find("li:eq(" + toPreview[i] + ")");
					if ($label[0] != draggable[0]) {
						$label.css("visibility", "hidden");
					}
				}

			} else {
				// show preview for two labels that will be swapped
				$thisParent.prev(".preview").find("li:eq(" + draggable.index() + ")")
					.css("visibility","visible")
					.html($this.html());

				if ($pageContents.data("selectedLabel") != undefined && $pageContents.data("selectedLabel") != "") {
					$pageContents.data("selectedLabel").css("visibility", "hidden");
				}
			}
		}

		this.outEvent = function($this, time) {
			// slight delay in removing previews on roll over to avoid flickers over gaps between labels
			timeout = setTimeout(function () {
				$this.parent().find("li").css("visibility", "visible");
				$this.parent().prev(".preview").find("li").css("visibility", "hidden");
			}, time);
		}

		this.dropEvent = function($this, draggable) {
			this.removeFocus();

			if (x_currentPageXML.getAttribute("drag") == "insert") {
				// insert dragged label into list
				if (draggable.index() > $this.index()) {
					draggable.insertBefore($this);
				} else {
					draggable.insertAfter($this);
				}
				draggable.css({"top":"auto","left":"auto"});

				// adjust position of fixed labels
				var fixedLabels = $this.parent().find("li.static"),
					$ul = $this.parent();

				fixedLabels.detach();
				fixedLabels.each(function() {
					if ($ul.find("li").length <= $(this).data("correct")) {
						$ul.append($(this));
					} else {
						$ul.find("li:eq(" + ($(this).data("correct")) + ")").before($(this));
					}
				});

			} else {
				// swap dragged label with label it's dropped on
				var index = $this.index();
				$this.insertBefore(draggable);
				if ($this.index() < index) {
					draggable.insertAfter($this.parent().find("li")[index]);
				} else if (index != 0) {
					draggable.insertAfter($this.parent().find("li")[index - 1]);
				} else {
					draggable.insertBefore($this.parent().find("li")[index]);
				}

				draggable.css({"top":"auto","left":"auto"});
			}

			var tabIndex = 3;
			$("#grid ul:not(.preview) li:not(.static)").each(function(i) {
				$(this).attr({
					"tabindex"	:tabIndex
				});
				tabIndex++;
			});
		}

		this.removeFocus = function() {
			$pageContents.data("selectedLabel", "");

			$("#grid ul.preview li").css("visibility","hidden");
			$("#grid ul:not(.preview) li")
				.each(function() {
					var $this = $(this)
					$this.html(labelData[$("#grid .listHolder").index($this.parents(".listHolder"))][$this.data("correct")]);
				})
				.css("visibility","visible")
				.blur()
				.removeClass("focus selected");
		}
	//Starting the tracking
	this.initTracking = function() {
		// Track the dictation page
		this.weighting = 1.0;
		if (x_currentPageXML.getAttribute("trackingWeight") != undefined)
		{
			this.weighting = x_currentPageXML.getAttribute("trackingWeight");
		}

		correctOptions = [];
		correctAnswer = [];
		correctFeedback = [];
		rows = x_currentPageXML.getAttribute("data").split("||");
		rowCount = 1;
		for(row in rows)
		{
			columnCount = 1;
			columns = rows[row].split("|");
			for(column in columns)
			{
				if((x_currentPageXML.getAttribute("fixedCells") == undefined || x_currentPageXML.getAttribute("fixedCells").indexOf(columnCount + "," + rowCount) == -1) &&
						(x_currentPageXML.getAttribute("fixedRows") == undefined || x_currentPageXML.getAttribute("fixedRows").indexOf(rowCount) == -1) &&
						(x_currentPageXML.getAttribute("fixedCols") == undefined || x_currentPageXML.getAttribute("fixedCols").indexOf(columnCount) == -1))
				{
					correctAnswer.push(columns[column] + " --> [" + columnCount + "," + rowCount +"]");
					correctFeedback.push("Correct");
					correctOption = {source:columns[column], target: "[" + columnCount + "," + rowCount + "]"};
					correctOptions.push(correctOption);
				}
				columnCount++;

			}
			rowCount++;
		}
		XTSetPageType(x_currentPage, 'numeric', 1, this.weighting);
		XTEnterInteraction(x_currentPage, 0, 'match', x_currentPageXML.getAttribute("name"), correctOptions, correctAnswer, correctFeedback, x_currentPageXML.getAttribute("grouping"));
		
	}
}

	
	grid.init();
	
</script>


<div id="pageContents">
	
	<div id="gridHolder">
		<table id="gridBorders"/>
		<div id="grid"/>
	</div>
	<div id="btnHolder">
		<button style="float:right" id="checkBtn" tabindex="2"></button>
	</div>
	<div id="otherContent">
		<div id="textHolder" tabindex="1"/>
		<div id="feedback"/>
	</div>
	
</div>

*/});