import imageUrls from '../static/img/char/*.png'

var firstColors = ['pos','even','neg'];

let smashDBSorted = [];

function init() {


    for(var i=0;i<smashDBSorted.length;i++){
        var clone = $("#trCloneVert").clone();
        clone.attr("id","x"+i);
        clone.addClass("cln");
        clone.find(".nombreVert").html(smashDBSorted[i].name);
        clone.find(".imgVert").attr("src",(imageUrls[smashDBSorted[i].imageId] ));
        $(".tbodyVert").append(clone);

        var cloneHor = $("#thClone").clone();
        cloneHor.addClass("cln");
        cloneHor.attr("id","y"+i);
        cloneHor.find(".imgHor").attr({"src":(imageUrls[smashDBSorted[i].imageId]),"title":smashDBSorted[i].name});

        $("#headerHorizontal").append(cloneHor);


        var cloneCell = $("#trCloneHor").clone();
        cloneCell.addClass("cln");
        cloneCell.attr("id",null);
        cloneCell.find("#tbodyHor").append(cloneCell);
        $("#tbodyHor").append(cloneCell);


        for(var j=0;j<firstColors.length;j++){

            var cloneTing = $("#tdCloneHor").clone();
            cloneTing.addClass("cln");
            cloneTing.attr("id",null);
            cloneTing.addClass("match-" + firstColors[j])
                .addClass("match-info-" + i);

            cloneCell.append(cloneTing);
        }

        for(var k=0;k<smashDBSorted.length;k++){

            var cloneTd = $("#tdCloneHor").clone();

            cloneTd.addClass("cln");
            cloneTd.attr("id",null);
            cloneTd.addClass("cells-x"+i);
            if(i == k){
                cloneTd.addClass("match-cell-mirror");
            }
            else{
                cloneTd.attr("title", ("Change your opinion on " + smashDBSorted[i].name + " against " + smashDBSorted[k].name + '.'));
            }

            const matchPair = localStorage.getItem(`pair-${i}-${k}`);

            cloneTd.addClass("match-pair-"+(matchPair || 'e'));
            cloneTd.data({"x":i,"y":k});
            cloneTd.attr({"id": `cell-${i}-${k}`, "data-pair": (matchPair || 'e')});
            cloneCell.append(cloneTd);
        }

        calculateInfo(i)


    }

    $(".tbodyVertTarget").append($(".tbodyVert").html());

    $("#tableFixedTr").html($("#headerHorizontal").html());


    var win = $(window);

    win.on('scroll', function (e){

        $(".tbodyVertTarget").toggleClass("scrolled-left", win.scrollLeft() > 10);

        $("#tableFixedContainerVert").animate({scrollTop:win.scrollTop()},0);
        $("#tableFixedContainer").animate({scrollLeft:win.scrollLeft()},0);
    });

    $(".match-cell").on("mouseenter",function () {
        $("#tableFixedContainer").find(".thHort").addClass("unhover-char");
        $("#tableFixedContainerVert").find(".trVert").addClass("unhover-char");
        $("#x"+$(this).data("x")+",#y"+$(this).data("y")).removeClass("unhover-char");
        $(".hoverRow").removeClass("hoverRow");
    });

    $("#header-container,#tableFixedContainer").on("mouseenter",function () {
        $(".unhover-char").removeClass("unhover-char");
        $(".hoverRow").removeClass("hoverRow");
    });

    $(".trVert").on("mouseenter",function () {

        $("#tableFixedContainerVert").find(".trVert").addClass("unhover-char");
        $(this).removeClass("unhover-char");
        $(".hoverRow").removeClass("hoverRow");
        $(".cells-"+this.id).addClass("hoverRow");
    });
    const slider = $("#my-vote-slider");
    const cardContainer = $("#votes-card-container");
    let currentPair = { x: 0, y: 0};


    $(".match-cell").click(function () {
        var x= $(this).data('x');
        var y= $(this).data('y');

        currentPair = { x: x, y: y};

        let setValX = 50;
        let setValY = 50;

        const pairData = localStorage.getItem(`pair-${x}-${y}`);
        if(pairData){
            var sliderVal =chances.indexOf(pairData)
            slider.val(sliderVal);
            setValY = getPercentageVal(sliderVal);
            setValX = 100 - setValY;
            $("#match-chances").attr("class","match-chances-"+pairData);
            cardContainer.removeClass("empty");
        }else {
            slider.val(3);
            cardContainer.addClass("empty");
        }

        $("#my-vote-x").html(setValX);
        $("#my-vote-y").html(setValY);

        $("#vote-x").attr("src",(imageUrls[smashDBSorted[x].imageId]));
        $("#vote-y").attr("src",(imageUrls[smashDBSorted[y].imageId]));
        $("#vote-x-name").html(smashDBSorted[x].name);
        $("#vote-y-name").html(smashDBSorted[y].name);
        $("#votes-card-container").fadeIn(200);
		//$(".match-cell").not("#trCloneVert, #thClone, #trCloneHor, #tdCloneHor").remove();
    });

    $("#votes-closer, #votes-card-overlay").click(function(){
        $("#votes-card-container").fadeOut(200);
    });

    slider.on("input",function(){
        cardContainer.removeClass("empty");
        var val = getPercentageVal($(this).val());
        $("#my-vote-x").html(100-val);
        $("#my-vote-y").html(val);

        const matchValue = chancesFixed[Math.round(val/10)];
        const mirrorMatchValue = matchValue * -1;

        $("#match-chances").attr("class","match-chances-"+matchValue);

        const x = currentPair.x;
        const y = currentPair.y;

        localStorage.setItem(`pair-${x}-${y}`,
            matchValue);
        localStorage.setItem(`pair-${y}-${x}`,
            mirrorMatchValue);

        const thisCell = $(`#cell-${x}-${y}`);
        const mirrorCell = $(`#cell-${y}-${x}`);

        thisCell.attr({'class':removePair, 'data-pair': matchValue});
        thisCell.addClass("match-pair-"+matchValue)
        mirrorCell.attr({'class':removePair, 'data-pair': mirrorMatchValue});
        mirrorCell.addClass("match-pair-"+mirrorMatchValue)
        calculateInfo(x, y)


    });

    const removePair = function(i, c){
        return c.replace(/(^|\s)match-pair-\S+/g, '');
    }
}

const calculateInfo = (x, mirrorX = null) => {
    //['tier','pos','neg','even'];

    const check = [x];

    if(mirrorX){
        check.push(mirrorX);
    }

    check.forEach(data => {
        let pos = 0;
        let neg = 0;
        let even = 0;
        smashDBSorted.forEach((char,idx) => {
            const numb = parseInt($(`#cell-${data}-${idx}`).attr('data-pair'));
            if(numb > 0){
                pos++;
            } else if (numb < 0) {
                neg++;
            } else if (!isNaN(numb)) {
                even++;
            }
        });
        const posMOST = pos > neg && pos > even;
        const negMOST = neg > pos && neg > even;
        const evenMOST = even > pos && even > neg;

        const tableRow = $(`#x${data}`);
        const classRow = $(`.match-info-${data}`);
        classRow.removeClass("most");
        classRow.filter('.match-pos').html(pos).addClass(posMOST ? "most" : "");
        tableRow.find('.mini-pos').html(pos);
        classRow.filter('.match-neg').html(neg).addClass(negMOST ? "most" : "");
        tableRow.find('.mini-neg').html(neg);
        classRow.filter('.match-even').html(even).addClass(evenMOST ? "most" : "");
        tableRow.find('.mini-even').html(even);


    })

}

var chances = [];
chances[0] = '3';
chances[1] = '2';
chances[2] = '1';
chances[3] = '0';
chances[4] = '-1';
chances[5] = '-2';
chances[6] = '-3';
var chancesFixed = [];
chancesFixed[0] = chances[0];
chancesFixed[2] = chances[1];
chancesFixed[3] = chances[2];
chancesFixed[5] = chances[3];
chancesFixed[7] = chances[4];
chancesFixed[8] = chances[5];
chancesFixed[10] = chances[6];

function getPercentageVal(numb) {
    return Math.round(numb * 16.6);
}

$(function() {

    smashDBSorted = smashDB.sort(function (a,b) {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        // a must be equal to b
        return 0;
    })

    init();

    $(".logo").click(function () {
        $(".cln").remove();
        setTimeout(function () {

            init();
        },1000);
    });



});
