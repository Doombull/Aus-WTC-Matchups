
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
	
		$(gridId + " #OpposingPlayer" + key).html("<img src='images/" + value.Name + ".png' class='matchupIcon'/>");
		RefreshMatchupGridColumn(isEditGrid, key, value);
	});
}

//This refreshes all matchups in the grid to take into account changes input by the user
function RefreshMatchupGrid(isEditGrid, opposingTeamId)
{
	var data = localStorage.getObject ("Team");
	
	var gridId = "#viewMatchupsTable";
	if (isEditGrid)
		gridId = "#editMatchupsTable";
		
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
			var hasScenarioMatchup = false;
			
			//Check if there are scenario specific matchups
			if (opposingArmy.Matchups[i].Scenarios && opposingArmy.Matchups[i].Scenarios.length > 0)
			{
				//If so, see if at least one of those scenarios are still active
				if (isEditGrid)
					hasScenarioMatchup = true;
				else
				{
					var j;
					for (j = 0; j < opposingArmy.Matchups[i].Scenarios.length; ++j)
					{
						if (!($("#viewScenarioTable tbody tr td#" + opposingArmy.Matchups[i].Scenarios[j]).hasClass("inactive")))
						{
							hasScenarioMatchup = true;
							break;
						}
					}
				}				
			}
		
			//Draw the matchup
			if (hasScenarioMatchup)
			{
				var contents = "<div class='" + opposingArmy.Matchups[i].Quality + " subMatchup'>&nbsp;</div>";
				contents += "<div class='" + opposingArmy.Matchups[i].ScenarioQuality + " scenarioSubMatchup'>&nbsp;</div>";
						
				$(gridId + " #Matchup" + index + i).removeClass().addClass("subMatchupContainer").html(contents);
			}
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






//This refreshes all matchups in the grid to take into account changes input by the user
function RefreshScenarioGrid(isEditGrid, opposingTeamId)
{
	var data = localStorage.getObject ("Team");

	var gridId = "#viewScenarioTable";
	if (isEditGrid)
		gridId = "#editScenarioTable";
		
	//clear the old entries
	$(gridId + " tbody tr td:first-child").html("");
	$(gridId + " tbody tr td:last-child").html("");
	
	//Show all the good scenarios
	$.each(data.GoodScenarios, function(key, scenario) { 

		$.each(scenario.Armies, function(key, army) { 

			DrawScenarioIcon(gridId, scenario.Name, data.Armies[army], true);
		});
	});
	
	//Show all the bad scenarios
	$.each(data.BadScenarios, function(key, scenario) { 

		$.each(scenario.Armies, function(key, army) { 

			DrawScenarioIcon(gridId, scenario.Name, data.Armies[army], false);
		});
	});
	
	//Show the ones specific to this opponent
	if (!isEditGrid)
	{
		//Fill in the good and bad scenarios
		$.each(data.Opponents[opposingTeamId].Armies, function(armyIndex, army) { 

			if (army)
			{
				$.each(army.Matchups, function(matchupIndex, matchup) { 

					if (matchup)
					{
						$.each(matchup.Scenarios, function(scenarioIndex, scenario) { 
							
							DrawScenarioIcon(gridId, scenario, data.Armies[matchupIndex], false);
						
						});	
					}
				});	
			}
		});	
	}
}


function DrawScenarioIcon(gridId, scenario, army, isGood)
{
	var cellPos = 2;
	if (isGood)
		cellPos = 0;

	var $matchupCell = $(gridId + " tbody tr:has(td#" + scenario + ") td:eq(" + cellPos + ")");

	if ($matchupCell.find("img." + army).length == 0)						
		$matchupCell.append("<img src='images/" + army + ".png' class='scenarioIcon " + army + "'/>");	
}