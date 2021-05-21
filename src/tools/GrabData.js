import { Component } from "react";
import BlackCard from '../components/BlackCard.js'
import Loading from '../components/Loading.js'
import AssetInfoCard from "../components/AssetInfoCard.js"
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
        console.log("props", props)
        this.state = {
            loading: false,
        }
        this.setLoading = this.setLoading.bind(this)
        this.web3 = new Web3('https://eth-mainnet.alchemyapi.io/v2/5atvVrendBmTbMs--ytb0vC52Rp6r97n');
        let uniNonFungiblePositionManagerAddr = "0xc36442b4a4522e871399cd717abdd847ab11fe88";
        this.nfpm = new this.web3.eth.Contract(nfpmAbi.abi, uniNonFungiblePositionManagerAddr);
        let uniFactoryAddr = "0x1f98431c8ad98523631ae4a59f267346ea31f984";
        this.uniFactory = new this.web3.eth.Contract(factoryAbi.abi, uniFactoryAddr);
    }

    getTokenInfo = async (tokenId) => {
        console.log("24", tokenId)
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
        console.log(this.increaseEvents)
        //set state with init liquidity amount0 amount1
        let block = await this.web3.eth.getBlock(this.increaseEvents[0].blockNumber)
        this.setState({
            tokenId: tokenId,
            timeStamp: block.timestamp,
            initLiquidity: this.increaseEvents[0].returnValues.liquidity,
            initAmount0: this.increaseEvents[0].returnValues.amount0,
            initAmount1: this.increaseEvents[0].returnValues.amount1,
            liquidity: this.tokenInfo.liquidity,
            token0: this.tokenInfo.token0,
            token1: this.tokenInfo.token1,
            tickLower: this.tokenInfo.tickLower,
            tickUpper: this.tokenInfo.tickUpper,
            fee: this.tokenInfo.fee
        })
        console.log(this.state)

        let poolAddr = await this.uniFactory.methods.getPool(this.state.token0, this.state.token1, this.state.fee).call();
        let pool = new this.web3.eth.Contract(poolAbi.abi, poolAddr);
        let poolSlot0 = await pool.methods.slot0().call();
        let poolLiquidity = await pool.methods.liquidity().call();
        let token0 = new this.web3.eth.Contract(erc20Abi, this.state.token0);
        let token1 = new this.web3.eth.Contract(erc20Abi, this.state.token1);
        const UNI_TOKEN0 = new Token(1, this.state.token0, parseInt(await token0.methods.decimals().call()), await token0.methods.symbol().call(), await token0.methods.name().call());
        const UNI_TOKEN1 = new Token(1, this.state.token1, parseInt(await token1.methods.decimals().call()), await token1.methods.symbol().call(), await token1.methods.name().call());
        const UNI_POOL = new Pool(
            UNI_TOKEN0, UNI_TOKEN1, parseInt(this.state.fee),
            TickMath.getSqrtRatioAtTick(parseInt(poolSlot0.tick)),
            poolLiquidity,
            parseInt(poolSlot0.tick),
            []
        );
        console.log(this.state)
        console.log(parseInt(this.state.tickLower))
        console.log(parseInt(this.state.tickUpper))

        const UNI_POSITION = new Position({
            pool: UNI_POOL,
            liquidity: parseInt(this.state.liquidity),
            tickLower: parseInt(this.state.tickLower),
            tickUpper: parseInt(this.state.tickUpper)
        });
        console.log(CurrencyAmount.fromRawAmount(UNI_TOKEN0, this.state.initAmount0).toFixed())
        console.log(CurrencyAmount.fromRawAmount(UNI_TOKEN1, this.state.initAmount1).toFixed())
        this.setState({
            initAmount0: CurrencyAmount.fromRawAmount(UNI_TOKEN0, this.state.initAmount0).toFixed(),
            initAmount1: CurrencyAmount.fromRawAmount(UNI_TOKEN1, this.state.initAmount1).toFixed(),
            currentAmount0: UNI_POSITION.amount0.toFixed(),
            currentAmount1: UNI_POSITION.amount1.toFixed(),
            token0Str: UNI_POSITION.amount0.currency.symbol,
            token1Str: UNI_POSITION.amount1.currency.symbol
        })

        console.log(this.state)
    }

    getMarketInfo = async (tokenId) => {
        let date = new Date(this.state.timeStamp * 1000).getDate()
        let month = new Date(this.state.timeStamp * 1000).getMonth() + 1
        let year = new Date(this.state.timeStamp * 1000).getFullYear()
        console.log(date, year, month)
        const fetchCoin0 = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${this.state.token0}`)
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    id0: data['id'],
                    curPriceUsd0: data['market_data']['current_price']['usd'],
                    curPriceEth0: data['market_data']['current_price']['eth']
                })
            })
            .then(async (coinInfo0) => {
                await fetch(`https://api.coingecko.com/api/v3/coins/${this.state.id0}/history?date=${date}-${month}-${year}`)
                    .then((response) => response.json())
                    .then((data) => {
                        this.setState({
                            hisPriceUsd0: data['market_data']['current_price']['usd'],
                            hisPriceEth0: data['market_data']['current_price']['eth']
                        })
                    })
            })
            .catch((error) => { console.log(error) })

        const fetchCoin1 = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${this.state.token1}`)
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    id1: data['id'],
                    curPriceUsd1: data['market_data']['current_price']['usd'],
                    curPriceEth1: data['market_data']['current_price']['eth']
                })
            })
            .then(async (coinInfo1) => {
                await fetch(`https://api.coingecko.com/api/v3/coins/${this.state.id1}/history?date=${date}-${month}-${year}`)
                    .then((response) => response.json())
                    .then((data) => {
                        this.setState({
                            hisPriceUsd1: data['market_data']['current_price']['usd'],
                            hisPriceEth1: data['market_data']['current_price']['eth']
                        })
                    })
            })
            .catch((error) => { console.log(error) })
        console.log(this.state)
    }

    getData = async (tokenId) => {
        await this.getTokenInfo(tokenId)
        await this.getMarketInfo(tokenId)
        this.setLoading()
    }

    setLoading = () => {
        this.setState((prevstate) => ({
            loading: !prevstate.loading
        }))
    }

    componentDidMount() {
        this.setLoading()
        this.getData(this.props.state.tokenId)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.state.tokenId !== prevProps.state.tokenId) {
            this.setLoading()
            this.getData(this.props.state.tokenId)
        }
    }


    render() {
        if (this.state.loading) {
            return (
                <Loading/>
            )
        }
        let currentAsset = this.state.token0Str + " : " + parseFloat(this.state.currentAmount0).toFixed(4) + "\n" + this.state.token1Str + " : " + parseFloat(this.state.currentAmount1).toFixed(4)
        let poolValue = "$" +((parseFloat(this.state.currentAmount0)*this.state.curPriceUsd0)+(parseFloat(this.state.currentAmount1)*this.state.curPriceUsd1)).toFixed(4)
        let initAssetAtInitPrice = ((parseFloat(this.state.initAmount0)*this.state.hisPriceUsd0)+(parseFloat(this.state.initAmount1)*this.state.hisPriceUsd1)).toFixed(4)
        let initAssetAtCurPrice = ((parseFloat(this.state.initAmount0)*this.state.curPriceUsd0)+(parseFloat(this.state.initAmount1)*this.state.curPriceUsd1)).toFixed(4)
        let curAssetAtCurPrice = ((parseFloat(this.state.currentAmount0)*this.state.curPriceUsd0)+(parseFloat(this.state.currentAmount1)*this.state.curPriceUsd1)).toFixed(4)
        let netgain = ((curAssetAtCurPrice-initAssetAtInitPrice)/initAssetAtInitPrice).toFixed(4)+"%"
        let initCurrentAmount0 = parseFloat(this.state.initAmount0).toFixed(4)+"/"+ parseFloat(this.state.currentAmount0).toFixed(4)
        let initCurrentAmount1 = parseFloat(this.state.initAmount1).toFixed(4)+"/"+ parseFloat(this.state.currentAmount1).toFixed(4)
        let initCurrentPrice0 = parseFloat(this.state.hisPriceUsd0).toFixed(4)+"/"+ parseFloat(this.state.curPriceUsd0).toFixed(4)
        let initCurrentPrice1 = parseFloat(this.state.hisPriceUsd1).toFixed(4)+"/"+ parseFloat(this.state.curPriceUsd1).toFixed(4)
        let priceVar0 = parseFloat(this.state.curPriceUsd0)-parseFloat(this.state.hisPriceUsd0)
        let priceVar1 = parseFloat(this.state.curPriceUsd1)-parseFloat(this.state.hisPriceUsd1)
        return (

            <div id="data_container">
                <div id="balck_card_container">
                    <BlackCard
                        title="Current Asset"
                        value={currentAsset} />
                    <BlackCard
                        title="Pool Value (USD)"
                        value={poolValue} />
                    <BlackCard
                        title="Net Market Gain (w/o fee)"
                        value={netgain} />
                </div>
                <AssetInfoCard
                    title = "LP Gain / Asset Info (USD)"
                    r0c0="initial asset at initial price"
                    r0c1={initAssetAtInitPrice}
                    r1c0="initial assets at current price"
                    r1c1={initAssetAtCurPrice}
                    r2c0="current asset at current price"
                    r2c1={curAssetAtCurPrice}
                    r3c0="Gain from market price"
                    r3c1={netgain}
                    r0c0_2="token"
                    r0c1_2="initial / current amount"
                    r0c2_2="initial / current price"
                    r0c3_2="price variation"
                    r1c0_2={this.state.token0Str}
                    r1c1_2={initCurrentAmount0}
                    r1c2_2={initCurrentPrice0}
                    r1c3_2={priceVar0}
                    r2c0_2={this.state.token1Str}
                    r2c1_2={initCurrentAmount1}
                    r2c2_2={initCurrentPrice1}
                    r2c3_2={priceVar1}

                />
            </div>
        )
    }
}