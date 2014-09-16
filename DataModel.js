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
		var data = { Armies: [], Opponents: [], Scenarios: [] };
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
function Army (name, description)
{
	this.Name = name;
	this.Description = description;
	this.Matchups = [];	
}

//Create a new Matchup
function Matchup (quality)
{
	this.Quality = quality;
	this.ScenarioQuality = null;
	this.Scenarios = [];
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
//		Scenarios[]
//		Opponents[]
//			Name
//			LeadoutArmy
//			Armies[]
//				Name
//				Description
//				Matchups[]
//					Quality
//					ScenarioQuality
//					Scenarios[]

