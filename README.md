# Claims Service Frontend

This repository contains the frontend application for the Claims Service. It is a web application built with HTML, CSS, and JavaScript, likely using Bootstrap for styling.

## 1. Local Development Setup

### 1.1 Prerequisites

*   Node.js (LTS version recommended)
*   npm or Yarn (Node Package Manager)

### 1.2 Environment Variables

The frontend application communicates with the backend. Ensure the `API_BASE_URL` in `assets/js/api-config.js` is correctly configured to point to your backend server (e.g., `http://localhost:8181`).

**Note:** For local development, you might need to change `https://be-claims-service.onrender.com` to `http://localhost:8181` in `assets/js/api-config.js` if your backend is running locally.

### 1.3 Installation

Navigate to the `web-claims-services` directory and install the dependencies:

```bash
cd web-claims-services
npm install # or yarn install
```

## 2. Running the Application

To start the frontend development server:

```bash
npm run serve # or yarn serve
```

The application will typically be accessible at `http://localhost:3000` (or another port specified by the development server).

## 3. Running Tests

This project likely uses a JavaScript testing framework like Jest.

To run tests (if available, check `package.json` for scripts):

```bash
npm test # or yarn test
```

## 4. Technologies Used

*   **HTML, CSS, JavaScript**: Core web technologies.
*   **Bootstrap**: Frontend component library for styling.
*   **jQuery**: JavaScript library for DOM manipulation.
*   **Gulp.js**: Toolkit for automating painful or time-consuming tasks in development.
*   **Webpack**: Module bundler.
*   **Jest**: JavaScript testing framework.
*   **ESLint**: Pluggable linting utility for JavaScript.
*   **Prettier**: An opinionated code formatter.

## 5. Deployment

Refer to `ตั้งค่าlocalและdeploy.md` for deployment instructions.