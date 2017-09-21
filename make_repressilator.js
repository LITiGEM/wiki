function make_repressilator(target_element,unique_name){
	
	var myIntG=new InteractiveGraph;
	
	myIntG.max_x = 1000;
	var alpha= new variable(1000, 1000, 0, 1000, 0.01, 0, 'alpha');
	var beta= new variable(5, 5, 0, 50, 0.01, 0, 'beta');
	var n= new variable(2, 2, 0, 10, 1, 0, 'n');
	var alpha_0= new variable(1, 1, 0, 50, 0.01, 0, 'alpha_0');
	var m1_0 = new variable(0, 0, 0, 50, 0.01, 0, 'm_1(0)');
	var p1_0 = new variable(1, 1, 0, 50, 0.01, 0, 'p_1(0)');
	var m2_0 = new variable(0, 0, 0, 50, 0.01, 0, 'm_2(0)');
	var p2_0 = new variable(1, 1, 0, 50, 0.01, 0, 'p_2(0)');
	var m3_0 = new variable(0, 0, 0, 50, 0.01, 0, 'm_3(0)');
	var p3_0 = new variable(1, 1, 0, 50, 0.01, 0, 'p_3(0)');

	
	
	var data_x=[];
	var data_p1=[];
	var data_m1=[];
	var data_p2=[];
	var data_m2=[];
	var data_p3=[];
	var data_m3=[];
	var data_p4=[];
	var data_m4=[];
	myIntG.variables = [alpha,alpha_0,beta,n,m1_0,p1_0,m2_0,p2_0,m3_0,p3_0]; 
	 var I = [0, 35];
	var N = 8000;
	var x0;//=[m1_0.val(),p1_0.val(),m2_0.val(),p2_0.val(),m3_0.val(),p3_0.val()]    ;
	
	
	function mRNA(m, p) {
		return -1 * m + alpha.val() / (1 + Math.pow(p, n.val())) + parseFloat(alpha_0.val());
	}
	
	function protein(m, p) {
		return -1 * beta.val() * (p - m);
	}
	
	function ode() {
	
			var f = function(t, x) {   
			   var y = [];
			
				var m1 = x[0];
				var p1 = x[1];
				var m2 = x[2];
				var p2 = x[3];
				var m3 = x[4];
				var p3 = x[5];
			
				dp1 = protein(m1, p1);
				dp2 = protein(m2, p2);
				dp3 = protein(m3, p3);
			
				dm1 = mRNA(m1, p3);
				dm2 = mRNA(m2, p1);
				dm3 = mRNA(m3, p2);
			
				y = [dm1, dp1, dm2, dp2, dm3, dp3];
				return y;
	
			}
	
	
			var data = JXG.Math.Numerics.rungeKutta('euler', x0, I, N, f);
	
			var t = [];
			var q = I[0];
			var h = (I[1]-I[0])/N;
			for(var i=0; i<N; i++) {
				data_m1[i]=data[i][0];
				data_p1[i]=data[i][1];
				data_m2[i]=data[i][2];
				data_p2[i]=data[i][3];
				data_m3[i]=data[i][4];
				data_p3[i]=data[i][5];

	
				 data_x[i]=q;
				q += h;
			}
			return data;
	}
	
	function init_data_arrays(){
		 for(var i=0; i<N; i++) {
			data_x.push(0);
			data_m1.push(0);
			data_p1.push(0);
			data_m2.push(0);
			data_p2.push(0);
			data_m3.push(0);
			data_p3.push(0);

		 }
	}
	function find_max_min(myArray){
		var min=myArray[0];
		var max=myArray[0];
		for (var i=0; i<myArray.length; i++){
			if (min>myArray[i]) min=myArray[i];
			if (max<myArray[i]) max=myArray[i];
		}
		return {'min': min, 'max':max};
	}
	
	function universalRescale(){
	var limits_m1=find_max_min(data_m1);
			var limits_p1=find_max_min(data_p1);
			var limits_m2=find_max_min(data_m2);
			var limits_p2=find_max_min(data_p2);
			var limits_m3=find_max_min(data_m3);
			var limits_p3=find_max_min(data_p3);
			var minY=Math.min(limits_m1.min, limits_m2.min, limits_m3.min, limits_p1.min, limits_p2.min, limits_p3.min);
			var maxY=Math.max(limits_m1.max, limits_m2.max, limits_m3.max, limits_p1.max, limits_p2.max, limits_p3.max);
			
			var maxX = 15;
			var minX=0;
			//var maxY = 20;
			//var minY = 0;
			scaleGraph(this.board, minX, maxX, minY, maxY);
	
	}
	
	myIntG.createGraphs=function() {
		
		init_data_arrays();
		function updatePoints(){
		 x0=[m1_0.val(),p1_0.val(),m2_0.val(),p2_0.val(),m3_0.val(),p3_0.val()];   
			ode();	
		};
		myIntG.propagateFunctions.push(updatePoints);
		//	updatePoints();
		myIntG.SMBoards[ 'main' ]= myIntG.AddSMBoard(300,500);

		myIntG.SMBoards['main'].rescale=universalRescale;
	
		var thegraph_p1=myIntG.SMBoards['main'].createGraph('curve',[data_x,data_p1]);	
	
		var thegraph_p2=myIntG.SMBoards['main'].createGraph('curve',[data_x,data_p2]);	
		thegraph_p2.setAttribute({strokeColor: 'red' });

		var thegraph_p3=myIntG.SMBoards['main'].createGraph('curve',[data_x,data_p3]);	
		thegraph_p3.setAttribute({strokeColor: 'green' });
	
	}
	
	var myIntView=new InteractiveGraphView(unique_name,target_element);
	myIntView.setTitle('Interactive graph: The repressilator');
   	myIntView.setExplanation('Output of the three gene repressilator network.');
	myIntView.setDependentVariable('$\\color{green}{p_1},\\color{blue}{p_2},\\color{red}{p_3}$<br>protein concentration</div>');
	myIntView.setIndependentVariable('$t$<br>time');
	myIntG.init_jsxgraph(unique_name);
}
