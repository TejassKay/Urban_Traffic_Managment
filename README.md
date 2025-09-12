# Urban_Traffic_Managment
SIH hackathon project
A real-time, AI-powered traffic simulation that optimizes traffic flow using a reinforcement learning model and a hardware-integrated frontend. This project was developed as a submission for [SMART INDIA HACKATHON].

Project Overview -
The goal of this project is to solve a common urban problem: traffic congestion at intersections. We have developed an intelligent system that moves beyond simple fixed-time traffic lights. Our system dynamically adjusts signal timings based on real-time data to minimize wait times and improve traffic flow.

IT IS BROKEN INTO THREE DIFFERENT COMPONENTS -

1) FRONTEND :
   We are using HTML to provide the basic structure for the visuals, to create a dashboard that shows traffic lights, the timer and displays text .
   Vanilla CSS is used to style the HTML code to make it more user interactive.
   JS is used to make functional, it switches the red-light to green-light, makes the countdown timer work and updates demand and traffic density.
   It is also used to connect to backend using fetch() API .

2) BACKEND :
   The AI Model is made using libraries such as pandas (for handling data), sklearn(for machine learning), random(to use fake data) and flask (for making the model    a web service).
   
   generate_training_data() : this function basically is like a teacher for the AI, it teaches the AI different traffic scenarios (like weather, time of day, no of    cars) to predict the correct green light time for the scenario. It also teaches it the more important factors to make a better decision.
   
   train_signal_model() : this is a learning process, it takes the fake data and uses it in a LinearRegression model to find patterns and create a formula to          predict the green light time for different situations.
   
   predict_green_time(): it is a prediciton process, if u give it a new situation, it uses the learned formula to calculate best green light time duration.

   Guardrails: This is a key safety feature. The AI guesses are educated guesses so they can be wrong. Guardrails are common-sense rules which overrides the AI.       for example- if a ambulance is going through it keeps the green-light on.

   flask() is used to connect to frontend, it sets up a web service so that request.json can grab the data and JSON can send back the predictions to the frontend.

3) HARDWARE:
   A physical traffic light system simulated by an Arduino mini-computer. This component receives signals from the AI backend and physically changes the traffic       lights, demonstrating a proof-of-concept for real-world application.


CONTRIBUTIONS :
1. TEJAS KAUSHIK (TEAM LEADER, hardware engineer)
2. VARTIKA SHARMA (Backend Integration, fixing bugs)
3. ISHA SRIVASTAV (AI engineer)
4. SUDHARSHAN GUPTA (Frontend)
5. ROOPAKSHI SINGH (Frontend)
6. AKANKSHA DHYANI (ppt maker)
   
















