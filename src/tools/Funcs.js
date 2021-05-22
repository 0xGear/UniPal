export async function getEventInfo(tokenId,posContract){
    let _increaseLPEvent = posContract.getPastEvents('IncreaseLiquidity', {
        filter: { tokenId: [tokenId] },
        fromBlock: 0,
        toBlock: 'latest'
    })

    let _decreaseLPEvent = posContract.getPastEvents('DecreaseLiquidity', {
        filter: { tokenId: [tokenId] },
        fromBlock: 0,
        toBlock: 'latest'
    })

    let _collectEvent = posContract.getPastEvents('Collect', {
        filter: { tokenId: [tokenId] },
        fromBlock: 0,
        toBlock: 'latest'
    })

    let [increaseLPEvent,decreaseLPEvent,collectEvent]= await Promise.all([_increaseLPEvent, _decreaseLPEvent, _collectEvent])
    return [increaseLPEvent,decreaseLPEvent,collectEvent]
}

export async function getSingleCost(tokenId,event,web3,posContract){
    console.log("getSingleCost")
    let block = await web3.eth.getBlock(event.blockNumber)
    let timestamp = block.timestamp
    let date = new Date(timestamp * 1000).getDate()
    let month = new Date(timestamp * 1000).getMonth() + 1
    let year = new Date(timestamp * 1000).getFullYear()
    // todo :repeated
    let tokenInfo = await posContract.methods.positions(parseInt(tokenId))
            .call()
            .catch((e) => {
                alert('invalid token ID')
                window.location.reload(false)
            })
    let fetchCoin0 = fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenInfo.token0}`)
    .then((response) => response.json())
    .then((data) => {
        return data['id']
    })
    .then(async(id)=>{
       let _price = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/history?date=${date}-${month}-${year}`)
        .then((response) => response.json())
        .then((data) => {
                return data['market_data']['current_price']['usd']
            })
        return _price
    })
   
   let fetchCoin1 = fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${tokenInfo.token1}`)
    .then((response) => response.json())
    .then((data) => {
        return data['id']
    })
    .then(async(id)=>{
        let _price = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/history?date=${date}-${month}-${year}`)
            .then((response) => response.json())
            .then((data) => {
                return data['market_data']['current_price']['usd']
            })
        return _price
    })

    let [price0,price1] = await Promise.all([fetchCoin0,fetchCoin1])
    let mul = (event.event=="IncreaseLiquidity")? 1:-1
    console.log("amount0",event.returnValues.amount0)
    console.log("amount1",event.returnValues.amount1)
    return ((parseFloat(price0)*parseFloat(event.returnValues.amount0)+parseFloat(price0)*parseFloat(event.returnValues.amount0))*mul)
}
/*
function lineup(events) {
    return new Promise(async (resolve, reject) => {
        for (let e in events) {
            let blocknumber = events[e]['blockNumber']
            let timestamp
            await web3.eth.getBlock(blocknumber)
                .then((block) => {
                    timestamp = block.timestamp
                    console.log("blocknumber", blocknumber)
                    console.log("timestamp", timestamp)
                    if (timemap.has(timestamp)) {
                        let list = timemap.get(timestamp)
                        list.push(events[e])
                        timemap.set(timestamp, list)
                    }
                    else
                        //console.log(events[e])
                        timemap.set(timestamp, [events[e]])
                })
                .catch((err) => console.log(err))
        }
        resolve()
    })
}

function outputmap(map) {
    for (let [key, value] of map) {
        console.log(key + ":" + value)
    }
}

*/