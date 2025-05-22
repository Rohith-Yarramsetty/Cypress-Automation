# Cypress Automation Framework

This project contains automated test scripts using Cypress for testing the OrangeHRM demo application.

## 🚀 Technologies Used

- [Cypress](https://www.cypress.io/) - Modern web testing framework
- [cypress-xpath](https://www.npmjs.com/package/cypress-xpath) - XPath support for Cypress

## 📋 Prerequisites

- Node.js (Latest LTS version recommended)
- npm (comes with Node.js)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd Cypress-Automation
```

2. Install dependencies:
```bash
npm install
```

## 🏃‍♂️ Running Tests

To run the tests, use the following command:
```bash
npx cypress open
```

This will open the Cypress Test Runner where you can:
- Run tests in interactive mode
- View test execution in real-time
- Debug tests using the built-in developer tools

## 📁 Project Structure

```
cypress/
├── e2e/           # Test files
├── fixtures/      # Test data
├── support/       # Support files and custom commands
└── downloads/     # Downloaded files during test execution
```

## ⚙️ Configuration

The project uses `cypress.config.js` for configuration with the following settings:
- Base URL: https://opensource-demo.orangehrmlive.com
- Screenshot capture on test failure
- Custom spec pattern for test files

## 🧪 Writing Tests

Test files are located in the `cypress/e2e` directory and follow the naming pattern `*.sampath.js`.

## 📸 Screenshots

Screenshots are automatically captured on test failures and stored in the `cypress/screenshots` directory.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.