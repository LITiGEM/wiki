// JSXGraph system
// Author: Phil Lewis

function make_euler(target_element,unique_name){
	
	var myIntG=new InteractiveGraph; // initiates interactive graph object

	// Now create the variable objects 
	// (current value, initial value, min, max, step size, decimal places (NOT USED), name)
	
	// STEPSIZE 
	var dt = new variable(0.1, 0.1, 0.01, 2, 0.01, 0, '$\delta t$'); 
	
	// START POINT
	var start = new variable(0, 0, -10, 10, 0.1, 0, 'start'); 
	
	// CALCULATE UP TO END
	var end = new variable(10, 10, -10, 10, 0.1, 0, 'end');
	
	// INITIAL CONDITION FOR Y
	var y0 = new variable(1, 1, 0, 100, 0.1, 0, 'y0');  
	
	
	// Associate variables objects with the interactive graph
	myIntG.variables = [ dt,start,end,y0]; 
	
	// NEED TO SPECIFY LIMITS FOR JSXGRAPH
	var max_x = end.max;
	var min_x = start.min;	
		
	// >>>>>>>>>>>>>>>>>>>>>>>>>>
	
	// THIS DEFINES THE DIFFERENTIAL EQN USED
	
	// Define the differential function we are plotting
	var dy = function(x,y) {
		return Math.cos(x); // i.e. y = sin(x) + C
	//	return 2*x; // i.e. y = x^2 + C
	//	return y; // i.e. y = exp(x) + C
	};

	// IGNORE ALL BELOW FOR NOW
	// >>>>>>>>>>>>>>>>>>>>>>>>>>
	// >>>>>>>>>>>>>>>>>>>>>>>>>>
 	
	
	var fy = function(x) {
		return Math.exp(x);
	}
	
	var max_points=200;

	// Define the steps needed to build the graph
	myIntG.createGraphs=function() {
	
			// Create the board in which the graph will be drawn and associate it with myIntG 
		myIntG.SMBoards['main']= myIntG.AddSMBoard(300,500)
		myIntG.SMBoards['main'].rescale=function(){
			var xmin=-10;//*b.val()-10;
			var xmax=10;//*b.val()+10;
			scaleGraph(this.board, start.val(), end.val(), -1, 2);
		}
		
		var rungeGraph=myIntG.SMBoards['main'].createGraph('curve',[[0,0],[1,1]])
		
		
		var update_runge=function(){	
 			var data_x=[];
 			var data_y=[];
			var x0=[y0.val()];
			var I=[start.val(),end.val()]
			var N=1000;
			var f= function(t,x){
				var y = [];
				y[0]=dy(t,x);
				return y;
			}
			var data = JXG.Math.Numerics.rungeKutta('euler', x0, I, N, f);

			var t = [];
			var q = I[0];
			var h = (I[1]-I[0])/N;
			for(var i=0; i<N; i++) {
				data_y[i]=data[i][0];	
				 data_x[i]=q;
				q += h;
			}


			rungeGraph.dataX=data_x;
			rungeGraph.dataY=data_y;

		}

		var approxGraph=myIntG.SMBoards['main'].createGraph('curve',[[0,10],[1,1]])
		var update_points=function(){	
			var data_x=[];
			var data_y=[];
			var step=dt.val();
			var px=start.val();
			var py=y0.val();
// 			alert(px+","+py);
			for (; px<=end.val() && data_x.length<max_points; px+=step){
				data_x.push(px);
				data_y.push(py);
				py=py+step*dy(px,py);
			}
// 			for (var i=0; i< data_x.length; i++){
// 				alert(data_x[i]+","+data_y[i]);
// 			}
			approxGraph.dataX=data_x;
			approxGraph.dataY=data_y;
			points=myIntG.SMBoards['main'].Points(data_x,data_y);

 			for (var i=0; i<myIntG.SMBoards['main'].storedpoints.length; i++){
	 			myIntG.SMBoards['main'].storedpoints[i].setAttribute({face:'+'});
	 			
 			}
		}


		// Add the graph that is drawn with function fm, between minimum of 0 and maximum of max_x 
		//var thegraph=myIntG.SMBoards['main'].createGraph('functiongraph',[fy,-1*max_x,max_x]);
		//	var discrete_graph=myIntG.SMBoards['discrete'].board.create('chart',[data_x,data_y]);
		
		// Add a function to scale the axes to suitable ranges given the variable values
		
		// Create the gliders (interactive graph object, interactive board, variable, axis, true (last input is DEPECIATED?)
		// Draws a inverse glider (maps 1/k) on the x axis 
		// Draws a simple glider to map N0 on the y axis
		//var gla = createSimpleGliderControl(myIntG,myIntG.SMBoards['main'],N_0,'y',true);
	//	var glb = createSimpleGliderControl(myIntG,myIntG.SMBoards['main'],b,'x',true);


		//Draw an independent glider on the plotted function "thegraph" with label 'N'
		// Not sure if I can simplify this into one step but for now have to do both lines
// 		myIntG.SMBoards['main'].iglider= new independentGlider(thegraph,'y');
// 		myIntG.SMBoards['main'].glider=myIntG.SMBoards['main'].iglider.glider;
		myIntG.propagateFunctions.push(update_points);
		myIntG.propagateFunctions.push(update_runge);

	}
	// Define the titles for the graph and its controls
	var myIntView=new InteractiveGraphView(unique_name,target_element);
	myIntView.setTitle('Interactive graph: Eulers method');
   	myIntView.setExplanation('Equation: $dy/dx = f(x,y)$');
	myIntView.setDependentVariable('$y$');
	myIntView.setIndependentVariable('$x$');


	// Built the graph
	myIntG.init_jsxgraph(unique_name);


}






// Generic stuff //
MathJax.Hub.Config({
    tex2jax: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
});

// ********** FUNCTIONS

var InteractiveGraph = function(){
	this.propagateFunctions = [];
	this.SMBoards = new Array;
	this.variables=[];	
	this.uid='';	 
}

InteractiveGraph.prototype.size=function() {
	var size = 0, key;
    for (key in this.SMBoards) {
        if (this.SMBoards.hasOwnProperty(key)) size++;
    }
    return size;
}

function bound(bb){
	this.minX=bb[0];
	this.maxX=bb[2];
	this.minY=bb[3];
	this.maxY=bb[1];
	this.bb=bb;
}

function variable(value, initial, min, max, step, dp, name, display_name){
	if (!display_name) display_name=name;
	this.propagateFunctions = [];
	this.value=value;
	this.initial=initial;
	this.min=min;
	this.max=max;
	this.step=step;
	this.dp=dp;
	this.name=name;
	this.display_name=display_name;
	this.val=function(thevalue){
		if (!thevalue) 	return parseFloat(this.value);
		else{
			newvalue=parseFloat(thevalue);
			if (newvalue<=this.min) {this.value=this.min; return true;}
			else if (newvalue>=this.max){ this.value=this.max; return true;}
			else { this.value=newvalue; return true;}
				
		}
		return;
} ;           

                 }
/* ************************************** * */

function print_variable(thevariable){
	alert(thevariable.name+' '+thevariable.value);
}


// updateGraph 
// REDRAW ALL BOARDS
InteractiveGraph.prototype.updateGraph=function() {
   for(var index in this.SMBoards) {
   		this.SMBoards[index].board.update();
	}
}

// readVariableFromHTMLSlider 
// READ SLIDER VALUDE AND PROPAGATE IT
function readVariableFromHTMLSlider(el,theInteractiveGraph) {
    var n = HTMLControlNameToNumber($(el).attr('id'));
    var oldval = (theInteractiveGraph.variables[n]).val();
    var accepted=(theInteractiveGraph.variables[n]).val($(el).val());
    
    if (oldval != (theInteractiveGraph.variables[n]).val()  )  {
    
    for (var i = 0; i < theInteractiveGraph.variables[n].propagateFunctions.length; i++) {  
       
        theInteractiveGraph.variables[n].propagateFunctions[i]();
       
    };

    theInteractiveGraph.propagateVariableChange(); 
    
    }
}

// propagateVariableChange 
// UPDATES ALL VARIABLE CONTROLS AND GRAPHS TO RELFECT A CHANGE IN VARIABLES
InteractiveGraph.prototype.propagateVariableChange=function() {

    for (var i = 0; i < this.propagateFunctions.length; i++) {  
       
        this.propagateFunctions[i]();
       
    };
    this.updateGraph();
    this.updateHTMLControls();
}

// round
// rounds a number "num" to "dp" decimal places
function round(num, dp) {
    return Math.round(num * Math.pow(10, dp)) / Math.pow(10, dp);
}

// HTMLControlNameToNumber
// finds the variable that a HTML control refers to
function HTMLControlNameToNumber(varname) {
    var vararray = varname.split('_');
    if (vararray.length > 2 ) return parseInt(vararray[1]);
}

// updateHTMLControls
// updates HTML controls with new variable values
InteractiveGraph.prototype.updateHTMLControls=function() {
    for (var i = 0; i < this.variables.length; i++) {
		$('#var_' + i + '_number'+this.uid).val((this.variables[i]).val());	
        // odd bug doesn't work in firefox if these are other way round?? 
   }
   for (var i = 0; i < this.variables.length; i++) {
 	   $('#var_' + i + '_range'+this.uid).val((this.variables[i]).val());
   }
    
    //  WriteEquation();
}

// resetGraph
// resets variables / gliders / sliders graph to default values / positions 
InteractiveGraph.prototype.resetGraph=function(){
    this.resetVariables(); 
    this.propagateVariableChange();
    this.updateHTMLControls(); 
    this.rescaleGraph(); 
    return false;
}

//scaleGraph
//sets scale of graph adding 10% borders to min max values
function scaleGraph(theboard, xmin, xmax, ymin, ymax) {
    var bb=[0,0,0,0];      
    bb[0] = xmin;
    bb[2] = xmax;
    bb[3] = ymin;
    bb[1] = ymax;

    var height = parseFloat(bb[1]) - parseFloat(bb[3]);
    var width = parseFloat(bb[2]) - parseFloat(bb[0]);

    bb[0] = parseFloat(bb[0]) - 0.1 * width;
    bb[2] = parseFloat(bb[2]) + 0.1 * width;
    bb[3] = parseFloat(bb[3]) - 0.1 * height;
    bb[1] = parseFloat(bb[1]) + 0.1 * height;
    theboard.setBoundingBox(bb);
}

// resetVariables
// sets all variables to default values
InteractiveGraph.prototype.resetVariables=function() {
    for (var i = 0; i < this.variables.length; i++) {
        (this.variables[i]).val((this.variables[i]).initial);
    }
   // updatenamedVariables();
}

// createSliderControl
// creates a HTML slider control
InteractiveGraph.prototype.createSliderControl=function(n,target) {
	var theInteractiveGraph=this;
	var varname=(theInteractiveGraph.variables[n]).display_name;
	var variable_id=n;
    $inputrange = $('<input/>').attr('id', "var_" + n + "_range"+this.uid)
    .attr('type', 'range').addClass("smallrange")
    .attr('min', (theInteractiveGraph.variables[n]).min)
    .attr('max', (theInteractiveGraph.variables[n]).max)
    .attr('step', (theInteractiveGraph.variables[n]).step)
    .change(function(){readVariableFromHTMLSlider(this,theInteractiveGraph)});
    $inputrangespan=$('<span/>').addClass('rangeHolder').append($inputrange);
    $inputspinner = $('<input/>').attr('id', "var_" + n + "_number"+this.uid)
    .attr('type', 'number').addClass("smallnum")
    .attr('min', (theInteractiveGraph.variables[n]).min )
    .attr('max', (theInteractiveGraph.variables[n]).max )
    .attr('step', (theInteractiveGraph.variables[n]).step )
    .change(function(){readVariableFromHTMLSlider(this,theInteractiveGraph)})
    .click(function(){readVariableFromHTMLSlider(this,theInteractiveGraph)});
    $label = $('<label/>').append( "$"+varname+"$" );
    $controlLine=$('<div/>').addClass('controlLine').append($inputspinner).append($label).append($inputrangespan);
    $controldesc=$('<div/>').addClass('controlDesc').append(theInteractiveGraph.variables[n].description);
    $control=$('<div/>').addClass('controlGraph').append($controlLine).append($controldesc);
    $(target).append($control);
}

// createSliderControls
// creates a HTML slider control for each variable
InteractiveGraph.prototype.createSliderControls=function(target){
	var theInteractiveGraph=this;
     for (var i = 0; i < this.variables.length; i++) {
        theInteractiveGraph.createSliderControl(i,target);
    }
};




// createSimpleGliderControl
// creates glider on theaxis to control a variable_name
function createSimpleGliderControl(theIntGraph,theSMBboard,thevariable, theaxis) {
	var theboard=theSMBboard.theboard;
   // alert(thevariable.val());
    var getValueForGlider=function(theSMControl){  return thevariable.val();}
    var setValuesFromGlider=function(thevalue){thevariable.val(thevalue); }
    var thecontrol= new SMControl(theIntGraph,theSMBboard,getValueForGlider, setValuesFromGlider, thevariable.display_name, theaxis,true);
    return thecontrol.glider;
};

function createSimpleInvGliderControl(theIntGraph,theSMBboard,thevariable, theaxis) {
	var theboard=theSMBboard.theboard;
    var getValueForGlider=function(theSMControl){ 
    	if (thevariable.val() == 0) { 
    		setInvisible(theSMControl) ; 
    		return parseFloat(thevariable.max);
    		}  
    	else { 
    		if (theSMControl.hidden==false)	setVisible(theSMControl) ; 
    			return 1/thevariable.val(); 
    		} };
    var setValuesFromGlider=function(thevalue){ // this might not be working as I can send 1/r to 0
    	if (1./thevalue>thevariable.max) thevalue=1./thevariable.max;
    	if (1./thevalue<thevariable.min) thevalue=1./thevariable.min;
     	 thevariable.val(1.0/thevalue); };
    var thecontrol= new SMControl(theIntGraph,theSMBboard,getValueForGlider, setValuesFromGlider, "1/"+ thevariable.display_name, theaxis,true);
    return thecontrol.glider;
};
// drawGuide
// creates dotted line to show the glider control  value
function drawGuide(theglider,theaxis){
   var gl2;

    if (theaxis == 'x') {
        gl2 = theglider.board.create('point', [function() {
            return theglider.X();}, 1], {

            visible: false
        });
    }
    else {
        gl2 = theglider.board.create('point', [1, function() {
            return theglider.Y();}], {

            visible: false
        });
    }

    var li2 = theglider.board.create('line', [theglider, gl2], {
        strokeColor: '#000000',
        strokeWidth: 1,
        dash: 2
    });
    return li2;
    
};

// drawGuideLinkingGliders
//  draw a line linking two gliders
function drawGuideLinkingGliders(theglider, theglider2){
     var li2 = theglider.board.create('line', [theglider, theglider2], {
        strokeColor: '#000000',
        strokeWidth: 1,
        dash: 2
    });    
    return li2;
}


function dependentGlider(theSMBoardGraph,theIndependentglider,Func,theName){
	if (!theName) theName='';
	var getX=function(){return Func.call(theIndependentglider);}
	var getY=function(){return theSMBoardGraph.Y(Func.call(theIndependentglider));}
	
	this.point = theSMBoardGraph.board.createElement('point', [
        getX,
        getY,
    ], {
        style: 1,
        name: theName,
        fillColor: '#777777',
        strokeColor: '#777777',
        size:1
    });
    this.graph=theSMBoardGraph;
	
}
function independentGlider(theSMBoardGraph,theName){
	var theBoard=theSMBoardGraph.board;
	this.glider = theBoard.create('glider', [0, 0, theSMBoardGraph], { name: theName });
	this.graph=theSMBoardGraph;
}

InteractiveGraph.prototype.createBoard=function(height,width) {
	var id='jsgraph_'+this.size()+'_'+this.uid;
	$target=$('#'+this.uid).find('.InteractiveGraph-toolbar');
	$new_graph=$('<div class="jsxgraph_holder"/>').attr('id',id)
	.addClass('jxgbox').css('width',width).css('height',height);
	$target.before($new_graph);
	$wrap=$('<div class="jsxgraph_outer"/>').css('width',width);
	$new_graph.wrap($wrap);
	return id;
}

InteractiveGraph.prototype.rescaleGraph=function() {
   for (key in this.SMBoards) {
	   this.SMBoards[key].rescale();
	   if (this.SMBoards[key].glider) {
			var bb=this.SMBoards[key].board.getBoundingBox();
			this.SMBoards[key].glider.moveTo([bb[0]+(bb[2]-bb[0])/3,10]);
		}
   }
   return false;
}

function x_transform(t){
	return parseFloat(t);
}

function y_transform(t){
	return (parseFloat(t));
}

function inv_x_transform(t){
	return parseFloat(t);
}

function inv_y_transform(t){
	return parseFloat(t);
}
InteractiveGraph.prototype.zoomGraph=function(axis,percentage) {
    for (key in this.SMBoards) {
		var bb=this.SMBoards[key].board.getBoundingBox();
		console.log("axis: "+axis)
		console.log("percentage: "+percentage)
		var xmin= parseFloat(bb[0]);
  		var xmax= parseFloat(bb[2]);
   		
   		var	ymin=  parseFloat(bb[3]);
   		var	ymax=  parseFloat(bb[1]);
		
		console.log("xmin: "+xmin)
		console.log("xmax: "+xmax)
		console.log("ymin: "+ymin)
		console.log("ymax: "+ymax)
		
		var ydist=ymax-ymin;
		var ymin=ymin+ydist/12;
		var ymax=ymax-ydist/12;
		
		if (axis=="y" ){
			ydist=ymax-ymin;
			ymin=ymin*(1+percentage);
			ymax=ymax*(1+percentage);
		}
				
		var xdist=xmax-xmin;
		var xmin=xmin+xdist/12;
		var xmax=xmax-xdist/12;
		console.log("xdist: "+xdist)
		console.log("xmin: "+xmin)
		if (axis=="x" ){
			xdist=xmax-xmin;
			xmin=xmin*(1+percentage);
			xmax=xmax*(1+percentage);
		}

			
	    var bb=[0,0,0,0];      
  
  		bb[0] = xmin;
   		bb[2] = xmax; 
   		
   
    	bb[3] = ymin;
    	bb[1] = ymax;
	
		console.log("xmin: "+xmin)
		console.log("xmax: "+xmax)
		console.log("ymin: "+ymin)
		console.log("ymax: "+ymax)
		
    	var height = parseFloat(bb[1]) - parseFloat(bb[3]);
    	var width = parseFloat(bb[2]) - parseFloat(bb[0]);
		console.log("height: "+height)
		console.log("width: "+width)
    	bb[0] = parseFloat(bb[0]) - 0.1 * width;
    	bb[2] = parseFloat(bb[2]) + 0.1 * width;
   		bb[3] = parseFloat(bb[3]) - 0.1 * height;
    	bb[1] = parseFloat(bb[1]) + 0.1 * height;
    	this.SMBoards[key].board.setBoundingBox(bb);


   }
   return false;
}

InteractiveGraph.prototype.AddSMBoard=function(height,width){
	var mySMBoard=new SMBoard(this.createBoard(height,width));
	return mySMBoard;
}


var SMBoard=function(id){
	this.board= JXG.JSXGraph.initBoard(id, {
        axis: true,
        boundingbox: [0, 10, 10, 0], showCopyright:false
    }); 
	this.id=id;
	this.graphs=[];
	
	this.rescale=function(){return true;}
	this.glider=null;
	
	this.createGraph=function(){
		var args = Array.prototype.slice.call(arguments);  
		var thegraph=this.board.create(args[0],args[1]) ;
		this.graphs.push(thegraph);
		return thegraph;
	}
	this.storedpoints=[];
	this.gliderList=[];
	
	this.Points=function(data_x,data_y){
		var n_points=this.storedpoints.length;
		while (this.storedpoints.length>data_x.length) {
			this.board.removeObject(this.storedpoints.pop());
		}		
		for (var i=0; i<this.storedpoints.length; i++){
			this.storedpoints[i].setPosition(JXG.COORDS_BY_USER,[data_x[i],data_y[i]])
		}
		
		for (var i=n_points; i<data_x.length; i++){
			
			var newpoint=this.board.createElement('point', [
        	data_x[i],
        	data_y[i]
   			 ],
   			 {
   			 fixed:true,withLabel:false,
   			 }
   			 
   			 );
   			 this.storedpoints.push(newpoint);
		}	

		return this.storedpoints;
	}
	return this;
}

// createAxes
// creates axes for the glider controls to slide on
function getXAxes(theboard) {
     var xline = theboard.create('line', [[0, 0], [1, 0]], {
         strokeOpacity: .2,
         strokeColor: '#000000',
         fixed: true,
         visible: false
     });
     return xline;
}

function getYAxes(theboard) {
  var yline = theboard.create('line', [[0, 0], [0, 1]], {
        strokeOpacity: .2,
        strokeColor: '#000000',
        fixed: true,
        visible: false
    });
    return yline;
}

function SMControl(theIntGraph,theSMBoard,getValueForGlider, setValuesFromGlider, name, theaxis, doDrawGuide){
	var theboard=theSMBoard.board;
	
	this.SMboard=theSMBoard;
	this.axis=theaxis;
	this.lines=[];
     var currentval=0;//getValueForGlider(theglider);
	
    var theglider;
    if (theaxis=='x'){
    	var elx=getXAxes(theboard);
        theglider= theboard.create('glider', [currentval, currentval, elx ], {
        name: name,
        size: 1
    });    }
    if (theaxis=='y'){
    	var ely=getYAxes(theboard);
    	theglider= theboard.create('glider', [currentval, currentval, ely], {
        name: name,
        size: 1
    });    }
    
    this.glider=theglider;
    this.disabled=false;
    this.hidden=true;
	if (doDrawGuide) this.lines.push(drawGuide(theglider,theaxis));
  
    var updateValuesOnDragY=function(){
    	
        setValuesFromGlider(theglider.Y());
       
        theIntGraph.propagateVariableChange();
    };                    
       
    var updateValuesOnDragX=function(){
     	
        setValuesFromGlider(theglider.X());
        theIntGraph.propagateVariableChange();
    };                    
   
    if (theaxis=='y')  theglider.on('drag', updateValuesOnDragY);
    if (theaxis=='x')  theglider.on('drag', updateValuesOnDragX);
   var theSMControl=this;
    var updateGliderOnVariablesChangeY=function(){
        var currentval=getValueForGlider(theSMControl);
        theglider.moveTo([theglider.X(), currentval]); 
        return;
    };                    
      
    var updateGliderOnVariablesChangeX=function(){
         var currentval=getValueForGlider(theSMControl);
        theglider.moveTo([currentval, theglider.Y()]);
          return;
    }; 
    
    if (theaxis=='y') theIntGraph.propagateFunctions.push(updateGliderOnVariablesChangeY);
     if (theaxis=='x') theIntGraph.propagateFunctions.push(updateGliderOnVariablesChangeX);
    theSMBoard.gliderList.push(this);
    return this;

};

InteractiveGraph.prototype.show_gliders=function(){
  for (key in this.SMBoards) {
 	 for (var j = 0; j < this.SMBoards[key].gliderList.length; j++) {
  		 setVisible(this.SMBoards[key].gliderList[j]);
  		}
	}
}
InteractiveGraph.prototype.hide_gliders=function(){
  for (key in this.SMBoards) {
 	 for (var j = 0; j < this.SMBoards[key].gliderList.length; j++) {
  		 setInvisible(this.SMBoards[key].gliderList[j]);
  		}
	}
}
function setInvisible(theSMControl){
	theSMControl.glider.setProperty({ visible: false });
	theSMControl.glider.hidden=true;
	for (var i=0; i< theSMControl.lines.length; i++) {
		theSMControl.lines[i].setProperty({ visible: false }); 
		}
};

function setVisible(theSMControl){
	theSMControl.glider.setProperty({ visible: true });
	theSMControl.glider.hidden=false;
	for (var i=0; i< theSMControl.lines.length; i++) {
		theSMControl.lines[i].setProperty({ visible: true }); 
		}
};
//InteractiveGraph.prototype.createGraphs=function(){};

InteractiveGraph.prototype.init_jsxgraph=function(target){
	this.uid=target;
	
	this.AddGraphControls(target);
	this.createSliderControls($('#'+target).find('.controlsDiv:first'));
	this.resetVariables();
	this.createGraphs();
	this.resetGraph();
	this.hide_gliders();
	//     MathJax.Hub.Queue(["Typeset",MathJax.Hub]);  
	//		MathJax.Hub.Queue(function () {
	//				//window.parent.resize_iframe(document);
	//				self.parent.resize_iframe(document);
	  // 		}); 
};

InteractiveGraph.prototype.togglestyle=function(el){
    if(el.className == "on") {
    	el.className="off";
    	$(el).text("show annotations");
    	this.hide_gliders();
    } else {
    	el.className="on";
    	$(el).text("hide annotations");
    	this.show_gliders();
    }
}


InteractiveGraph.prototype.AddGraphControls=function(target){
	//$target_graph=$(target);
	var myIntGraph=this;
	var $controls=$('#'+target);
	$controls.find('button.anno_btn').click(function(){myIntGraph.togglestyle(this);});
	$controls.find("button.x_axis_in").click(function(){myIntGraph.zoomGraph("x",-0.33333);});
  	$controls.find("button.x_axis_out").click(function(){myIntGraph.zoomGraph("x",0.5);});
  	$controls.find("button.y_axis_in").click(function(){myIntGraph.zoomGraph("y",-0.33333);});
  	$controls.find("button.y_axis_out").click(function(){myIntGraph.zoomGraph("y",0.5);});
    $controls.find("button.resetButton").click(function(){myIntGraph.resetGraph();});
    $controls.find("button.rescale_all").click(function(){myIntGraph.rescaleGraph();});
}

var InteractiveGraphView=function(UID,target){
	this.el=$(this.template);
	this.el.attr('id',UID);
	$(target).append(this.el);
}

InteractiveGraphView.prototype.moveControls=function(title){
	firstgraph=this.el.find('.jsxgraph_outer:first');
	if (firstgraph.length==1) {
		firstgraph.after(this.el.find('.InteractiveGraph-toolbar'));
		}
}

InteractiveGraphView.prototype.setTitle=function(title){
	this.el.find('.InteractiveGraph-title').html(title);
}

InteractiveGraphView.prototype.setExplanation=function(explanation){
	this.el.find('.InteractiveGraph-explanation').html(explanation);
}

InteractiveGraphView.prototype.setDependentVariable=function(varstring){
	this.el.find('.dependent-varname').html(varstring);
}

InteractiveGraphView.prototype.setIndependentVariable=function(varstring){
	this.el.find('.independent-varname').html(varstring);
}

InteractiveGraphView.prototype.template='\
<div class="InteractiveGraph" >\
	<div class="InteractiveGraph-title">title</div>\
	<div class="InteractiveGraph-explanation">explanation</div>\
	<div class="InteractiveGraph-body">\
		<div class="InteractiveGraph-graphs">\
			<div class="InteractiveGraph-toolbar">\
				<div class="buttonholder">\
					<div class="buttonset_holder">\
						<button class="rescale_all rescaleButton">auto-rescale</button>&nbsp;&nbsp;\
						<button class="anno_btn off" ><div >show annotations</div></button>&nbsp;&nbsp;\
						x-axis\
						<button class="x_axis_in rescaleButton"><div class="nowidth" >+</div></button>\
						<button class="x_axis_out rescaleButton"><div class="nowidth" >-</div></button>\
						&nbsp;&nbsp;\
						y-axis\
						<button class="y_axis_in rescaleButton"><div class="nowidth" >+</div></button>\
						<button class="y_axis_out rescaleButton"><div class="nowidth" >-</div></button>\
						&nbsp;&nbsp;\
					</div><!--buttonset_holder-->\
				</div><!--buttonholder-->\
			</div><!-- InteractiveGraph-toolbar -->\
		</div><!-- InteractiveGraph-graphs -->\
		<div class="InteractiveGraph-controls">\
				<table class="variable_table" ><tbody >\
					<tr><td valign="top">Dependent variable</td>\
					<td valign="top">Parameters</td>\
					<td valign="top">Independent variable</td>\
					</tr>\
					<tr>\
					<td valign="top"><div class="dependent-varname varname"></div></td>\
					<td valign="top"><span class="controlsDiv"/></td>\
					<td valign="top"><div class="independent-varname"></div>\
					</td></tr>\
					</tbody>\
				</table>\
		</div><!-- InteractiveGraph-controls -->\
		<div class="buttonholder">\
		<div class="buttonset_holder">\
			<button class="resetButton">reset to default values</button>\
		</div></div>\
	</div><!--InteractiveGraph-body-->\
</div>';


function js_graphs_load_all(){
	
	$('div.interactive').each(function(){
		 $this=$(this);	
		 	 var func_name=$this.attr('id');

		eval(func_name+'("#'+func_name+'","'+func_name+'_inner")');
	});
}




