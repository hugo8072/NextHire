# Job Application App📑💼

## Project Overview
This project is currently in development. The goal is to create an application with an API that connects to a database to track job applications.

## Features
- **Express Server** 🖥️: The backend is built using Express.js, a fast and minimalist web framework for Node.js. 
- **REST API** 🌐: The application provides a RESTful API to handle HTTP requests. 
- **MongoDB Integration** 🗄️: The app uses MongoDB as the database to store job application data. 
- **Environment Variables** 🔒: Configuration is managed using environment variables for flexibility and security. 
- **User and Task Routes** 🧑‍💼: The API includes routes for managing users and tasks related to job applications.


## Technologies Used 
- **JavaScript** ⚙️: The primary programming language for the backend. 
- **Node.js** 🖧: The runtime environment for executing JavaScript on the server. - **Express.js** 🖥️: The web framework used to build the API. 
- **MongoDB** 🗃️: The NoSQL database used to store application data. 
- **dotenv** 🌱: A module to load environment variables from a `.env` file. 
- **body-parser** 🍽️: Middleware to parse incoming request bodies in a middleware before your handlers.

## Getting Started
### Prerequisites
- Node.js installed on your machine.💻
- MongoDB instance (local or cloud-based).🌍

### Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/hugo8072/Job_Application_App
    ```
2. Navigate to the project directory:
    ```sh
    cd Job_Application_App
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

### Configuration
Create a `.env` file in the root directory and add the following environment variables:
```dotenv
PORT=8000
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/
JWT_SECRET_KEY=your_secret_key
DB_NAME=job_app_db
```


Running the Application
Start the server:
npm start

The server will run on the port specified in the .env file (default is 8000).  

API Endpoints

GET /: Test route to check if the API is working.

/users: Routes for managing users.

/tasks: Routes for managing tasks related to job applications.


Contributions are welcome! Please fork the repository and create a pull request with your changes. 🔄

License
This project is licensed under the MIT License.



