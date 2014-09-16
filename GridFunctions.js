
//Fill in the initial grid. Both army icons and matchup quality
function DrawMatchupGrid(isEditGrid, opposingTeamId)
{
	var data = localStorage.getObject ("Team");
	
	var gridId = "#viewMatchupsTable";
	if (isEditGrid)
		gridId = "#editMatchupsTable";
		
	//Add our armies
	$.each(data.Armies, function(key, value) { 
		$(gridId + " #Player" + key).html("<img src='images/" + value + ".png' class='matchupIcon'/>");
	});
	
	if (data.Opponents[opposingTeamId].LeadoutArmy !== undefined &&  data.Opponents[opposingTeamId].LeadoutArmy !== null)
		$(gridId + " #Player" + data.Opponents[opposingTeamId].LeadoutArmy + " img").addClass("leadout");
	
	//Add the opposing armies and matchups
	$.each(data.Opponents[opposingTeamId].Armies, function(key, value) { 
	
		$(gridId + " #OpposingPlayer" + key + " .matchupIcon").attr("src", "images/" + value.Name + ".png");
		
		var $armyDescription = $(gridId + " #OpposingPlayer" + key + " .armyDescription");
		$armyDescription.html(value.Description);
		
		if (value.Description && value.Description != "")
		{		
			var offset = ($armyDescription.parent().width() - $armyDescription.width()) / 2;			
			$armyDescription.css({left: offset});
		}
				
		RefreshMatchupGridColumn(isEditGrid, key, value);
	});
}

//This refreshes all matchups in the grid to take into account changes input by the user
function RefreshMatchupGrid(isEditGrid, opposingTeamId)
{
	var data = localStorage.getObject ("Team");
		
	//Loop through all the matchups and draw the grid
	$.each(data.Opponents[opposingTeamId].Armies, function(key, value) { 

		RefreshMatchupGridColumn(isEditGrid, key, value);
	});
}

//This draws all matchups against one of a given opponants armies
function RefreshMatchupGridColumn(isEditGrid, index, opposingArmy)
{
	var gridId = "#viewMatchupsTable";
	if (isEditGrid)
		gridId = "#editMatchupsTable";
		
	var i; 
	for (i = 0; i < 5; ++i)
	{
		if (!opposingArmy.Matchups[i])
			$(gridId + " #Matchup" + index + i).removeClass().addClass("matchup").html("");	
		else
		{
			//Check if there are scenario specific matchups
			var hasScenarioMatchup = false;			
			
			if (opposingArmy.Matchups[i].Scenarios && opposingArmy.Matchups[i].Scenarios.length > 0)
				hasScenarioMatchup = true;

		
			//Draw sub matchups on the edit grid if appropriate
			if (isEditGrid && hasScenarioMatchup)
			{
				var contents = "<div class='" + opposingArmy.Matchups[i].Quality + " subMatchup'>&nbsp;</div>";
				contents += "<div class='" + opposingArmy.Matchups[i].ScenarioQuality + " scenarioSubMatchup'>&nbsp;</div>";
						
				$(gridId + " #Matchup" + index + i).removeClass().addClass("subMatchupContainer").html(contents);
			}
			
			//Draw a scenario specific matchup on the view grid if that scenario is selected
			else if (!isEditGrid && 
					hasScenarioMatchup &&
					$("#viewScenarioTable .selected").length == 1 &&
					$.inArray($("#viewScenarioTable .selected").text(), opposingArmy.Matchups[i].Scenarios) > -1)
				
				$(gridId + " #Matchup" + index + i).removeClass().addClass("matchup " + opposingArmy.Matchups[i].ScenarioQuality).html("");		
			
			//Otherwise just draw a regular matchup
			else			
				$(gridId + " #Matchup" + index + i).removeClass().addClass("matchup " + opposingArmy.Matchups[i].Quality).html("");
		}
	}
}


//Hide matchups
function ToggleMatchupVisibility(isColumn, index)
{
	var side = "Us";
	if (isColumn)
		side = "Them";

	var i; 
	for (i = 0; i < 5; ++i)
	{
		var matchup = "#viewMatchupsTable #Matchup" + i + index;
		if (isColumn)
			matchup = "#viewMatchupsTable #Matchup" + index + i;	
			
		if ($(matchup).children().length == 0)
			$(matchup).toggleClass("usedBy" + side);
		else
			$(matchup).toggleClass("subMatchupUsedBy" + side);
	}
}


//This draws out the 6 selected scenarios
function DrawScenarioGrid()
{
	var data = localStorage.getObject ("Team");
	
	//Show all the good scenarios
	$.each(data.Scenarios, function(key, value) { 
	
		$("#viewScenarioTable .scenario:eq(" + key + ")").removeClass("selected").text(value);
	});
}

//This removes the currently selected scenario
function ClearScenarioGrid()
{
	$("#viewScenarioTable .selected").removeClass("selected");
}
