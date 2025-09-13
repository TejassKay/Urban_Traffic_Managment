    const nsLights = document.querySelectorAll("#ns-light .light");
    const ewLights = document.querySelectorAll("#ew-light .light");
    const statusText = document.getElementById("status");
    const timerDisplay = document.getElementById("timer");
    const nsDemandDisplay = document.getElementById("ns-demand");
    const ewDemandDisplay = document.getElementById("ew-demand");
    
    const northDensityDisplay = document.getElementById("north-density");
    const southDensityDisplay = document.getElementById("south-density");
    const eastDensityDisplay = document.getElementById("east-density");
    const westDensityDisplay = document.getElementById("west-density");
    
    const predictButton = document.getElementById("predictButton");
    const autoTimerDisplay = document.getElementById("auto-timer");

    // ---------------------------------
    // AI INTEGRATION - Connect to Flask
    // ---------------------------------
    async function fetchPrediction(nsVehicles, ewVehicles) {
      try {
        const response = await fetch('http://127.0.0.1:5000/predict_time', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicles: nsVehicles }) // For simplicity, only sending one variable
        });
        const data = await response.json();
        console.log(`AI predicted green time: ${data.green_time}`);
        return data.green_time;
      } catch (error) {
        console.error('Error fetching AI prediction:', error);
        return 10; // Default time in case of error
      }
    }
    
    predictButton.addEventListener('click', async () => {
        const nsVehicles = cars.filter(c => c.lane === 'north' || c.lane === 'south').length;
        const newTime = await fetchPrediction(nsVehicles);
        phases[0].time = Math.round(newTime);
        console.log(`Updated NS green phase to ${phases[0].time} seconds.`);
        currentPhase = 0;
        updateLights();
    });

    // ---------------------------------
    // TRAFFIC SIMULATION - Canvas
    // ---------------------------------
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 10;
    const roadWidth = 80;
    
    let cars = [];
    let nsStopped = false;
    let ewStopped = false;
    
    // Set canvas dimensions dynamically for responsive design
    function resizeCanvas() {
        canvas.width = window.innerWidth * 0.7; // 70% of screen width
        canvas.height = canvas.width; // Square canvas
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Car object to manage each vehicle's state
    function Car(lane) {
      this.lane = lane;
      this.speed = 1.5;
      this.x = 0;
      this.y = 0;
      this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
      this.width = 10;
      this.height = 15;

      // Set initial position based on lane
      if (this.lane === 'north') { this.x = canvas.width / 2 + gridSize; this.y = -this.height; }
      if (this.lane === 'south') { this.x = canvas.width / 2 - gridSize - this.width; this.y = canvas.height + this.height; }
      if (this.lane === 'east') { this.x = canvas.width + this.width; this.y = canvas.height / 2 + gridSize; }
      if (this.lane === 'west') { this.x = -this.width; this.y = canvas.height / 2 - gridSize - this.height; }
    }

    // Update car positions and add collision avoidance
    function updateCars() {
      const stopDistance = 30; // Increased for cleaner stop

      cars.forEach(car => {
        let isStopped = false;

        // Intersection stop logic
        if (car.lane === 'north') {
          // Stop for red
          if (
            car.y + car.height > canvas.height/2 - roadWidth/2 - stopDistance &&
            phases[currentPhase].ns === 'red'
          ) isStopped = true;
        }
        if (car.lane === 'south') {
          if (
            car.y < canvas.height/2 + roadWidth/2 + stopDistance &&
            phases[currentPhase].ns === 'red'
          ) isStopped = true;
        }
        if (car.lane === 'east') {
          if (
            car.x < canvas.width/2 + roadWidth/2 + stopDistance &&
            phases[currentPhase].ew === 'red'
          ) isStopped = true;
        }
        if (car.lane === 'west') {
          if (
            car.x > canvas.width/2 - roadWidth/2 - stopDistance &&
            phases[currentPhase].ew === 'red'
          ) isStopped = true;
        }

        // Car-to-car collision avoidance (unchanged)
        if (!isStopped) {
          for (let otherCar of cars) {
            if (otherCar !== car && otherCar.lane === car.lane) {
              if (car.lane === 'north' && (car.y > otherCar.y - stopDistance && car.y < otherCar.y)) isStopped = true;
              if (car.lane === 'south' && (car.y < otherCar.y + stopDistance && car.y > otherCar.y)) isStopped = true;
              if (car.lane === 'east' && (car.x < otherCar.x + stopDistance && car.x > otherCar.x)) isStopped = true;
              if (car.lane === 'west' && (car.x > otherCar.x - stopDistance && car.x < otherCar.x)) isStopped = true;
            }
          }
        }

        // Move car if not stopped
        if (!isStopped) {
          if (car.lane === 'north') car.y += car.speed;
          if (car.lane === 'south') car.y -= car.speed;
          if (car.lane === 'east') car.x -= car.speed;
          if (car.lane === 'west') car.x += car.speed;
        }
      });
      
      // Remove cars that have left the screen
      cars = cars.filter(car => 
        car.x > -car.width && car.x < canvas.width + car.width &&
        car.y > -car.height && car.y < canvas.height + car.height
      );
    }
    
    // Function to get demand based on the simulation
    function getTrafficDemand() {
        const nsCars = cars.filter(car => car.lane === 'north' || car.lane === 'south');
        const ewCars = cars.filter(car => car.lane === 'east' || car.lane === 'west');
        return { ns: nsCars.length, ew: ewCars.length };
    }

    // Function to get density based on the simulation
    function getTrafficDensity() {
        const nsCarsCount = cars.filter(car => car.lane === 'north' || car.lane === 'south').length;
        const ewCarsCount = cars.filter(car => car.lane === 'east' || car.lane === 'west').length;
        return {
            north: nsCarsCount > 15 ? 'High' : nsCarsCount > 5 ? 'Medium' : 'Low',
            south: nsCarsCount > 15 ? 'High' : nsCarsCount > 5 ? 'Medium' : 'Low',
            east: ewCarsCount > 15 ? 'High' : ewCarsCount > 5 ? 'Medium' : 'Low',
            west: ewCarsCount > 15 ? 'High' : ewCarsCount > 5 ? 'Medium' : 'Low'
        };
    }

    // Draw the simulation
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw roads
      ctx.fillStyle = '#1e2125';
      ctx.fillRect(0, canvas.height / 2 - roadWidth / 2, canvas.width, roadWidth);
      ctx.fillRect(canvas.width / 2 - roadWidth / 2, 0, roadWidth, canvas.height);

      // Draw dashed lines
      ctx.strokeStyle = '#e6edf3';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height / 2 - roadWidth / 2);
      ctx.moveTo(canvas.width / 2, canvas.height / 2 + roadWidth / 2);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width / 2 - roadWidth / 2, canvas.height / 2);
      ctx.moveTo(canvas.width / 2 + roadWidth / 2, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw traffic lights
      drawTrafficLight(canvas.width / 2 - roadWidth / 2 - 30, canvas.height / 2 - roadWidth / 2 - 80, phases[currentPhase].ns); // North
      drawTrafficLight(canvas.width / 2 + roadWidth / 2 + 10, canvas.height / 2 + roadWidth / 2 + 10, phases[currentPhase].ns); // South
      drawTrafficLight(canvas.width / 2 + roadWidth / 2 + 10, canvas.height / 2 - roadWidth / 2 - 80, phases[currentPhase].ew); // East
      drawTrafficLight(canvas.width / 2 - roadWidth / 2 - 30, canvas.height / 2 + roadWidth / 2 + 10, phases[currentPhase].ew); // West


      // Draw cars
      cars.forEach(car => {
        ctx.fillStyle = car.color;
        ctx.beginPath();
        if (car.lane === 'north' || car.lane === 'south') {
            ctx.rect(car.x, car.y, car.width, car.height);
        } else {
            ctx.rect(car.x, car.y, car.height, car.width);
        }
        ctx.fill();
      });

      // Spawn new cars based on a random chance
      if (Math.random() < 0.01) cars.push(new Car('north'));
      if (Math.random() < 0.01) cars.push(new Car('south'));
      if (Math.random() < 0.01) cars.push(new Car('east'));
      if (Math.random() < 0.01) cars.push(new Car('west'));
    }

    // Function to draw a traffic light on the canvas
    function drawTrafficLight(x, y, color) {
        ctx.fillStyle = '#1e2125';
        ctx.fillRect(x, y, 20, 50);
        
        ctx.beginPath();
        ctx.arc(x + 10, y + 10, 5, 0, Math.PI * 2);
        ctx.fillStyle = color === 'red' ? 'red' : '#333';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + 10, y + 25, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#333';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x + 10, y + 40, 5, 0, Math.PI * 2);
        ctx.fillStyle = color === 'green' ? 'lime' : '#333';
        ctx.fill();
    }

    // Main animation loop
    function gameLoop() {
      updateCars();
      draw();
      requestAnimationFrame(gameLoop);
    }
    
    // Start the game loop on window load.
    window.onload = function () {
        gameLoop();
    }


    // --- Updated Signal Logic with Yellow Phase ---

    let phases = [
      { id: "ns", ns: "green", ew: "red", text: "North/South Green - Go", time: 5 },
      { id: "ew", ns: "red", ew: "green", text: "East/West Green - Go", time: 5 }
    ];

    let currentPhase = 0;
    let phaseTimer = phases[currentPhase].time;
    let fetchingPrediction = false;

    // Improved: Cars stop before intersection
    function updateCars() {
      const stopDistance = 30; // Increased for cleaner stop

      cars.forEach(car => {
        let isStopped = false;

        // Intersection stop logic
        if (car.lane === 'north') {
          // Stop for red
          if (
            car.y + car.height > canvas.height/2 - roadWidth/2 - stopDistance &&
            phases[currentPhase].ns === 'red'
          ) isStopped = true;
        }
        if (car.lane === 'south') {
          if (
            car.y < canvas.height/2 + roadWidth/2 + stopDistance &&
            phases[currentPhase].ns === 'red'
          ) isStopped = true;
        }
        if (car.lane === 'east') {
          if (
            car.x < canvas.width/2 + roadWidth/2 + stopDistance &&
            phases[currentPhase].ew === 'red'
          ) isStopped = true;
        }
        if (car.lane === 'west') {
          if (
            car.x > canvas.width/2 - roadWidth/2 - stopDistance &&
            phases[currentPhase].ew === 'red'
          ) isStopped = true;
        }

        // Car-to-car collision avoidance
        if (!isStopped) {
          for (let otherCar of cars) {
            if (otherCar !== car && otherCar.lane === car.lane) {
              if (car.lane === 'north' && (car.y > otherCar.y - stopDistance && car.y < otherCar.y)) isStopped = true;
              if (car.lane === 'south' && (car.y < otherCar.y + stopDistance && car.y > otherCar.y)) isStopped = true;
              if (car.lane === 'east' && (car.x < otherCar.x + stopDistance && car.x > otherCar.x)) isStopped = true;
              if (car.lane === 'west' && (car.x > otherCar.x - stopDistance && car.x < otherCar.x)) isStopped = true;
            }
          }
        }

        // Move car if not stopped
        if (!isStopped) {
          if (car.lane === 'north') car.y += car.speed;
          if (car.lane === 'south') car.y -= car.speed;
          if (car.lane === 'east') car.x -= car.speed;
          if (car.lane === 'west') car.x += car.speed;
        }
      });
      
      // Remove cars that have left the screen
      cars = cars.filter(car => 
        car.x > -car.width && car.x < canvas.width + car.width &&
        car.y > -car.height && car.y < canvas.height + car.height
      );
    }
    
    // --- Signal Phase Control: cycles through green/red based on demand ---
    setInterval(async () => {
      const demand = getTrafficDemand();
      nsDemandDisplay.innerText = demand.ns;
      ewDemandDisplay.innerText = demand.ew;

      // Show the time remaining for the current phase
      autoTimerDisplay.innerText = phaseTimer;

      // If timer runs out, switch phase
      phaseTimer--;
      if (phaseTimer <= 0) {
        // Switch to the opposite lane if its demand is higher
        if (phases[currentPhase].id === "ns" && demand.ew > demand.ns) {
            currentPhase = 1; // EW Green
        } else if (phases[currentPhase].id === "ew" && demand.ns > demand.ew) {
            currentPhase = 0; // NS Green
        } else {
            // Otherwise, just switch to the next phase in the loop
            currentPhase = (currentPhase + 1) % phases.length;
        }
        
        // Update lights and status immediately after phase change
        nsLights.forEach(light => light.classList.remove("active"));
        ewLights.forEach(light => light.classList.remove("active"));
        nsLights.forEach(light => {
            if (light.classList.contains(phases[currentPhase].ns)) light.classList.add("active");
        });
        ewLights.forEach(light => {
            if (light.classList.contains(phases[currentPhase].ew)) light.classList.add("active");
        });
        statusText.innerText = phases[currentPhase].text;
        
        // AI prediction logic. Only trigger on the first step of a new green phase
        if (phases[currentPhase].ns === "green" && !fetchingPrediction) {
            const nsVehicles = cars.filter(c => c.lane === 'north' || c.lane === 'south').length;
            console.log(`Sending AI NS traffic data: ${nsVehicles}`);
            fetchingPrediction = true;
            const newTime = await fetchPrediction(nsVehicles);
            fetchingPrediction = false;
            phases[currentPhase].time = Math.round(newTime);
        } else if (phases[currentPhase].ew === "green" && !fetchingPrediction) {
            const ewVehicles = cars.filter(c => c.lane === 'east' || c.lane === 'west').length;
            console.log(`Sending AI EW traffic data: ${ewVehicles}`);
            fetchingPrediction = true;
            const newTime = await fetchPrediction(ewVehicles);
            fetchingPrediction = false;
            phases[currentPhase].time = Math.round(newTime);
        }
        
        phaseTimer = phases[currentPhase].time;
      }
      
      const density = getTrafficDensity();
      northDensityDisplay.innerText = density.north;
      southDensityDisplay.innerText = density.south;
      eastDensityDisplay.innerText = density.east;
      westDensityDisplay.innerText = density.west;
    }, 1000);

    // Initial setup
    nsLights.forEach(light => {
      if (light.classList.contains(phases[currentPhase].ns)) light.classList.add("active");
    });
    ewLights.forEach(light => {
      if (light.classList.contains(phases[currentPhase].ew)) light.classList.add("active");
    });
    statusText.innerText = phases[currentPhase].text;
