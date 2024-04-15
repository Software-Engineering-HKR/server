# Smart House Backend

This repository contains the backend code for controlling and managing a smart house system.

## Setup

1. **Clone the Repository**: Begin by cloning the repository containing the backend code.
2. **Install Dependencies**: Navigate to the project directory and install the required dependencies using npm.
```
npm install
```
3. **Environment Variables**: Ensure that you have set up the necessary environment variables, including the `secret_key` for JWT token verification.

## Usage

The backend provides several endpoints for managing and controlling smart house devices.

1. *Login Endpoint*
- *Endpoint:* `/login`
- *Method:* POST
- *Description:* Used for user authentication. Send a POST request with the username and password in the request body to receive a JWT token.
- *Example:*
    json
    {
        "username": "example_user",
        "password": "example_password"
    }
  

2. *Register Endpoint*
- *Endpoint:* `/register`
- *Method:* POST
- *Description:* Used for user registration. Send a POST request with the desired username and password in the request body to register a new user.
- *Example:*
    json
    {
        "username": "new_user",
        "password": "new_password"
    }


3. *LCD Endpoint*
- *Endpoint:* `/LCD`
- *Method:* POST
- *Description:* Update and display messages on an LCD screen. Requires authentication via JWT token.
- *Authorization:* Include a valid JWT token in the Authorization header.
- *Body:*
    json
    {
        "message": "Hello, world!"
    }


4. *Device Endpoint*
- *Endpoint:* `/:device`
- `device`: The name or identifier of the device to control.
- *Method:* POST
- *Description:* Control various smart house devices. Requires authentication via JWT token.
- *Authorization:* Include a valid JWT token in the Authorization header.
- *Parameters:*
- *Body:*
    json
    {
        "command": "on"
    }

## Authentication
- Authentication is handled using JSON Web Tokens (JWT). Users must authenticate by providing a valid JWT token in the Authorization header for protected endpoints.

## Notes
- Ensure that the backend server is running and accessible from your application.
- Make requests to the appropriate endpoints with the required authentication and parameters.
- Refer to the provided controller and middleware files for further implementation details and customization options.
- If you have further questions checkout the index.html to see how to implement into the frontend