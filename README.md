# RetailCode Orange Liberia — API Regression

Newman regression suite for the `RETAILCODE_ORANGE_LIBERIA` Postman collection, with an automated weekly run via GitHub Actions.

## Run locally

```bash
npm install
export TOKEN="<bearer token for the Dev environment>"
npm run regression
```

The report is written to `reports/regression-report.html`.

## CI

[`.github/workflows/api-regression.yml`](.github/workflows/api-regression.yml) runs the regression every **Wednesday at 10:00 Liberia time (UTC)**, commits the refreshed report, and emails it to the distribution list. Trigger it manually from the Actions tab via "Run workflow" if needed.

### Required repository secrets

| Secret | Purpose |
| --- | --- |
| `RETAILCODE_TOKEN` | Bearer token for the `Retailcode Orange Liberia Dev Copy` environment (the committed environment file ships with this blank). |
| `SMTP_USERNAME` | Gmail address used to send the report. |
| `SMTP_PASSWORD` | Gmail App Password for that account. |

## Known issues (as of the last regression)

- **Activate Agent / Deactivate Agent** — test scripts both declare `const data` at the top level, which collides in Postman's shared sandbox scope (`Identifier 'data' has already been declared`). Scope `data` inside the test callback instead.
- **Activate Super Agent** — request URL `/super-agents/activate{{superagent_id}}` is missing a `/` before the ID, causing a 404. Compare with the working `/super-agents/deactivate/{{superagent_id}}`.
- **Deactivate Super Agent** — returns 405 Method Not Allowed; needs backend verification.
- **Del Super Agent** — returns 500 Internal Server Error (PHP class-not-found in the response body); backend bug.
