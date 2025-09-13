# Urban_Traffic_Managment
SIH hackathon project
A real-time, AI-powered traffic simulation that optimizes traffic flow using a reinforcement learning model and a hardware-integrated frontend. This project was developed as a submission for [SMART INDIA HACKATHON].

Project Overview -
The goal of this project is to solve a common urban problem: traffic congestion at intersections. We have developed an intelligent system that moves beyond simple fixed-time traffic lights. Our system dynamically adjusts signal timings based on real-time data to minimize wait times and improve traffic flow.

IT IS BROKEN INTO THREE DIFFERENT COMPONENTS -

1) ***FRONTEND*** :
   The frontend of this project is a real-time traffic simulation dashboard built with vanilla JavaScript, HTML, and CSS. It provides a visual representation of a traffic intersection and an interactive control panel to monitor and manage traffic flow.

   ***Key Features***-
 I) **Dynamic Traffic Simulation**: A <canvas> element renders a two-lane road intersection with cars moving in four directions (North, South, East, West). Cars are dynamically spawned and their movement is updated in a game loop.

II) **Traffic Light Control**: The application visually displays the North/South and East/West traffic lights. The lights change color (red, yellow, green) based on an automated cycle and real-time traffic demand.

III) **Interactive Dashboard**: A dashboard provides key information about the simulation:

IV) **Current Phase**: Shows which direction has the green light.

V) **Time Remaining**: Displays the time left in the current traffic light phase.

VI) **Traffic Demand**: Counts the number of cars waiting in the North/South and East/West lanes.

VII) **Traffic Density**: A qualitative measure (Low, Medium, High) of traffic for each direction.

VIII) **AI Integration**: The frontend is designed to interact with a backend AI model. Clicking the "Get AI Prediction" button sends the current traffic data to the server, which can then return an optimal green light time to improve traffic flow.

IX) **Responsive Design**: The layout is responsive, ensuring the dashboard and simulation are readable and usable on various screen sizes.

***Languages Used***-

**HTML5**: Structures the webpage, including the dashboard and canvas elements.
**CSS3**: Styles the user interface, including the traffic lights and dashboard panels, and provides responsive layouts.
**JavaScript**: Manages the entire simulation logic, from car movement and light changes to data fetching from the backend.

2) ***BACKEND*** :
The backend of this project is a Flask application that provides a REST API for the frontend. Its primary purpose is to process traffic data and predict the optimal green light duration using a hybrid artificial intelligence model.

 ***Key Features***-
I)**AI Traffic Control**: The core of the backend is an intelligent system that combines two machine learning approaches to determine the best signal timing:

II)**Linear Regression Baseline**: A regression model provides an initial prediction for the green light time based on traffic variables.

III)**Q-Learning Agent (Reinforcement Learning)**: An AI agent, using Q-learning, learns from the simulation's results and adjusts the regression model's prediction to improve traffic flow over time.

IV)**Hybrid Prediction Model**: A hybrid approach is used to ensure safe and efficient traffic management. The system:
If traffic demand is low: It defaults to a fixed, safe green light time.
If traffic demand is high: It uses the combined power of the regression model and the Q-learning agent to make a dynamic and intelligent prediction.

V)**REST API**: The application exposes a single API endpoint:
POST /predict_time: This endpoint accepts a JSON payload containing traffic data (e.g., number of vehicles) and returns a JSON response with the calculated green_time.

VI)**Training Simulation**: The backend includes a simple simulation loop to train the Q-learning agent. This allows the model to learn and improve its decision-making in a controlled environment.

***Technologies Used***-
**Flask**: A Python micro-framework used to build the web server and handle API requests.
**Flask-CORS**: An extension to handle Cross-Origin Resource Sharing, allowing the frontend to communicate with the backend.
**NumPy**: Used for numerical operations, particularly for the Q-learning agent's state-action tabl

3)***OPEN CV MODEL***:
This component is an OpenCV application responsible for analyzing a video stream to gather real-time traffic data. Its primary purpose is to detect, track, and count vehicles, providing the raw data needed by the backend for traffic flow analysis and signal time prediction.

***Key Features***-
**Vehicle Detection**: The system uses a pre-trained Haar Cascade classifier, a machine learning-based approach, to reliably detect the presence and location of vehicles in each frame of the video.

**Multi-Object Tracking**: To efficiently follow multiple vehicles without running the expensive detection on every frame, a detect-then-track methodology is used. Once an object is detected, a lightweight and fast KCF (Kernelized Correlation Filters) Tracker is assigned to follow it across subsequent frames.

**Directional Counting**: The application establishes a virtual line across the frame to determine the direction of traffic. It counts vehicles as they cross this line, categorizing them into "IN" and "OUT" totals. This count serves as the primary input for the backend's prediction model.

**Real-time Visualization**: The script provides a live visual feedback window showing the video feed with bounding boxes drawn around tracked vehicles and an overlay displaying the current IN/OUT counts and FPS.

***Technologies Used***

**OpenCV-Python**: The core computer vision library used for all image and video processing tasks, including reading the video file, detecting objects, and drawing visualizations.
**Haar Cascades**: An effective object detection method included in OpenCV. The project uses a pre-trained XML file (car4-1.xml) specifically designed to recognize car features.
**OpenCV Trackers**: The application leverages built-in tracking algorithms from OpenCV's legacy module. The KCF tracker is chosen for its strong balance of speed and accuracy in real-time applications.


CONTRIBUTIONS :
1. TEJAS KAUSHIK (TEAM LEADER, open CV engineer)
2. VARTIKA SHARMA (Backend Integration, fixing bugs)
3. ISHA SRIVASTAV (AI engineer)
4. SUDHARSHAN GUPTA (Frontend)
5. ROOPAKSHI SINGH (Frontend)
6. AKANKSHA DHYANI (ppt maker)
   
















