//Extend local storage to handle objects
Storage.prototype.setObject = function(key, value) { 
    this.setItem(key, JSON.stringify(value)); 
} 
 
Storage.prototype.getObject = function(key) { 
    var value = this.getItem(key); 
    return value && JSON.parse(value); 
}


//Initial population
$(document).ready(function() {

	var data = localStorage.getObject("Team");

	if (!data)
	{
		var data = { Armies: [], Opponents: [] };

		data.GoodScenarios = CreateScenarios();		
		data.BadScenarios = CreateScenarios();
		
		localStorage.setObject('Team', data);
	}
});



//Create a new Opponant
function Opponant (name)
{
	this.Name = name;
	this.Armies = [];
}

//Create a new Opposing Army
function Army (name)
{
	this.Name = name;
	this.Matchups = [];
}

//Create a new Matchup
function Matchup (quality)
{
	this.Quality = quality;
	this.ScenarioQuality = null;
	this.Scenarios = [];
}

//Create a new Scenario list
function CreateScenarios ()
{
	scenarios = [];
	scenarios.push(new Scenario("CloseQuarters"));
	scenarios.push(new Scenario("Gauntlet"));
	scenarios.push(new Scenario("Guidons"));
	scenarios.push(new Scenario("Destruction"));
	scenarios.push(new Scenario("Incursion"));
	scenarios.push(new Scenario("ProcessOfElimination"));
	scenarios.push(new Scenario("Demolition"));
	scenarios.push(new Scenario("Incoming"));
	scenarios.push(new Scenario("CommandAndControl"));
	
	return scenarios;
}

//Create a new Scenario
function Scenario (name)
{
	this.Name = name;
	this.Armies = [];	
}





<!-- ******************************** -->
<!--    Data Structure                -->
<!-- ******************************** -->

//	Team
//		Name
//		Armies[]
//		GoodScenarios[]
//			Scenario
//				Name
//				Armies[]
//		BadScenarios[]
//			Scenario
//				Name
//				Armies[]
//		Opponents[]
//			Name
//			LeadoutArmy
//			Armies[]
//				Name
//				Matchups[]
//					Quality
//					ScenarioQuality
//					Scenarios[]

