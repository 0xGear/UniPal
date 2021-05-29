import { Token, CurrencyAmount, WETH9, currencyEquals } from '@uniswap/sdk-core'
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

export async function getSingleHisCost(tokenId,tokenInfo,event,web3,posContract,UNI_TOKEN0,UNI_TOKEN1){
    let date = new Date(event.timestamp * 1000).getDate()
    let month = new Date(event.timestamp * 1000).getMonth() + 1
    let year = new Date(event.timestamp * 1000).getFullYear()
    // todo :repeated
    let _price0 = fetch(`https://api.coingecko.com/api/v3/coins/${tokenInfo.id0}/history?date=${date}-${month}-${year}`)
    .then((response) => response.json())
    .then((data) => {
        event.hisPriceUsd0 = data['market_data']['current_price']['usd']
        event.hisPriceEth0 = data['market_data']['current_price']['eth']
        return data['market_data']['current_price']['usd']
    })
    let _price1 = fetch(`https://api.coingecko.com/api/v3/coins/${tokenInfo.id1}/history?date=${date}-${month}-${year}`)
    .then((response) => response.json())
    .then((data) => {
        event.hisPriceUsd1 = data['market_data']['current_price']['usd']
        event.hisPriceEth1 = data['market_data']['current_price']['eth']
        return data['market_data']['current_price']['usd']
    })
    let [price0,price1] = await Promise.all([_price0,_price1])
    let mul = (event.event==="IncreaseLiquidity")? 1:-1
    let _amount0 = (CurrencyAmount.fromRawAmount(UNI_TOKEN0, event.returnValues.amount0).toFixed())
    let _amount1 = (CurrencyAmount.fromRawAmount(UNI_TOKEN1, event.returnValues.amount1).toFixed())
    let investment = ((parseFloat(price0)*parseFloat(_amount0)+parseFloat(price1)*parseFloat(_amount1))*parseInt(mul))
    event.date = date
    event.month = month
    event.year = year
    event.investment = investment
    event.amount0 = _amount0
    event.amount1 = _amount1
    let costdata = {
        usd: investment,
        token0: parseFloat(_amount0)*Number(mul),
        token1: parseFloat(_amount1)*Number(mul),
        price0: event.hisPriceUsd0,
        price1: event.hisPriceUsd1,
    }
    return [costdata,event]
}


export function calIL(lastAsset,finalAsset,finalPrice){
    return "$ "+((finalAsset.tkn0 - lastAsset.tkn0)*finalPrice.tkn0+(finalAsset.tkn1-lastAsset.tkn1)*finalPrice.tkn1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})
}