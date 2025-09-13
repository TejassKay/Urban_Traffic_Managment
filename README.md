# Urban_Traffic_Managment
SIH hackathon project
A real-time, AI-powered traffic simulation that optimizes traffic flow using a reinforcement learning model and a hardware-integrated frontend. This project was developed as a submission for [SMART INDIA HACKATHON].

Project Overview -
The goal of this project is to solve a common urban problem: traffic congestion at intersections. We have developed an intelligent system that moves beyond simple fixed-time traffic lights. Our system dynamically adjusts signal timings based on real-time data to minimize wait times and improve traffic flow.

IT IS BROKEN INTO THREE DIFFERENT COMPONENTS -

1) FRONTEND :
   The frontend of this project is a real-time traffic simulation dashboard built with vanilla JavaScript, HTML, and CSS. It provides a visual representation of a traffic intersection and an interactive control panel to monitor and manage traffic flow.

   Key Features-
Dynamic Traffic Simulation: A <canvas> element renders a two-lane road intersection with cars moving in four directions (North, South, East, West). Cars are dynamically spawned and their movement is updated in a game loop.

Traffic Light Control: The application visually displays the North/South and East/West traffic lights. The lights change color (red, yellow, green) based on an automated cycle and real-time traffic demand.

Interactive Dashboard: A dashboard provides key information about the simulation:

Current Phase: Shows which direction has the green light.

Time Remaining: Displays the time left in the current traffic light phase.

Traffic Demand: Counts the number of cars waiting in the North/South and East/West lanes.

Traffic Density: A qualitative measure (Low, Medium, High) of traffic for each direction.

AI Integration: The frontend is designed to interact with a backend AI model. Clicking the "Get AI Prediction" button sends the current traffic data to the server, which can then return an optimal green light time to improve traffic flow.

Responsive Design: The layout is responsive, ensuring the dashboard and simulation are readable and usable on various screen sizes.

Technologies Used
HTML5: Structures the webpage, including the dashboard and canvas elements.

CSS3: Styles the user interface, including the traffic lights and dashboard panels, and provides responsive layouts.

JavaScript: Manages the entire simulation logic, from car movement and light changes to data fetching from the backend.

3) BACKEND :
   The AI Model is made using libraries such as pandas (for handling data), sklearn(for machine learning), random(to use fake data) and flask (for making the model a web service).
   

   Guardrails: This is a key safety feature. The AI guesses are educated guesses so they can be wrong. Guardrails are common-sense rules which overrides the AI, for example- if a ambulance is going through     it    keeps the green-light on.

   flask() is used to connect to frontend, it sets up a web service so that request.json can grab the data and JSON can send back the predictions to the frontend.

3)OPEN CV MODEL :
  
   


CONTRIBUTIONS :
1. TEJAS KAUSHIK (TEAM LEADER, open CV engineer)
2. VARTIKA SHARMA (Backend Integration, fixing bugs)
3. ISHA SRIVASTAV (AI engineer)
4. SUDHARSHAN GUPTA (Frontend)
5. ROOPAKSHI SINGH (Frontend)
6. AKANKSHA DHYANI (ppt maker)
   
















