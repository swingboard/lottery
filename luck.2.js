let peilv = [
    3.5,
    2.2
];
let max_pay = 100;


let x=1, y=1;
let profit1 = 0, profit2 = 0;
let percent1 = 0, percent2 = 0, min_percent = 0;
let final_percent = 0, final_x = 1, final_y = 1, final_percent1 = 0, final_percent2 = 0,
final_profit1 = 0, final_profit2 = 0;

for(let i=0; i<max_pay; i++){
    x = 1;
    x = x+i;
    let y_loop = max_pay - x;
    
    if(y_loop<0){
        //console.log(`<0, ${x},${y}`);
        continue;
    }
    else{
        //console.log(`>=0, ${x},${y}`);
        
        for(let j=0; j<y_loop; j++){
            y = 1;
            y = y+j;
            // console.log(`${x},${y},loop:${y_loop}`);

            profit1 = x*peilv[0] - x - y;
            profit2 = y*peilv[1] - x - y;
            percent1 = (profit1*100/(x+y));
            percent2 = (profit2*100/(x+y));
            min_percent = percent1 < percent2 ? percent1 : percent2;
            if(final_percent < min_percent){
                final_percent = min_percent;
                final_x = x;
                final_y = y;
                final_percent1 = percent1;
                final_percent2 = percent2;
                final_profit1 = profit1;
                final_profit2 = profit2;
            }
            

            if(profit1 > 0 && profit2 > 0){
                // console.log(`x:${x}(${peilv[0]}), y:${y}(${peilv[1]}), min:${min_percent.toFixed(2)}%, percent1:${percent1.toFixed(2)}%, percent2:${percent2.toFixed(2)}%,profit1:${profit1.toFixed(2)}, profit2:${profit2}`);
            }
            else{
                //console.log(`profit noe`);
            }
        }

    }
}

console.log(`final_x:${final_x}(${peilv[0]}), final_y:${final_y}(${peilv[1]}), final_percent:${final_percent.toFixed(2)}%,final_percent1:${final_percent1.toFixed(2)}%, final_percent2:${final_percent2.toFixed(2)}%,final_profit1:${final_profit1.toFixed(2)}, final_profit2:${final_profit2}`);



