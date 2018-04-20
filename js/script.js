// Arrays for the origins and destinations inputs
  var origins = new Array();
  var destinations = new Array();

  // Initial query parameters
  var query = {
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC
  };
  // Google Distance Matrix Service 
  var dms;
  // Interval and Limit values for tracking origins groupings (for staying within QUERY_LIMIT)
  var originsInterval = 0;
  var originsLimit;
  
  // Query Limit - 100 is the non-premier query limit as of this update
  var QUERY_LIMIT = 100;
  
  /*
   * Updates the query, then uses the Distance Matrix Service
   */   
  var graph = [];
  var path = [];
  var visited = [];
  var dist =0;
   function getPath(n)
   {
	
	if(n==1)
	{
	
		dist+= graph[path[path.length-1]][0];
		path.push(0);
		return;
	}
	
	
	var minDestination;
	var temp = 9999999;
	
		for(var j=0;j<graph.length;j++)
		{
			if(j==0 || visited[j])
				continue;
			if(graph[path[path.length-1]][j] < temp)
			{
				console.log(j);  
				temp = graph[path[path.length-1]][j];
				minDestination = j;
			}
		}
		
		
		visited[minDestination] = 1;
	path.push(minDestination);
	dist+=temp;
	getPath(--n);
   }
   function floyd(rows)
   {
	   for (var i = 0; i < rows.length; i++) {
		graph.push([]);
		for (var j = 0; j < rows[i].elements.length; j++)
			graph[i].push(i == j ? 0 : 9999999);
		}
	
		for (var i = 0; i < rows.length; i++) {
			for (var j=0;j<rows[i].elements.length;j++)
				 if(rows[i].elements[j].status != "ZERO_RESULTS"){
					graph[i][j] = rows[i].elements[j].distance.value;
				 }
		}

		for (var k = 0; k < rows.length; k++) {
		  for (var i = 0; i < rows.length; i++) {
			for (var j = 0; j < rows.length; j++) {
			  if (graph[i][j] > graph[i][k] + graph[k][j])
				graph[i][j] = graph[i][k] + graph[k][j]
			}
		  }
		}
		
       
		path.push(0);
		getPath(graph.length);
		var solution = "Source";
		for(var i=1;i<path.length-1;i++)
		{
			solution+= " -> Destination " + path[i];
		}
		solution += " -> Source";
		document.getElementById("solution").innerHTML = "<b>The Optimal Path Is:</b>" + "<br>" + solution +"<br><b>"+"Distance Covered"+"</b><br>" +  dist/1000 + " Km";
		console.log(dist);  
		console.log(path);  
		console.log(graph);	
   }
   
  function updateMatrix() {
    updateQuery();
    dms.getDistanceMatrix(query, function(response, status) {
        if (status == "OK") {
          populateTable(response.rows);
		  
	floyd(response.rows);
	
	
			
        }else{
            alert("There was a problem with the request.  The reported error is '"+status+"'");
        }
      }
    );
  }
  
  /*
   * Generates a table in 'matrix' element for populating dms results
   */
  function createTable() {
    var table = document.getElementById('matrix');
	document.getElementById("matrix").caption.innerHTML = "Distance Matrix";
    var tr = addRow(table);
    addElement(tr);
    for (var j = 0; j < destinations.length; j++) {
      var td = addElement(tr);
      td.setAttribute("class", "destination");
	  if(j==0)
		   td.appendChild(document.createTextNode("Source"));
	   else 
			td.appendChild(document.createTextNode("Destination "+ j));
    }
 
    for (var i = 0; i < origins.length; i++) {
      var tr = addRow(table);
      var td = addElement(tr);
      td.setAttribute("class", "origin");
	if(i==0)
		   td.appendChild(document.createTextNode("Source"));
	   else 
			td.appendChild(document.createTextNode("Destination "+ i));
      for (var j = 0; j < destinations.length; j++) {
        var td = addElement(tr, 'element-' + i + '-' + j);
      }
    }
  }
  
  /*
   * Retrieves origins and destinations from textareas and
   * determines how to build the entire matrix within query limitations
   */
  function getInputs(){
    var originsString = document.getElementById('origins').value;
    var destinationsString = document.getElementById('destinations').value;
    
    origins = originsString.split("|");
    destinations = destinationsString.split("|");
    
    query.destinations = destinations;
    originsLimit = Math.floor(QUERY_LIMIT/destinations.length);
    if(originsLimit > 25){
        originsLimit = 25;
    }
  }
  
  /*
   * Updates the query based on the known sizes of origins and destinations
   */
  function updateQuery(){
    if(origins.length * destinations.length < QUERY_LIMIT && originsLimit < 25){
        query.origins = origins;
        originsInterval=1;
    }else{
        query.origins = origins.slice(originsLimit*originsInterval,originsLimit*(originsInterval+1));
        originsInterval++;
    } 
  } 
  
  /*
   * Initializes the matrix data and pulls the first set of near 100 results
   */
  function matrixInit(){
    dms = new google.maps.DistanceMatrixService();
    getInputs();
    createTable();
    updateMatrix();
 
  } 
  
  /*
   * Accepts rows and populates table content.  Error validation is limited to the "ZERO_RESULTS"
   * return status.  originsLimit and originsInterval are used to find the correct table cell.
   */
  function populateTable(rows) {
    var elementX;
    for (var i = 0; i < rows.length; i++) {
      for (var j = 0; j < rows[i].elements.length; j++) {
        elementX = originsLimit*(originsInterval-1) + i;
        if(rows[i].elements[j].status != "ZERO_RESULTS"){
            var distance = rows[i].elements[j].distance.text;
            var duration = rows[i].elements[j].duration.text;
            var td = document.getElementById('element-' + elementX + '-' + j);
            td.innerHTML = distance + "<br />" + duration;
        }else{
            var td = document.getElementById('element-' + elementX + '-' + j);
            td.innerHTML = "No results available," + "<br />" + "Check your location.";                        
        }
      }
    }
    

  }
  
  /*
   * Updates the query parameter for unitSystem when the unit select option is changed
   */
  function updateUnits() {
    switch (document.getElementById("units").value) {
      case "km":
        query.unitSystem = google.maps.UnitSystem.METRIC;
        break;
      case "mi":
        query.unitSystem = google.maps.UnitSystem.IMPERIAL;
        break;
    }
    updateMatrix();
  }
 
  /*
   * Adds a row to the provided table element
   */
  function addRow(table) {
    var tr = document.createElement('tr');
    table.appendChild(tr);
    return tr;
  }
  
  /*
   * Adds a cell with provided id to the provided row
   */
  function addElement(tr, id) {
    var td = document.createElement('td');
    if (id) {
      td.setAttribute('id', id);
    }
    tr.appendChild(td);
    return td;
  }
  

  

  /*
   * Clears the results table and resets button states
   */
  function clearTable(){
     location.reload();
  }
  
  /*
   * Shows/Hides instructions when link is clicked.
   */
  function instructionsShowHide(){
    var instructions = document.getElementById('instructions');
    var instructionsLink = document.getElementById('instructionsLink');
    if(instructions.style.display == "none"){
        instructions.style.display = "block";
        instructionsLink.innerHTML = "Hide Instructions";
    }else{
        instructions.style.display = "none";
        instructionsLink.innerHTML = "Show Instructions";
    }
    
  }