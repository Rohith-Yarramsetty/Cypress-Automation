<div align="center">
  <h1>DUROLABS UI TESTS</h1>
  <br/>
  <br/>
</div>


### Run Tests
Use the following command to run tests with cypress test runner:
```sh
npx cypress open --config baseUrl="https://staging-gcp.durolabs.xyz" --env MAILOSAUR_API_KEY=B3B58jEQj8C7WtqP,serverId=mclsdmsb,QA_ACCESS_KEY=2a08yrFAH4ng08JJynikN0hLpOuMdehCO
```

To run against different urls, change the baseUrl

To run in headless mode, change "open" in the above command to "run"

If you want to execute the specific tests you can add the --spec flag as follows:
```sh
--spec .\cypress\integration\tests\component/component.spec.js
```

If you want to execute the tests on specific browser you can do it with the following line:
```sh
--browser firefox
```

Please view the <a href="https://docs.google.com/spreadsheets/d/17ISwWsoFC6_gCH0xVuRSj7f08gekBYnosYLvPQpRqMQ/edit?usp=sharing" target="_blank">documentation</a> for more details.
