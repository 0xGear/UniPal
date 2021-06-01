import { Component } from "react"
import "./Footer.scss"
import githubImg from "./img/github.svg"

export default class Footer extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div id="footer-container">
                <div id="text">created by 0xGear</div>
                <a href="https://github.com/0xGear/UniPal"><img src={githubImg} alt="github" /> </a>
            </div>
        )
    }

}