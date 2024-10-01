# We Are the Champions - Football Championship Tracker

## Overview

This application is designed to help the event organizers of the GovTech annual football championship keep track of results for the first round of matches and determine the current team rankings within each group. The application allows users to enter team information, match results, and displays rankings based on defined criteria.

## Features

- Enter team information with registration dates and group numbers.
- Input match results and calculate rankings based on points, goals scored, and other criteria.
- Retrieve details for specific teams, including matches played and outcomes.
- Edit previously entered data or clear all data.
- Security measures against common web vulnerabilities.
- Logging to track data changes made by users.
- Persistent data storage across system reboots.
- Invalid input handling and typo correction suggestions.
- User authentication mechanism to manage different users and roles.

## Installation

To run this application locally using Docker, follow these steps:

### Prerequisites

- Ensure you have Docker installed on your machine.
- You have the necessary environment files:
  - `.env` file for the frontend (govtech-fe folder)
  - `serviceAccountKey.json` for the backend (govtech-be folder)
- Disclaimer: These files are not on Github as it is being ignored by .gitignore as a good practice. However, I've included the links to both files so that it is able to run locally for examining purposes.

### Setting up Environment Files

1. For the frontend:

   - Download the `.env` file from [FRONTEND_ENV_FILE_LINK](https://nice-banana-725.notion.site/Govtech-OA-112c42c0792b8003b079e638f210f89e?pvs=4)
   - Place the `.env` file in the `govtech-fe` folder

2. For the backend:
   - Download the `serviceAccountKey.json` file from [BACKEND_SERVICE_ACCOUNT_KEY_LINK](https://nice-banana-725.notion.site/Govtech-OA-112c42c0792b8003b079e638f210f89e?pvs=4)
   - Place the `serviceAccountKey.json` file in the `govtech-be` folder

### Running the Application

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Ensure you've placed the `.env` and `serviceAccountKey.json` files in their respective folders as described above.

3. Build and run the application using Docker Compose:

   ```bash
   docker-compose up --build
   ```

   This command will build the Docker images and start the containers for both the frontend and backend applications.

4. Access the application in your web browser:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Stopping the Application

To stop the application, use:

```bash
docker-compose down
```

## Usage

Once the application is running, you can:

- Enter team information in the specified format.
- Input match results to update rankings.
- View current team standings and qualification statuses.
- Edit or clear data as needed.

## Assumptions

- The input formats for team information and match results are followed as specified.
- Only teams belonging in the same group can play matches against one another.
- All required environment variables and configurations for deployment are set correctly.
- The necessary `.env` and `serviceAccountKey.json` files are in place before running the application.

## Logging

Changes made by users will be logged for tracking purposes. GET requests are not recorded.
