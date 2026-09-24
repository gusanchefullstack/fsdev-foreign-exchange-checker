# Specifications

## Design

The design can be found at Figma Desktop at:

- System Design:
  https://www.figma.com/design/oXwjhmoIUfQyxx7Gy6HS16/foreign-exchange-checker?node-id=100-53
- Designs for Desktop, Tablet and Mobile:
  https://www.figma.com/design/oXwjhmoIUfQyxx7Gy6HS16/foreign-exchange-checker?node-id=54-2

You will find all the required assets in the `/assets` folder. The assets are already optimized.

## Domain Rules and Business Logic

Your users should be able to:

### Converter

- Enter an amount to send and see it convert in real time as they type
- Pick the "send" and "receive" currencies from a searchable currency picker
- See the live exchange rate for the active pair (for example, `1 USD = 0.8530 EUR`)
- Swap the send and receive currencies with the swap button
- Favorite the active pair, and log a conversion to their history

### Currency picker

- Search the full list of available currencies by code or name
- See currencies grouped into "Popular" and "Other currencies", each row showing the flag, code, and name
- See a check against the currency that's currently selected

### Live markets ticker

- See a ticker of currency pairs, each with its current rate and 24-hour change (up or down)

### Rate history

- View a line and area chart of the active pair's rate over time
- Switch the chart range between 1D, 1W, 1M, 3M, 1Y, and 5Y
- See the open, last, absolute change, and percentage change for the selected range

### Compare

- See their send amount converted into a range of other currencies at once, each with its reference rate
- Pin or unpin any comparison row to their favorites

### Favorites

- See their pinned pairs, each with its live rate and 24-hour change
- Load a pinned pair back into the converter by selecting its row
- Unpin a pair they no longer want to track

### Conversion log

- See a log of conversions they've made, each showing the relative time, the pair, and the send and receive amounts
- Clear the whole log
- Delete an individual entry

## UI & accessibility

- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page
- Navigate the entire app using only their keyboard

### Saving favorites and the conversion log

A user's pinned pairs and their conversion log should persist across browser sessions. When they pin a pair or log a conversion, that change should still be there when they close and reopen the app. `localStorage` is a natural fit, since this app doesn't need user accounts. It's also a nice touch to remember the last tab they had open.

### States to handle

- **Empty favorites:** when nothing is pinned yet, show the prompt to pin a pair rather than an empty list
- **Empty log:** when no conversions have been logged, show the prompt explaining that conversions are recorded automatically
- **Empty comparison:** when the send amount is empty, prompt the user to enter an amount
- **Chart error:** if the rate history can't load, show a friendly message rather than a broken chart

### Accessibility

- Make sure keyboard navigation works for all interactive elements, including the currency pickers, the swap button, the tabs, the chart range controls, and the favorite and pin toggles
- Provide visible focus styles. Dark interfaces hide weak focus rings, so these matter more than usual here
- Use appropriate semantic HTML for the tabs, the lists of currencies and conversions, and the currency picker popover
- Announce dynamic changes to screen readers, such as the converted amount updating, a pair being pinned, or a conversion being logged

## Data Source

There's no data file for this challenge. The exchange rates come from a live API, and the user's own data (favorites and conversion log) is saved in the browser.

We recommend the [Frankfurter API](https://frankfurter.dev/) for the rates. It's free, needs no API key, has no rate limits, is CORS-enabled, and is backed by the European Central Bank. A few endpoints cover everything in the design:

- `GET /v2/currencies` to populate the currency picker
- `GET /v2/latest?base=USD` for the converter, ticker, and comparison rates
- `GET /v2/latest?base=USD&symbols=EUR` for a lighter single-pair lookup
- `GET /v2/{start}..{end}?base=USD&symbols=EUR` for the rate-history time series

You're free to use a different exchange-rate API if you prefer. Just note that the history chart needs time-series data, so check your chosen API supports it.

### Other features

- Add a light theme so users can switch between the dark-first design and a light alternative
- Persist the active currency pair in the URL so a conversion can be bookmarked or shared
- Add keyboard shortcuts so power users can focus the search, swap currencies, and switch the chart range without the mouse
- Export the conversion log as a CSV file
- Add a hover crosshair to the rate chart that shows the exact date and rate under the cursor
- Cache the last successful rates and fall back to them with an out-of-date banner when the API is unreachable

## Front-end Architecture and Style Guide

### Front-end Architecture

- Use vite as deploying server for frontend
- The source code should be in src/ folder under the project root. CSS styles and Typescript files should inside corresponding subfolders. Use logical reactjs components created in a /componentes folder
- Use vitest for testing use cases
- Use best practices for frontend development naming convention, semantic html among others.
- Use semantic HTML (header, nav, main, aside, footer, article, section) consistently. It clarifies structure for users and assistive tech and reduces the need for extra ARIA.
- One main per page is a simple, high-impact rule to remember. Wrap the primary page content in a single <main> element (and remove any other main roles/elements). If there are multiple sections that look “main-like,” choose one principal area and mark others with appropriate semantics (section, aside, nav).
- Only one h1 element should exist in html
- Avoid to use Multiple links with identical text, which makes it hard to determine each link's purpose when list of links is read out of surrounding context by assistive technology. This causes screen reader users and anyone scanning links quickly to be unsure which plan each action applies to, increasing cognitive load and risking mistaken clicks. Consider using best practices of WCAG.

### Front-end Style Guide

1. Layout

Use the index.html file where to contain app. Keep this file at the project root, which is
where Vite expects the entry HTML. It references the application entry point in `/src`, so
all application source still lives under `src/` as described above.

The designs were created to the following widths:

- Mobile: 375px
- Desktop: 1440px
  > These are just the design sizes. Ensure content is responsive and meets WCAG requirements by testing the full range of screen sizes from 320px to large screens.

## Testing

- Use vitest as testing framework
- Test implementation with browser screen at 375px (mobile), 768px (tablet) and 1440px (desktop) screens.
- Test key and edge cases that can apply
- Use test to validate functionality/features after important changes.

## Documentation

- Add comments in plain style for key elements of code.
- Create a README.md following README-template.md but also considering skill /create-readme once the project is finished
- Update the Author section in README with the following contact info. Add badges to each related link address. Arrange them in inline row.
  https://www.linkedin.com/in/gustavosanchezgalarza/
  https://github.com/gusanchefullstack
  https://hashnode.com/@gusanchedev
  https://x.com/gusanchedev
  https://bsky.app/profile/gusanchedev.bsky.social
  https://www.freecodecamp.org/gusanchedev
  https://www.frontendmentor.io/profile/gusanchefullstack

- Once finished implementation, take screenshots for 375px strictly and 1440px strictly viewport (responsive view) and add them first to the /screenshots folder in root and them insert from here to the readme in the screenshots section.
- Screenshots to include in README.md for 375px should be 40% width of 1440px shots.

## Deployment

- Once I confirm the project is done and the github repos were created, deploy the frontend project to vercel under my account (gustavosanchezgalarza@gmail.com). If the project has backend component, use www.render.com to deploy the backend.

## Post Implementation Tasks

Execute the following tasks:

1. Submit project to frontendmentor.io. Use @frontendmentor-submitter to submit the project. Follow the ["Complete guide to submitting solutions"](https://www.frontendmentor.io/guides/how-to-submit-solutions) for tips on how to do this.

The url of the project is:
https://www.frontendmentor.io/challenges/foreign-exchange-currency-converter?tab=submit.
Take care of the snapshot that FrontendMentor.io captures. It must be similar to the design snapshot.

2. Get Solution URL (in frontendmentor.io) and live site URL (in vercel) and once you have them update the git hub repo README.md. Also be sure to update the live site url in the repo page.

3. Update my landing page. Ask for confirmation first. If yes, Use @landing-page-portfolio-updater to update my portafolio with this project.

4. Fixing issues of FrontendMentor.io.
   Use @frontend-mentor-issue-fixer to fix issues detected by frontendmentor.io for improving score of app submitted. Ask for confirmation to execute this step.
