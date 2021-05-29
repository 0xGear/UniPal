import { Component } from "react";
import BlackCard from '../components/BlackCard.js'
import Loading from '../components/Loading.js'
import EventInfoCard from "../components/EventInfoCard.js"
import AssetInfoCard from "../components/AssetInfoCard.js"
import Toggle from "../components/Toggle.js"
import {getEventInfo, getSingleHisCost, calIL} from "./Funcs.js"
import { Token, CurrencyAmount, WETH9, currencyEquals } from '@uniswap/sdk-core'
import { encodeSqrtRatioX96 } from '@uniswap/v3-sdk'
import nfpmAbi from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import swapRouterAbi from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import factoryAbi from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import poolAbi from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import erc20Abi from 'erc-20-abi'
import { Pool, TickMath, TICK_SPACINGS, FeeAmount, Position } from "@uniswap/v3-sdk";
import Web3 from 'web3';
import "../components/GrabData.scss"

export default class GrabData extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            heldintkn:false,
        }
        this.setLoading = this.setLoading.bind(this)
        this.changeHandler = this.changeHandler.bind(this)
        this.web3 = new Web3('https://eth-mainnet.alchemyapi.io/v2/5atvVrendBmTbMs--ytb0vC52Rp6r97n');
        let uniNonFungiblePositionManagerAddr = "0xc36442b4a4522e871399cd717abdd847ab11fe88";
        this.nfpm = new this.web3.eth.Contract(nfpmAbi.abi, uniNonFungiblePositionManagerAddr);
        let uniFactoryAddr = "0x1f98431c8ad98523631ae4a59f267346ea31f984";
        this.uniFactory = new this.web3.eth.Contract(factoryAbi.abi, uniFactoryAddr);
    }

    getTokenInfo = async(tokenId)=>{
        // get token address of (token0,token1)
        // important info in this.tokenInfo (liquidity,token0,token1,tickLower,tickUpper,fee)
        this.tokenInfo = await this.nfpm.methods.positions(parseInt(tokenId))
            .call()
            .catch((e) => {
                alert('invalid token ID')
                window.location.reload(false)
            })
        await this.setState({
            tokenId: tokenId,
            liquidity: this.tokenInfo.liquidity,
            token0: this.tokenInfo.token0,
            token1: this.tokenInfo.token1,
            tickLower: this.tokenInfo.tickLower,
            tickUpper: this.tokenInfo.tickUpper,
            fee: this.tokenInfo.fee
        })
        let poolAddr = await this.uniFactory.methods.getPool(this.state.token0, this.state.token1, this.state.fee).call();
        let pool = new this.web3.eth.Contract(poolAbi.abi, poolAddr);
        let poolSlot0 = await pool.methods.slot0().call();
        let poolLiquidity = await pool.methods.liquidity().call();
        let token0 = new this.web3.eth.Contract(erc20Abi, this.state.token0);
        let token1 = new this.web3.eth.Contract(erc20Abi, this.state.token1);
        this.UNI_TOKEN0 = new Token(1, this.state.token0, parseInt(await token0.methods.decimals().call()), await token0.methods.symbol().call(), await token0.methods.name().call());
        this.UNI_TOKEN1 = new Token(1, this.state.token1, parseInt(await token1.methods.decimals().call()), await token1.methods.symbol().call(), await token1.methods.name().call());
        this.UNI_POOL = new Pool(
            this.UNI_TOKEN0, this.UNI_TOKEN1, parseInt(this.state.fee),
            TickMath.getSqrtRatioAtTick(parseInt(poolSlot0.tick)),
            poolLiquidity,
            parseInt(poolSlot0.tick),
            []
        );
        this.UNI_POSITION = new Position({
            pool: this.UNI_POOL,
            liquidity: parseInt(this.state.liquidity),
            tickLower: parseInt(this.state.tickLower),
            tickUpper: parseInt(this.state.tickUpper)
        });
        this.setState({
            currentAmount0: this.UNI_POSITION.amount0.toFixed(),
            currentAmount1: this.UNI_POSITION.amount1.toFixed(),
            token0Str: this.UNI_POSITION.amount0.currency.symbol,
            token1Str: this.UNI_POSITION.amount1.currency.symbol
        })
    }

    getInitInfo = async (tokenId) => {
        let increase = this.nfpm.getPastEvents('IncreaseLiquidity', {
            filter: { tokenId: tokenId },
            fromBlock: 0,
            toBlock: 'latest'
        })
        this.tokenInfo = await this.nfpm.methods.positions(parseInt(tokenId))
            .call()
            .catch((e) => {
                alert('invalid token ID')
                window.location.reload(false)
            })
        this.increaseEvents = await increase
        //set state with init liquidity amount0 amount1
        let block = await this.web3.eth.getBlock(this.increaseEvents[0].blockNumber)
        this.setState({
            timeStamp: block.timestamp,
            initLiquidity: this.increaseEvents[0].returnValues.liquidity,
            initAmount0: CurrencyAmount.fromRawAmount(this.UNI_TOKEN0, this.increaseEvents[0].returnValues.amount0).toFixed(),
            initAmount1: CurrencyAmount.fromRawAmount(this.UNI_TOKEN1, this.increaseEvents[0].returnValues.amount1).toFixed(),
        })

    }

    getCurCost = async()=>{
        const fetchCoin0 = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${this.state.token0}`)
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    id0: data['id'],
                    curPriceUsd0: data['market_data']['current_price']['usd'],
                    curPriceEth0: data['market_data']['current_price']['eth']
                })
            })
            .catch(()=>{
                alert('unable to find current price value from coingeko')
                window.location.reload(false)
            })
        const fetchCoin1 = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${this.state.token1}`)
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    id1: data['id'],
                    curPriceUsd1: data['market_data']['current_price']['usd'],
                    curPriceEth1: data['market_data']['current_price']['eth']
                })
            })
            .catch(()=>{
                alert('unable to find current price value from coingeko')
                window.location.reload(false)
            })
    }

    getHisCost= async(tokenId,posContract,web3,UNI_TOKEN0,UNI_TOKEN1)=>{
        let[increaseLPEvent,decreaseLPEvent,collectEvent] = await getEventInfo(tokenId,posContract)
        let inDeEvents=[]
        this.eventLog = []
        inDeEvents = inDeEvents.concat(increaseLPEvent,decreaseLPEvent)
        let costs = await Promise.all(inDeEvents.map(async (e) => {
            let block = await web3.eth.getBlock(e.blockNumber)
            let timestamp = block.timestamp
            e.timestamp = timestamp
	        let [_singleCost,_eventLog] = await getSingleHisCost(tokenId,this.state,e,web3,posContract,UNI_TOKEN0,UNI_TOKEN1)
            this.eventLog.push(_eventLog)
            return _singleCost
        }))
        let collected = await Promise.all(collectEvent.map(async (e) => {
            let block = await web3.eth.getBlock(e.blockNumber)
            let timestamp = block.timestamp
            e.timestamp = timestamp
	        let [_singleCost,_eventLog] = await getSingleHisCost(tokenId,this.state,e,web3,posContract,UNI_TOKEN0,UNI_TOKEN1)
            return _singleCost
        }))
        let totalInput = 0
        let totalCollectedToken0 = 0
        let totalCollectedToken1 = 0
        let totalCollected = 0
        let totalInputToken0 = 0
        let totalInputToken1 = 0
        let totalDecrease = 0
        let totalDecreaseToken0 = 0
        let totalDecreaseToken1 = 0
        let totalIncrease = 0
        let totalIncreaseToken0 = 0
        let totalIncreaseToken1 = 0
        let lastDecrease = 0
        let lastDecreaseToken0 = 0
        let lastDecreaseToken1 = 0
        let lastDecreasePrice0 = 0
        let lastDecreasePrice1 = 0
        await costs.map((c)=>{
            if(c.usd<0){
                totalDecrease = totalDecrease+Number(c.usd)
                totalDecreaseToken0 = totalDecreaseToken0+Number(c.token0)
                totalDecreaseToken1 = totalDecreaseToken1+Number(c.token1)
                lastDecrease = Math.abs(c.usd)
                lastDecreaseToken0 = Math.abs(c.token0)
                lastDecreaseToken1 = Math.abs(c.token1)
                lastDecreasePrice0 = Math.abs(c.price0)
                lastDecreasePrice1 = Math.abs(c.price1)
            }
            if(c.usd>0){
                totalIncrease = totalIncrease+Number(c.usd)
                totalIncreaseToken0 = totalIncreaseToken0+Number(c.token0)
                totalIncreaseToken1 = totalIncreaseToken1+Number(c.token1)
            }
            totalInput = totalInput+Number(c.usd)
            totalInputToken0 = totalInputToken0+Number(c.token0)
            totalInputToken1 = totalInputToken1+Number(c.token1)
        })
        await collected.map((c)=>{
            totalCollected = totalCollected+Math.abs(Number(c.usd))
            totalCollectedToken0 = totalCollectedToken0+Math.abs(Number(c.token0))
            totalCollectedToken1 = totalCollectedToken1+Math.abs(Number(c.token1))
        })

        totalCollected = Math.abs(totalCollected) + totalDecrease
        totalCollectedToken0 = Math.abs(totalCollectedToken0) + totalDecreaseToken0
        totalCollectedToken1 = Math.abs(totalCollectedToken1) + totalDecreaseToken1

        this.setState({
            "totalInput":totalInput,
            "totalInputToken0":totalInputToken0,
            "totalInputToken1":totalInputToken1,
            "totalCollected":Math.abs(totalCollected),
            "totalCollectedToken0":Math.abs(totalCollectedToken0),
            "totalCollectedToken1":Math.abs(totalCollectedToken1),
            "totalDecrease":Math.abs(totalDecrease),
            "totalDecreaseToken0":Math.abs(totalDecreaseToken0),
            "totalDecreaseToken1":Math.abs(totalDecreaseToken1),
            "totalIncrease":Math.abs(totalIncrease),
            "totalIncreaseToken0":Math.abs(totalIncreaseToken0),
            "totalIncreaseToken1":Math.abs(totalIncreaseToken1),
            "lastDecrease":lastDecrease,
            "lastDecreaseToken0":lastDecreaseToken0,
            "lastDecreaseToken1":lastDecreaseToken1,
            "lastDecreasePrice0":lastDecreasePrice0,
            "lastDecreasePrice1":lastDecreasePrice1,
            "eventLog":this.eventLog
        })
    }

    getInitCost = async()=>{
        let initEvent = this.eventLog[0]
        if(this.eventLog.length>1){
            for(let e in this.eventLog){
                if(e.timestamp < initEvent.timestamp){
                    initEvent = e
                } 
            }
        }
        this.setState({
            hisPriceUsd0:initEvent.hisPriceUsd0,
            hisPriceUsd1:initEvent.hisPriceUsd1,
            hisPriceEth0:initEvent.hisPriceEth0,
            hisPriceEth1:initEvent.hisPriceEth1,
        })
        // sort eventLog
        this.eventLog.sort((a,b)=>{
            if(a.timestamp > b.timestamp) return 1
            if(a.timestamp < b.timestamp) return -1
        })
    }

    getData = async (tokenId) => {
        await this.getTokenInfo(tokenId)
        //console.log(this.state)
        await this.getInitInfo(tokenId)
        //console.log(this.state)
        await this.getCurCost()
        await this.getHisCost(tokenId,this.nfpm,this.web3,this.UNI_TOKEN0,this.UNI_TOKEN1)
        await this.getInitCost()
        //console.log(this.state)
        this.getDisplayData()
        this.setLoading(false)
    }

    getDisplayData = () =>{
        let usdPreFix = "$ "
        let percentPostFix = " %"

        // set for basic claculation
        this.num ={
            "initAmount0":Number(this.state.initAmount0),
            "initAmount1":Number(this.state.initAmount1),
            "curAmount0":Number(this.state.currentAmount0),
            "curAmount1":Number(this.state.currentAmount1),
        }
        this.num.initAssetAtInitPrice = (this.num.initAmount0*this.state.hisPriceUsd0)+(this.num.initAmount1*this.state.hisPriceUsd1)
        this.num.curAssetAtCurPrice = (this.num.curAmount0*this.state.curPriceUsd0)+(this.num.curAmount1*this.state.curPriceUsd1)
        this.num.initAssetAtCurPrice=(this.num.initAmount0*this.state.curPriceUsd0)+(this.num.initAmount1*this.state.curPriceUsd1)
        this.num.marketGain=this.num.curAssetAtCurPrice-this.state.totalInput
        // set for Asset info display
        this.assetInfo = {
            "token0Str":this.state.token0Str,
            "token1Str":this.state.token1Str,
            "curAsset":this.state.token0Str + " & " + this.state.token1Str,
            "poolValue":usdPreFix+Number(this.num.curAssetAtCurPrice).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "initAssetAtInitPrice":usdPreFix+Number(this.num.initAssetAtInitPrice).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "curAssetAtCurPrice":usdPreFix+Number(this.num.curAssetAtCurPrice).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "initAssetAtCurPrice":usdPreFix+Number(this.num.initAssetAtCurPrice).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "marketGain":usdPreFix+Number(this.num.marketGain).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}), // to do here 
            "initAmount0":Number(this.num.initAmount0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "initAmount1":Number(this.num.initAmount1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "curAmount0":Number(this.num.curAmount0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "curAmount1":Number(this.num.curAmount1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "amountVar0":Number((((this.num.curAmount0-this.num.initAmount0)/this.num.initAmount0)*100)).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+percentPostFix,
            "amountVar1":Number((((this.num.curAmount1-this.num.initAmount1)/this.num.initAmount1)*100)).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+percentPostFix,
            "initPrice0":Number(this.state.hisPriceUsd0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "initPrice1":Number(this.state.hisPriceUsd1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "curPrice0":Number(this.state.curPriceUsd0).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "curPrice1":Number(this.state.curPriceUsd1).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}),
            "priceVar0":Number((((this.state.curPriceUsd0-this.state.hisPriceUsd0)/this.state.hisPriceUsd0)*100)).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+percentPostFix,
            "priceVar1":Number((((this.state.curPriceUsd1-this.state.hisPriceUsd1)/this.state.hisPriceUsd1)*100)).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+percentPostFix,
        }
        // set for event Info display
        this.eventInfo = {}
        // calculate impermanent loss
        if (this.num.curAssetAtCurPrice===0){
            this.lastAsset={
                "tkn0":this.state.totalInputToken0+this.state.lastDecreaseToken0,
                "tkn1":this.state.totalInputToken1+this.state.lastDecreaseToken1,
            }
            this.finalAsset={
                "tkn0":this.state.lastDecreaseToken0,
                "tkn1":this.state.lastDecreaseToken1,
            }
            this.finalPrice={
                "tkn0":this.state.lastDecreasePrice0,
                "tkn1":this.state.lastDecreasePrice1,
            }
        }
        else{
            this.lastAsset={
                "tkn0":this.state.totalInputToken0,
                "tkn1":this.state.totalInputToken1,
            }
            this.finalAsset={
                "tkn0":Number(this.state.currentAmount0),
                "tkn1":Number(this.state.currentAmount1),
            }
            this.finalPrice={
                "tkn0":this.state.curPriceUsd0,
                "tkn1":this.state.curPriceUsd1,
            }
        }
        
        this.assetInfo.IL = calIL(this.lastAsset,this.finalAsset,this.finalPrice)
    }

    changeHandler = async(e)=>{
        await this.setState((prevstate)=>({
            heldintkn:!prevstate.heldintkn,
        }))
    }

    setLoading = (_load) => {
        this.setState({
            loading: _load
        })
    }

    componentDidMount() {
        this.setLoading(true)
        this.getData(this.props.state.tokenId)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.state.tokenId !== prevProps.state.tokenId) {
            this.setLoading(true)
            this.getData(this.props.state.tokenId)
            this.setState({
                heldintkn:false,
            })
        }
    }


    render() {
        if (this.state.loading) {
            return (
                <Loading/>
            )
        }
        let displayIL = (this.num.curAssetAtCurPrice === 0 )? false:true
        let impermanentLost = (this.num.curAssetAtCurPrice - (Number(this.state.totalInputToken0)*this.state.curPriceUsd0+Number(this.state.totalInputToken1)*this.state.curPriceUsd1))
        let ilvalue= (displayIL)? "$ "+Number(impermanentLost).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4}):"-"
        this.investedLiquidityHelp = (this.state.heldintkn)? "invested value calculated in Token":"invested value calculated in USD (price @ adding liquidity moments)"
        this.removedLiquidityHelp = (this.state.heldintkn)? "removed value calculated in Token":"removed value calculated in USD (price @ removing liquidity moments)"
        this.marketGainHelp = (this.state.heldintkn)? "market gain with removed value calculated in Token":"market gain with removed value calculated in USD (price @ removing liquidity moments)"
        let investedLiquidityInTkn = `${this.state.totalIncreaseToken0.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})} ${this.assetInfo.token0Str} \n\n ${this.state.totalIncreaseToken1.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})} ${this.assetInfo.token1Str}`
        this.investedLiquidityValue = (this.state.heldintkn)? investedLiquidityInTkn: "$ "+this.state.totalIncrease.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})
        let removedLiquidityInTkn = Number(this.state.totalDecreaseToken0.toFixed(4)).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})+" "+this.assetInfo.token0Str+"\n\n"+`${this.state.totalDecreaseToken1.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})}${this.assetInfo.token1Str}`
        this.removedLiquidityValue = (this.state.heldintkn)? removedLiquidityInTkn: "$ "+this.state.totalDecrease.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})
        this.marketGainInTkn = "$ "+(this.num.curAssetAtCurPrice-(this.state.totalInputToken0*this.state.curPriceUsd0+this.state.totalInputToken1*this.state.curPriceUsd1)).toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})
        this.marketGain = (this.state.heldintkn)? "\n"+this.marketGainInTkn:this.assetInfo.marketGain
        this.assetInfo.marketGainInTkn = this.marketGainInTkn
        return (
            <div id="data_container">
                <div id="toggle_container">
                    <div id="left_text"></div>
                        <Toggle changed={this.state.heldintkn} changeHandler={this.changeHandler}/>
                    <div id="right_text">Held in Token</div>
                </div>
                <div id="black_card_container">
                    <BlackCard
                        title="Current Asset"
                        value={this.assetInfo.curAsset} 
                        />
                    <BlackCard
                        title="Current Pool Value (USD)"
                        value={this.assetInfo.poolValue} />
                    <BlackCard
                        title="Fee Collected"
                        value={"$ "+this.state.totalCollected.toLocaleString(undefined,{minimumFractionDigits:4,maximumFractionDigits:4})} />
                    <BlackCard
                        title="Invested Liquidity"
                        value={this.investedLiquidityValue} 
                        help={this.investedLiquidityHelp}/>
                    <BlackCard
                        title="Removed Liquidity"
                        value={this.removedLiquidityValue}  //toodo
                        help={this.investedLiquidityHelp}/>
                    {/*<BlackCard
                        title={"Impermanent Loss"}
                        value={ilvalue} 
                    help="the Impermanent Loss you experienced in the investment"/>*/}
                    <BlackCard
                        title="Net Market Gain (w/o fee)"
                        value={this.marketGain}  //toodo
                        help={this.marketGainHelp}/>    
                    {/*<BlackCard
                        title={this.state.token0Str+" / "+this.state.token1Str+" price variation"}
                    value={priceVar0+" / "+priceVar1} />*/}
                </div>
                <AssetInfoCard
                    title = "Asset Info (USD)"
                    content = {this.assetInfo}
                />
                <EventInfoCard title="Gain and Impermanent Loss" state={this.state} assetInfo={this.assetInfo}
                />

            </div>
        )
    }
}