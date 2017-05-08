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
            //if(d.group==procNamesData[4].name){
                data["outputTargetAttribute"]={"tag":d.group,"attribute":d.name};
                d3.selectAll(".attnode").transition()
                 .style("fill", function(d, i) {
                    return d.color;
                });
                d3.select(this).transition()
               .style("fill", function(d, i) {
                    return "#ffdd99";
                });
            

        })
    //  .call(cola.drag)
    ;

    //   node.exit().remove();
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

function tick2() {

    console.info("tick");

    node
        .attr("x", function(d) {
            return d.x - d.width / 2 + pad;
        })
        .attr("y", function(d) {
            return d.y - d.height / 2 + pad;
        });
    attnode
        .attr("x", function(d) {
            return d.x - d.width / 2 + pad;
        })
        .attr("y", function(d) {
            return d.y - d.height / 2 + pad;
        });
    group
        .attr("x", function(d) {
            return d.bounds.x;
        })
        .attr("y", function(d) {
            return d.bounds.y;
        })
        .attr("width", function(d) {
            return d.bounds.width() + gpad;
        })
        .attr("height", function(d) {
            return d.bounds.height() + gpad;
        });
    link
        .attr("x1", function(d) {
            return d.source.x;
        })
        .attr("y1", function(d) {
            return d.source.y;
        })
        .attr("x2", function(d) {
            return d.target.x;
        })
        .attr("y2", function(d) {
            return d.target.y;
        });
    label
        .attr("x", function(d) {
            return d.x - d.width/2 +4;
        })
        .attr("y", function(d) { //return d.y;
            var h = this.getBBox().height;
            return d.y + h / 4;
        });
    labelH
        .attr("x", function(d) {
            return d.x;
        })
        .attr("y", function(d) { //return d.y;
            var h = this.getBBox().height;
            return d.y + h / 4;
        });
    // img
    //     .attr("x", function(d) {
    //         return d.x + d.width/2 -d.height/2 -3;
    //     })
    //     .attr("y", function(d) {
    //         var h = this.getBBox().height;
    //         return d.y -h/2;
    //     });
}

data["inputs"]={};

data["inputs"]["optimise"]="max";
$(document).on("change","input[type=radio]",function(){
    var optimise=$('[name="optimise"]:checked').val();
    data["inputs"]["optimise"]="min";
    console.info(optimise);
});

$body = $("body");


function runPrediction()
{
    data["inputs"]=[];
    var lessthan=$("#lessthan").val();
    var morethan=$("#morethan").val();
    data.inputs.lessthan=lessthan;
    data.inputs.morethan=morethan;

    if(data["targetVariables"]==null)
    {
        alert("Select an output attribute for prediction and alarm analysis.");
    }
    else{
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

                d3.xhr(BACKEND_URL+"prediction")
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
    console.info(JSON.stringify(data));

}

var processSets;

function getPrevPrediction(){
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
    d3.json(BACKEND_URL+"allprediction/"+pass,function(err, j2) {          
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
        "names": ["Item Flows"],
        "values": [caseValues]
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