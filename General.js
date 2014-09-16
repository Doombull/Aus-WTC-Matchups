
var _OpposingTeamId;

$(document).ready(function() {

	$(".accordion").accordion({	fillSpace: true });
	$("button").button();
	
	RefreshPage();
});

function RefreshPage()
{
	PopulateOpponantList();
	DrawScenarioGrid();
	ExportData();
}



<!-- ******************************** -->
<!--       Navigation controls        -->
<!-- ******************************** -->
$(document).ready(function() {

	$(".tab").click(function (event) {
			tabClick($(this).prevAll().length, 'average');
		});

	tabClick(0, 0);
});

function tabClick(index, animationSpeed) {

	$(".tab:eq(" + index + ")").addClass('active');
	$(".tab:not(:eq(" + index + "))").removeClass('active');

	$('div.contentPanel:visible').slideUp(animationSpeed);
	$('div.contentPanel:eq(' + index + ')').slideDown(animationSpeed);
	
	EditMatchupsBack();
	ViewMatchupsBack();
}


<!-- ******************************** -->
<!--       Show Opponents             -->
<!-- ******************************** -->

function PopulateOpponantList()
{
	//Clear the existing contents
	$(".teamList *").remove();

	//Load in the saved data
	var data = localStorage.getObject ("Team");
	
	//Loop through all opponents
	$.each(data.Opponents, function(key, value) { 
		
		//Get a blank list item
		var $listItem = $($("#teamListItemContainer").val());
		
		//Set the values
		if (key % 2 === 1)
			$listItem.addClass("alternate");
		
		$listItem.find(".listItemText").text(value.Name);
		
		$listItem.find(".listItemText").click(function (event) {
			EditTeam(key);
		});
		
		$listItem.find(".listItemDelete").click(function (event) {
			if (confirm("Are you sure you want to remove " + value.Name + "?")) { DeleteTeam(key); }
		});
		
		//Add the row to the first container
		$(".teamList:eq(0)").append($listItem);
		
		//For the second container, change the click function
		var $secondListItem = $listItem.clone();
		$secondListItem.find(".listItemDelete").remove();
		
		$secondListItem.find(".listItemText").click(function (event) {
			EditMatchups(key);
		});	
		
		$(".teamList:eq(1)").append($secondListItem);
		
		//For the thrid container, change the click function
		var $thirdListItem = $secondListItem.clone();
		
		$thirdListItem.find(".listItemText").click(function (event) {
			ViewMatchups(key);
		});	
		
		$(".teamList:eq(2)").append($thirdListItem);
	});
}




<!-- ******************************** -->
<!-- Edit my team or Add new opponant -->
<!-- ******************************** -->
function EditTeamOptions()
{
	this.isMyTeam = false;
	this.isNewTeam = false;
	this.index = 0;
}

function AddTeam() {

	var editTeamOptions = new EditTeamOptions();
	editTeamOptions.isNewTeam = true;
	
	ShowEditTeamDialog(editTeamOptions);
}

function EditTeam(index) {
		
	var editTeamOptions = new EditTeamOptions();

	if (!isNaN(index) && index >= 0)
		editTeamOptions.index = index;
	else
		editTeamOptions.isMyTeam = true;
	
	//Show the dialog
	ShowEditTeamDialog(editTeamOptions);
}

function ShowEditTeamDialog(editTeamOptions) {
	
	//Load in the saved data
	var data = localStorage.getObject ("Team");
	
	//Get the initial structure of the dialog
	var $dialogContents = $($("#editTeamDialogContainer").val());
	
	$dialogContents.find(".armyImg").click(function (event) {
			$selectedArmyDiv = $dialogContents.find("input[type=hidden]").filter(function() { return $(this).val() == ""; }).eq(0).parent();
			$selectedArmyDiv.children("[name='selectedArmy']").val($(this).attr("id"));
			$selectedArmyDiv.children(".selectedArmyImg").attr("src", "images/" + $(this).attr("id") + ".png");
		});
	
	$dialogContents.find(".selectedArmyImg").click(function (event) {
			$selectedArmyDiv = $(this).parent();
			
			$selectedArmyDiv.children("[name='selectedArmy']").val("");
			$selectedArmyDiv.children("[name='selectedArmyDesc']").val("");
			$selectedArmyDiv.children(".selectedArmyImg").attr("src", "images/question.png");
		});
	
	//Set the controls for existing values
	if (!editTeamOptions.isNewTeam)
	{
		if (editTeamOptions.isMyTeam)
		{
			$dialogContents.find("#name").val(data.Name);

			$.each(data.Armies, function(key, value) { 
				$selectedArmyDiv = $dialogContents.find(".selectedArmy").eq(key);
				
				$selectedArmyDiv.children("[name='selectedArmy']").val(value);
				$selectedArmyDiv.children(".selectedArmyImg").attr("src", "images/" + value + ".png");
				
				$selectedArmyDiv.children("[name='selectedArmyDesc']").hide();
			});					
		}
		else
		{
			$dialogContents.find("#name").val(data.Opponents[editTeamOptions.index].Name);

			$.each(data.Opponents[editTeamOptions.index].Armies, function(key, value) { 
				$selectedArmyDiv = $dialogContents.find(".selectedArmy").eq(key);
				
				$selectedArmyDiv.children("[name='selectedArmy']").val(value.Name);
				$selectedArmyDiv.children(".selectedArmyImg").attr("src", "images/" + value.Name + ".png");
				
				$selectedArmyDiv.children("[name='selectedArmyDesc']").val(value.Description);	
			});					
		}
	}
	
	//Create and open the dialog
	$dialogContents.dialog({
		draggable: false,
		resizable: false,
		modal: true,
		height: 660,
		width: 785,
		buttons: {
			"Save team": function() {
				var bValid = true;
				var name = $dialogContents.find("#name");	
				
				//Check the team name
				if (name.val() == "")
				{
					bValid = false;
					$(this).find("label:first").text("Please enter a name for this team").addClass("ui-state-error");
				}

				if (editTeamOptions.isNewTeam)
				{
					$.each(data.Opponents, function(key, value) { 
						if (value.Name == name.val())
						{
							bValid = false;
							$(this).find("label:first").text("A team with this name already exists").addClass("ui-state-error");
							
							return false;
						}
					});
				}
				
				//Check the number of armies selected
				if ($dialogContents.find("input[type=hidden]").filter(function() { return $(this).val() == ""; }).length > 0)
				{
					bValid = false;
					$(this).find("label:last").text("Please select five armies").addClass("ui-state-error");
				}
				
				//Save this army
				if ( bValid ) {
					
					//If it is our team
					if (editTeamOptions.isMyTeam)
					{
						data.Name = name.val();
						data.Armies = [];
						
						$.each($(this).find("input[type=hidden]"), function(key, value) { 
							data.Armies[key] = value.value;
						});						
					}
					else
					{
						//Remove the old entry if required
						if (!editTeamOptions.isNewTeam)
						{
							data.Opponents.splice(editTeamOptions.index, 1);
						}
						
						//Create the new entry
						var opponant = new Opponant(name.val());
						
						$.each($(this).find(".selectedArmy"), function(key, value) {
							
							var name = $(value).children("input[name='selectedArmy']").val();
							var description = $(value).children("input[name='selectedArmyDesc']").val();
							
							opponant.Armies[key] = new Army(name, description);
						});					
						
						//Add it to the data object
						data.Opponents.push(opponant);
						data.Opponents.sort(function(a,b){ return a.Name > b.Name });
					}
				
					//save it to local storage and close the dialog
					localStorage.setObject('Team', data);
					$(this).dialog( "close" );
				}
			},
			Cancel: function() {
				$(this).dialog( "close" );
			}
		},
		close: function() {
			RefreshPage();
			$(this).dialog("destroy");
		}
	});	
}


<!-- ******************************** -->
<!--    Delete Opponant               -->
<!-- ******************************** -->
function DeleteTeam(index) {

	var data = localStorage.getObject ("Team");

	data.Opponents.splice(index, 1);
	
	localStorage.setObject('Team', data);	

	RefreshPage();
}

<!-- ******************************** -->
<!--    Import and Export             -->
<!-- ******************************** -->
function ExportData() {

	$("#exportData").val(localStorage.Team);
}

function ImportData(structureOnly) {

	var data = {};

	try
	{
		data = JSON.parse($("#importData").val());
	}
	catch(err)
	{
		alert("There is a formatting error with the data. Import cancelled.");
		return;
	}
	
	//If we are only importing the structure, clear out all matchup data
	if (structureOnly)
	{
		data.Name = "";
		data.Armies = [];
		data.Scenarios = [];
		
		$.each(data.Opponents, function(key, value) { 
			
			value.LeadoutArmy = "";
			
			$.each(value.Armies, function(key, value) { 

				value.Matchups = [];

			});	
		});
	}

	localStorage.setObject('Team', data);
	RefreshPage();
	
	alert("Import sucessful");
}


<!-- ******************************** -->
<!--    Edit Matchups                 -->
<!-- ******************************** -->
function EditMatchupsBack()
{
	$("#editMatchupsViewPanel").hide();
	$("#editMatchupsSelectPanel").show();
}

function EditMatchups(index)
{
	var data = localStorage.getObject ("Team");
	_OpposingTeamId = index;
	
	$("#editMatchupsSelectPanel").hide();
	$("#editMatchupsViewPanel").show();
	
	$("#editMatchupsViewPanel .header").text(data.Opponents[index].Name);
	
	DrawMatchupGrid(true, index);
}

function EditMatchup(opposingArmy, ourArmy)
{
	var data = localStorage.getObject ("Team");
	
	//Get the initial structure of the dialog
	var $dialogContents = $($("#editMatchupDialogContainer").val());
	
	$dialogContents.find("img#ourArmy").attr("src", "images/" + data.Armies[ourArmy] + ".png"); 
	$dialogContents.find("img#theirArmy").attr("src", "images/" + data.Opponents[_OpposingTeamId].Armies[opposingArmy].Name + ".png"); 
	$dialogContents.find(".armyDescription").html(data.Opponents[_OpposingTeamId].Armies[opposingArmy].Description); 
	
	$.each(data.Scenarios, function(key, value) { 
		$dialogContents.find("#scenarios .scenario:eq(" + key + ")").text(value);
	});	
	
	//Add the event handlers for the clickable elements
	$dialogContents.find("#quality div").click(function (event) {
			
			$dialogContents.find("table#quality td").removeClass("selected");
			$(this).parent().addClass("selected");
		});	
		
	$dialogContents.find("#scenarioQuality div").click(function (event) {
			
			$dialogContents.find("#scenarioQuality td").removeClass("selected");
			$(this).parent().addClass("selected");
		});	
		
	$dialogContents.find("#scenarios .scenario").click(function (event) {
			$(this).toggleClass("selected");
		});	
	
	
	//Set the controls for the existing values
	if (data.Opponents[_OpposingTeamId].Armies[opposingArmy].Matchups && data.Opponents[_OpposingTeamId].Armies[opposingArmy].Matchups[ourArmy])
	{
		$dialogContents.find("#quality div." + data.Opponents[_OpposingTeamId].Armies[opposingArmy].Matchups[ourArmy].Quality).parent().addClass("selected");
		$dialogContents.find("#scenarioQuality div." + data.Opponents[_OpposingTeamId].Armies[opposingArmy].Matchups[ourArmy].ScenarioQuality).parent().addClass("selected");
		
		$.each(data.Opponents[_OpposingTeamId].Armies[opposingArmy].Matchups[ourArmy].Scenarios, function(key, value) { 
			$dialogContents.find("#scenarios .scenario:contains('" + value + "')").addClass("selected");
		});			
	}
	
	
	//Create and open the dialog
	$dialogContents.dialog({
		draggable: false,
		resizable: false,
		modal: true,
		height: 630,
		width: 785,
		buttons: {
			"Save Matchup": function() {
				var bValid = true;
				
				//Check that a quality was input
				if ($(this).find("#quality td.selected").length != 1)
				{
					bValid = false;
					$(this).find("#qualityText").addClass("ui-state-error");				
				}

				//Check that the scenario quality information is valid					
				var bHasScenarioQuality = ($(this).find("#scenarioQuality td.selected").length == 1);
				var bHasScenarios = ($(this).find("#scenarios td.selected").length > 0);				
				
				if (!bHasScenarioQuality && bHasScenarios)
				{
					bValid = false;
					$(this).find("#scenarioQualityText").addClass("ui-state-error").text("Please select a quality for the selected scenarios");					
				}				
				
				if (bHasScenarioQuality && !bHasScenarios)
				{
					bValid = false;
					$(this).find("#scenarioQualityText").addClass("ui-state-error").text("Please select at least one scenario if you select a custom scenario quality");					
				}
				
				//Save this matchup
				if ( bValid ) {
					
					var matchup = new Matchup($(this).find("#quality td.selected div").attr("class"));
					
					if (bHasScenarios)
					{
						matchup.ScenarioQuality = $(this).find("#scenarioQuality td.selected div").attr("class");
						
						$.each($(this).find("#scenarios td.selected"), function(key, value) { 
							matchup.Scenarios[key] = value.innerHTML;
						});							
					}					
					
					data.Opponents[_OpposingTeamId].Armies[opposingArmy].Matchups[ourArmy] = matchup;
				
					//save it to local storage and close the dialog
					localStorage.setObject('Team', data);
					$(this).dialog( "close" );
				}
			},
			"Clear All": function() {
				
				data.Opponents[_OpposingTeamId].Armies[opposingArmy].Matchups[ourArmy] = null;

				localStorage.setObject('Team', data);
				$(this).dialog( "close" );
			},
			Cancel: function() {
				$(this).dialog( "close" );
			}
		},
		close: function() {
			RefreshMatchupGrid(true, _OpposingTeamId);
			$(this).dialog("destroy");
		}
	});		
}

function SelectLeadoutArmy(index)
{
	var data = localStorage.getObject ("Team");
	var shouldAdd = true;
	
	$("#editMatchupsTable .leadout").removeClass("leadout");
	
	//Check if this is already selected
	if (data.Opponents[_OpposingTeamId].LeadoutArmy !== undefined &&  data.Opponents[_OpposingTeamId].LeadoutArmy !== null)
	{
		if (data.Opponents[_OpposingTeamId].LeadoutArmy == index)
		{
			data.Opponents[_OpposingTeamId].LeadoutArmy = null;
			shouldAdd = false;
		}
	}
	
	//Set the new leadout army
	if (shouldAdd)
	{
		data.Opponents[_OpposingTeamId].LeadoutArmy = index;
		$("#editMatchupsTable #Player" + index + " img").addClass("leadout");
	}
	
	//Save
	localStorage.setObject('Team', data);
}


<!-- ******************************** -->
<!--    Edit Scenarios                -->
<!-- ******************************** -->
$(document).ready(function() {

	//Set up the click function
	$("#editScenarioTable div").click(function (event) {
			$(this).toggleClass("selected");
		});
	
	//Select the appropriate scenarios on load
	var data = localStorage.getObject("Team");
		
	$.each(data.Scenarios, function(key, value) {
		$("#editScenarioTable div:contains('" + value + "')").addClass("selected");
	});			
});

function SaveScenarios() {
	
	//Load in the saved data
	var data = localStorage.getObject("Team");
	
	//Check for the right number of scenarios
	var selectedScenarios = $("#editScenarioTable div.selected");
	
	if (selectedScenarios.length != 6) {
		
		$("#editScenarioLabel").addClass("ui-state-error");
		return;		
	}
	
	$("#editScenarioLabel").removeClass("ui-state-error");
	
	//Save the scenarios
	$.each(selectedScenarios, function(key, value) {
		data.Scenarios[key] = value.innerHTML;
	});		
	
	localStorage.setObject('Team', data);
	DrawScenarioGrid();
	
	//Alert the user
	alert("Scenarios saved sucessfully");
}





<!-- ******************************** -->
<!--    View Matchups                 -->
<!-- ******************************** -->
function ViewMatchupsBack()
{
	$("#viewMatchupsViewPanel").hide();
	$("#viewMatchupsSelectPanel").show();
}

function ViewMatchups(index)
{
	var data = localStorage.getObject ("Team");
	_OpposingTeamId = index;
	
	$("#viewMatchupsSelectPanel").hide();
	$("#viewMatchupsViewPanel").show();
	
	$("#viewMatchupsViewPanel .header").text(data.Opponents[index].Name);
	
	DrawMatchupGrid(false, index);
	ClearScenarioGrid();
}


<!-- ******************************** -->
<!--      View  Scenario Controls     -->
<!-- ******************************** -->

function ToggleScenarioChoice(index)
{
	$("#viewScenarioTable .selected").removeClass("selected");
	$("#viewScenarioTable .scenario:eq(" + index + ")").addClass("selected");
	
	RefreshMatchupGrid(false, _OpposingTeamId);
}