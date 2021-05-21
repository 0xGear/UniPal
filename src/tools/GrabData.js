import { Component } from "react";
import { Token, CurrencyAmount, WETH9, currencyEquals } from '@uniswap/sdk-core'
import { encodeSqrtRatioX96 } from '@uniswap/v3-sdk'
import nfpmAbi from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import swapRouterAbi from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json';
import factoryAbi from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json';
import poolAbi from '@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json';
import erc20Abi from 'erc-20-abi'
import { Pool, TickMath, TICK_SPACINGS, FeeAmount, Position } from "@uniswap/v3-sdk";
import Web3 from 'web3';


export default class GrabData extends Component {
    constructor(props) {
        super(props)
        console.log("props", props)
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
        //console.log(this.tokenInfo)
        //set state with init liquidity amount0 amount1
        this.setState({
            tokenId: tokenId,
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

        this.setState({
            currentAmount0:UNI_POSITION.amount0.toFixed(),
            currentAmount1:UNI_POSITION.amount1.toFixed(),
            token0Str:UNI_POSITION.amount0.currency.symbol,
            token1Str:UNI_POSITION.amount1.currency.symbol
        })

        console.log(this.state)
    }

    getMarketInfo = async (tokenId) => {

    }

    getData = async (tokenId) => {
        await this.getTokenInfo(tokenId)
        await this.getMarketInfo(tokenId)
    }

    componentDidMount() {
        this.getData(this.props.state.tokenId)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.state.tokenId !== prevProps.state.tokenId) {
            this.getData(this.props.state.tokenId)
        }
    }


    render() {
        return (<></>)
    }
}