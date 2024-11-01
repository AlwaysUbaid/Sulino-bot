# Sulino Bot

[Repository Link](https://github.com/AlwaysUbaid/Sulino-bot)

Sulino Bot is a Telegram Mini App integrated with Solana's blockchain, designed to enhance the trading and staking experience directly within Telegram. This personal project combines the convenience of a messaging app with the power of blockchain-based trading and staking through the following features:

## Features

- **Trading Functionality**: 
  - Powered by the Jupiter aggregator, enabling instant swaps for various Solana tokens, including popular memecoins.
  - Provides real-time price updates and animated token charts for enhanced trading insights.

- **Staking Mechanism**:
  - Users can lock tokens for 30, 90, or 180 days, earning competitive APY rewards.
  - Designed with flexibility, offering staking options to suit different user preferences.

- **Lottery System**:
  - Rewards active traders with tickets based on trading volume.
  - Weekly drawings give users a chance to win additional rewards, incentivizing consistent trading.

- **Intuitive User Interface**:
  - The bot's frontend supports Telegram’s native theming, with smooth animations and a responsive design.
  - Users can trade, stake, and participate in lotteries seamlessly within the Telegram app.

## Backend Architecture

- **Technology Stack**:
  - **Express.js** for API handling and routing.
  - **MongoDB** to store user data and transaction history.
  - **Solana Web3.js** for blockchain interactions and handling transactions on Solana’s network.

- **Security Features**:
  - Secure wallet connection handling and transaction confirmation dialogs.
  - Error management for a reliable and user-friendly experience.

- **Modular Design**:
  - Separate services manage wallet connections, trading, staking, and lottery functionalities, making the bot easily extensible for future updates.

## Configuration and Setup

This project requires API tokens and keys to connect to Telegram, Solana, and MongoDB services. To keep these keys private, follow these steps:

1. **Create a `.env` file** in the project’s root directory.
2. Add your credentials in the following format:
   ```plaintext
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   SOLANA_API_KEY=your_solana_api_key
   MONGO_URI=your_mongo_database_uri
   ```
3. Ensure that `.env` is listed in your `.gitignore` file to prevent your credentials from being exposed publicly.

## License

This project is licensed under the MIT License.
