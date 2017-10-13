function make_repressilator(target_element,unique_name){
	
	var myIntG=new InteractiveGraph;
	
	myIntG.max_x = 1000;
	var L= new variable(70, 70, 0, 70, 0.01, 0, 'Light');
	var Vmax= new variable(11520, 11520, 0, 11520, 0.01, 0, 'Vmax');
	var Km= new variable(0.0147, 0.0147, 0, 0.1, 0.0001, 0, 'Km');
    //var EL222d_0= new variable(0.000237, 0, 0, 0.000237, 0.01, 0, 'EL222d');
    //var mRNA_0= new variable(0, 0, 0, 1, 0.01, 0, 'mRNA');
    //var Pc_0= new variable(0, 0, 0, 1, 0.01, 0, 'Pc');
    //var Ps_0= new variable(0, 0, 0, 1, 0.01, 0, 'Ps');


    //(value, initial, min,max,step, DP, name)

	var data_x=[];
	var data_EL222d=[];
	var data_mRNA=[];
	var data_Pc=[];
	var data_Ps=[];

	myIntG.variables = [ L, Vmax, Km];
	var I = [0, 35];
	var N = 8000;
	var x0;//=[EL222d_0.val(),mRNA_0.val(),Pc_0.val(),Ps_0.val()]    ;


    function light(L) {
        return ((1545*Math.pow(L.val(), 2))/(Math.pow(1.052, 2)+Math.pow(L.val(), 2)));
	}
	
	function ode() {
	
			var f = function(t, x) {   
			   var y = [];
			
				var EL222d = x[0];
				var mRNA= x[1];
				var Pc= x[2];
				var Ps = x[3];

				var EL222inactive= 0.032;
				var k2= 108/25;
				var k3= 3600/660;
				var d1= 60/300;
				var d2=60/20;
				var a= 0.07;
                var b= (Pc / (Pc+ Km.val())) * n * Vmax.val();
                var n= 1 - (Ps/1.24);

                dEL222d = a+(light(L) * (Math.pow(EL222inactive,2)) - (k2 * EL222d));
                dmRNA = (k2 * EL222d) - (d1 * mRNA) - (k3 * mRNA);
                dPc = (k3 * mRNA) - (d2 * Pc) - (b * Pc);
                dPs = (b * Pc) -d2*(Ps);


			
				//dEL222d = (0.2*Math.pow(10,-5))+(light(L)*Math.pow(EL222d, 2))-(4.32*EL222d);//basal expression missing //
				//dmRNA = (4.32*EL222d)-(3*mRNA)-(5.45*mRNA);
				//dPc = (((Math.pow(2,Pc)*Math.pow((1-(Pc/0.00000648)),-3-Vmax.val()))+(Pc*((mRNA*5.45)-(3*Km.val())))+((mRNA*5.45)*Km.val()))/(Km.val()+Pc));
				//dPs  = ((((Pc*Vmax.val())/(Pc+Km.val()))*Math.pow((1-(Pc/0.00000648))))*Pc)-(3*Ps);

				y = [dEL222d, dmRNA, dPc, dPs];
				return y;
	
			}

			var data = JXG.Math.Numerics.rungeKutta('euler', x0, I, N, f);
	
			var t = [];
			var q = I[0];
			var h = (I[1]-I[0])/N;
			for(var i=0; i<N; i++) {
				data_EL222d[i]=data[i][0];
				data_mRNA[i]=data[i][1];
				data_Pc[i]=data[i][2];
				data_Ps[i]=data[i][3];

				 data_x[i]=q;
				q += h;
			}
			return data;
	}
	
	function init_data_arrays(){
		 for(var i=0; i<N; i++) {
			data_x.push(0);
			data_EL222d.push(0);
			data_mRNA.push(0);
			data_Pc.push(0);
			data_Ps.push(0);
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
			var limits_EL222d=find_max_min(data_EL222d);
			var limits_mRNA=find_max_min(data_mRNA);
			var limits_Pc=find_max_min(data_Pc);
			var limits_Ps=find_max_min(data_Ps);
			var minY=Math.min(limits_EL222d.min, limits_mRNA.min, limits_Pc.min, limits_Ps.min);
			var maxY=Math.max(limits_EL222d.max, limits_mRNA.max, limits_Pc.max, limits_Ps.max);
			
			var maxX = 100;
			var minX=0;
			//var maxY = 20;
			//var minY = 0;
			scaleGraph(this.board, minX, maxX, minY, maxY);
	}
	
	myIntG.createGraphs=function() {
		
		init_data_arrays();
		function updatePoints(){
		x0=[0.000237, 0, 0, 0];
		//x0=[EL222d_0.val(),mRNA_0.val(),Pc_0.val(),Ps_0.val()];
			ode();	
		};
		myIntG.propagateFunctions.push(updatePoints);
		//	updatePoints();
		myIntG.SMBoards['main']= myIntG.AddSMBoard(300,500);

		myIntG.SMBoards['main'].rescale=universalRescale;
	
		var thegraph_EL222d=myIntG.SMBoards['main'].createGraph('curve',[data_x,data_EL222d]);
	
		var thegraph_mRNA=myIntG.SMBoards['main'].createGraph('curve',[data_x,data_mRNA]);
		thegraph_mRNA.setAttribute({strokeColor: 'red' });

		var thegraph_Pc=myIntG.SMBoards['main'].createGraph('curve',[data_x,data_Pc]);
		thegraph_Pc.setAttribute({strokeColor: 'green' });

        var thegraph_Ps=myIntG.SMBoards['main'].createGraph('curve',[data_x,data_Ps]);
        thegraph_Ps.setAttribute({strokeColor: 'yellow' });
	
	}
	
	var myIntView=new InteractiveGraphView(unique_name,target_element);
	myIntView.setTitle('Interactive graph: The repressilator');
   	myIntView.setExplanation('Output of the three gene repressilator network.');
	myIntView.setDependentVariable('$\\color{green}{EL222d},\\color{blue}{mRNA},\\color{red}{Pc},\\color{yellow}{Ps}$<br>Concentration of Species</div>');
	myIntView.setIndependentVariable('$t$<br>Time');
	myIntG.init_jsxgraph(unique_name);
}
