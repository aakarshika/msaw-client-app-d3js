function rendernext(){
    attnode = attnode.data(attributesData)
        .enter().append("rect")
        .attr("width", function(d) {
            return d.width;
        })
        .attr("height", function(d) {
            return d.height;
        })
        // .attr("rx", 5).attr("ry", 5)
        .attr("class", "attnode")
        .style("fill", function(d, i) {
            return d.color;
        })
        .on("click",function(d){
            if(d.group!=procNamesData[0].name){
                if(data["targetVariables"].length==0)
                    data["targetVariables"].push({"name":d.group+"."+d.name});
                else{
                    data["targetVariables"].shift();
                    data["targetVariables"].push({"name":d.group+"."+d.name});
                    
                }
               // console.info(JSON.stringify(data["targetVariables"]));
                d3.selectAll(".attnode").transition()
                .attr("width", function(d) {
                    return d.width;
                })
                .attr("height", function(d) {
                    return d.height;
                })
                .style("fill", function(d, i) {
                    return d.color;
                });
                d3.select(this).transition()
                .attr("width", function(d) {
                    return d.width+4;
                })
                .attr("height", function(d) {
                    return d.height+2;
                })
                .style("fill", function(d, i) {
                    return "#ffdd99";
                });
            }

        })
    //  .call(cola.drag)
    ;
    label = label.data(attributesData, function(d) {
             return d.group+d.name;
        })
        .enter()
        .append("text")
        .attr("class", "label")
        .text(function(d) {
            if((d.group)==(procNamesData[0].name))
                return d.name + ": " + d.value.substring(0,d.value.length-12);
            return d.name + ": " + d.value.substring(0,d.value.length-12)   ;
        })
        .call(cola.drag);

    labelH = labelH.data(procNamesData, function(d) {
            return d.name;
        })
        .enter()
        .append("text")
        .attr("class", "labelH")
        .text(function(d) {
            return d.name;
        })
        .call(cola.drag);
}


data["inputs"]={};

data["inputs"]["optimise"]="max";
$(document).on("change","input[type=radio]",function(){
    var optimise=$('[name="optimise"]:checked').val();
    data["inputs"]["optimise"]="min";
    console.info(optimise);
});

$body = $("body");

function runOptimalCVF()
{

    var displayCases=$("#displayCases").val();
    var totalCases=$("#totalCases").val();
    if(data["targetVariables"]==null)
    {
        alert("Select an output attribute for optimal control value analysis.");
    }
    else{
        if(displayCases=="" || totalCases=="")
            alert("Number of cases cannot be empty. Enter an integer.");
        else{
            data["inputs"]["totalCases"]=totalCases;
            data["inputs"]["displayCases"]= displayCases;
            // data["inputs"]["totalCost"]= $("#cost").val();
            // data["inputs"]["totalTime"]= $("#time").val();
            // data["inputs"]["totalQualityRate"]= $("#qrate").val();
            // data["inputs"]["totalEvaluationMeasure"]= $("#emeasure").val();
            var passcode=prompt("Please enter a unique code for this run.");
            if(passcode!=null)
            {
                data["passcode"]=passcode;
                //post data

$body.addClass("loading");

                var postingData=JSON.parse(initialinput);
                postingData["targetVariables"]=data["targetVariables"];
                postingData["inputs"]=data["inputs"];
                postingData["passcode"]=data["passcode"];

                
                console.info("posting data: "+JSON.stringify(postingData));

                d3.xhr(BACKEND_URL+"optimal")
                    .header("Content-Type", "application/json")
                    .post(
                        JSON.stringify(postingData),
                        function(err, rawData){
                            console.info(rawData.response);
                            // j2= JSON.parse(rawData.response);
                            // allNodesData=j2.processes;
                            // updateAttrib(allNodesData);
            $body.removeClass("loading"); 

                            // update();
                        }
                    );

                alert("Your analysis is running. Come back after a while to retrieve your data.");
            }
        }
    }
    console.info(JSON.stringify(data));

}
var processSets;

function getPrevAnalysis(){
    var pass=prompt("Enter passcode to access your data.");
    //get json for chart.
    //chart se select kar ke get attribs

    // d3.json(BACKEND_URL+"optimalChart/"+pass,function(err, j) {          
    //     var ready=1;
    //     if(ready==0)
    //         alert("Analysis not ready yet.\n Please come back after a while.");
    //     else if(ready==9)
    //         alert("No data for such passcode.");
    //     else{
    //         var caseValues=j.values;
    //         //var xAxis=j.xAxis;
    //         renderChart();
    //     }
    // });
    d3.json(BACKEND_URL+"alloptimal/"+pass,function(err, j2) {          
            processSets=j2.processSets;
            getChartValues(j2);
            //setDownloadLink(j2.pathToCSV);
        
    });

   
    
}
function getChartValues(j){
	targetVariable=j.processSets[0].targetVariables[0];
	var caseValues={"values":[]};
	j.processSets.forEach(function(p){
		p.processes.forEach(function(pro){
			pro.output.properties.forEach(function(att){
				if(targetVariable==att.name){
					caseValues.values.push(att.value);
				}
			});
		});
	});
	console.info('chart: '+JSON.stringify(caseValues));

    renderChart(caseValues.values);
}
function renderChart(caseValues)
{

    
    var no=caseValues.length;

    console.info("renderchart");
    var dataChart = {
        "start": 1,
        "end": no,
        "step": (no<12 ? 1 : no/10),
        "names": ["Case Values"],
        "values": [[23,46,7,8,4,5,7,5,4,3,3]]
    };


    $("#chart").html("");
    var l1 = new LineGraph({
        containerId: "chart",
        data: dataChart
    });


    
    var x = document.getElementById('chartButton');
    x.style.display = 'block';
    var y = document.getElementById('downloadButton');
    y.style.display = 'block';
}
function setDownloadLink(pathToCSV)
{
    $('#downloadButton').attr("href", pathToCSV);
}
function showChart()
{
    
     $('#dialogChart').dialog({
            modal: true,
            width: 400,
            height: 405,
            dialogClass: "dlg-no-title",

            buttons:{
            	 Select_case : function() {
				    var caseId = $('#ipcase').val();
                    console.info("case selected"+caseId);
                    getCaseData(caseId);
                    $(this).dialog("close"); 

                },
            	 Close : function() {
                    $(this).dialog("close"); 

                }
            }
        }
    ); 
     //getcaseanalysis
}

function getCaseData(caseId) {
            
    allNodesData=processSets[caseId];
    updateAttrib(allNodesData.processes);

    update();
    console.info("Process Model updated for case: "+caseId);
}

function update() {
    label.data(attributesData)
        .transition()
        .delay(500)
        .text(function(d) {
            return d.name + ": "+d.value.substring(0,d.value.length-12);
        });

    attnode.data(attributesData)
        .transition()
        .duration(750)
        .styleTween("fill", function(d) {
            if(d.group!=procNamesData[0].name)
                 return d3.interpolate("#ffffff", "#ffffcc");
            else
                return;
         });
}

function updateAttrib(allNodesData)
{
    var k=0;
    allNodesData.forEach(function(v){
        // v.output.properties.forEach(function(v){
        //     attributesData[k++]=n;
        // });

        v.output.properties.forEach(function(a){

            var aname=a.name.split(".")[1];
            a.name=aname;
            // console.info(a);
            a.group=v.ID;
            a.width=aWidth;
            a.height=aHeight;
            a.color="#fff";
//            a.id=TI;
            attributesData[k++]=(a);
        });
        

    });

}