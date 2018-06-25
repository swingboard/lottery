let peilv = [
    2.8,
    3,
    7,
    8
]


// let peilv_sort = peilv.sort((v1, v2)=>{
//     if(v1<v2){
//         return -1;
//     }
//     else if(v1>v2){
//         return 1;
//     }
//     else{
//         return 0;
//     }
// });
let peilv_sort = peilv;

//console.log(peilv_sort);

let num_arr = peilv_sort.map(()=>{
    return 1;   
})

let getArrSum = (arr)=>{
    let sum = arr.reduce((total, num)=>{
        return total + num;
    });

    return sum;
}
let sum = getArrSum(peilv_sort);
console.log('各一注，则获赔的期望值为: ' + sum/peilv_sort.length);
console.log('各一注，则亏损的期望值为: ' + peilv_sort.length);

//if(sum/peilv_sort.length > peilv_sort.length){
    //console.log('整体期望大于0，可以完全覆盖');


    
    let total_pay = 0; loop_count = 0;
    while(total_pay <= 2000){
        
        total_pay = getArrSum(num_arr);
        //console.log('loop ' + loop_count + ', total_pay ' + total_pay);

        let found = false;

        for(let j=0; j<peilv_sort.length; j++){
            let final = num_arr[j];
            while(final*peilv_sort[j] <= total_pay * 1){
                found = true;
                final++;
            }
            num_arr[j] = final;
        }

        loop_count ++;

        if(!found){
            console.log('第' + loop_count + '次结束');
            break;
        }

    }

    
    for(let i=0; i<peilv_sort.length; i++){
        console.log('赔率:' + peilv_sort[i] + '【' + num_arr[i] + '注】');
        //console.log('\t');
    }
    console.log('总投注:' + getArrSum(num_arr));
    console.log('赔率数:' + peilv_sort);
    console.log('投注数:' + num_arr);

    let pay = getArrSum(num_arr);
    let profit_arr = [];
    for(let i=0; i<num_arr.length; i++){
        profit_arr.push(num_arr[i] * peilv_sort[i] - pay);
    }

    console.log(profit_arr)

// }
// else{
//     console.log('无法完全覆盖');
// }



