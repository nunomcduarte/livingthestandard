# Bitcoin vs Euro Savings Simulator

An interactive financial simulator that compares how your savings would have evolved if you had lived on Bitcoin instead of euros.

## 🎯 Features

- **Real Historical Data**: Uses actual Bitcoin price data from 2015-2025 (CSV-based)
- **Three Simulation Scenarios**:
  - Euro-only savings (traditional approach)
  - Bitcoin conversion without selling (pure accumulation)
  - Bitcoin savings with expenses paid in BTC (realistic living scenario)
- **Financial Modeling**: 
  - Annual inflation on expenses
  - Salary growth over time
  - Customizable expense schedules (monthly/weekly)
- **Interactive Charts**: Visualize your savings evolution over time
- **Comprehensive Testing**: 46 unit tests ensuring calculation accuracy

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/LivingStandard.git
cd LivingStandard

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the simulator in your browser.

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.6
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Charts**: Recharts
- **UI Components**: Radix UI + shadcn/ui
- **Testing**: Vitest
- **Data Parsing**: PapaParse (CSV handling)

## 📊 How It Works

1. **Input Your Data**: Enter your salary, expenses, and time period
2. **Real Bitcoin Prices**: The simulator uses historical Bitcoin-to-Euro exchange rates
3. **Three Scenarios**: See how each approach would have performed:
   - **Euro Savings**: Traditional savings in euros
   - **Bitcoin Savings**: Convert excess cash to Bitcoin, sell when needed for expenses
4. **Compare Results**: View detailed breakdowns and interactive charts

## 📁 Project Structure

```
LivingStandard/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Core logic and utilities
│   │   ├── calculator.ts    # Simulation engine
│   │   ├── bitcoin-data.ts  # Bitcoin price loader
│   │   └── calculator.test.ts # Comprehensive tests
│   └── ui/                  # UI components (shadcn)
├── public/
│   └── btc_euro_price.csv   # Historical Bitcoin price data
└── package.json
```

## 🎨 Key Components

- **SimulatorForm**: Main input form with salary and expense configuration
- **SimulatorResults**: Results display with detailed metrics
- **ComparisonChart**: Interactive line chart comparing scenarios
- **EducationalSection**: Information about Bitcoin and inflation

## 📈 Data Sources

- Bitcoin historical prices: Daily EUR/BTC exchange rates (2015-2025)
- Inflation modeling: User-configurable annual rate
- Salary growth: User-configurable annual rate

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Bitcoin price data compiled from public sources
- Built with [v0.dev](https://v0.dev) for rapid UI development
- UI components from [shadcn/ui](https://ui.shadcn.com)

## ⚠️ Disclaimer

This is an educational tool. Past performance does not guarantee future results. This simulator is not financial advice. Always do your own research and consult with financial professionals before making investment decisions.

