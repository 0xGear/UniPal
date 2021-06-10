# UniPal

This project was created to help Uniswap-V3 liquidity analysis.


## Math for Liquidity Analysis
We get historical asset price info from CoinGeko, which might be slightly different from the valule used in Uniswap in the short term.
### Basic Asset Info
* held in token vs held in USD : <br/> Held in token will calculate the asset variation in token basis, then evaluate with the current price in USD. Held in USD will calculate the asset variation with the asset price in USD at the operation moment.
### Impermanent Loss
* Impermanent Loss = current asset @ current price (in USD) - invested asset @ current price (in USD)
* If the Liquidity was fully extracted, will use final asset @ final price instead of current asset @ current price


## To Run This App Locally

this app was created with react. 
To make sure Node.js and npm are correctly installed try:  
`node -v` and `npm -v` to check your version.

to run the app locally,
##### `git clone [this project]`
In the project directory, you can run:
##### `npm install`
##### `npm start`

and you'll see the app running in your browser.
