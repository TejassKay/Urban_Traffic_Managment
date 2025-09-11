window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('trafficCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const canvasWidth = 800;
    const canvasHeight = 600;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Simulation variables
    let vehicles = [];
    let intersections = [];
    let simulationRunning = true;
    let roads = {
        vertical: [],
        horizontal: []
    };
    const VEHICLE_TYPES = {
        CAR: { width: 14, height: 26, name: 'car' },
        TRUCK: { width: 16, height: 35, name: 'truck' },
        BUS: { width: 16, height: 45, name: 'bus' }
    };
    const VEHICLE_COLORS = ['#ff6b6b', '#f0e68c', '#87ceeb', '#98fb98', '#dda0dd', '#ff7f50'];
    const LANE_OFFSET = 15;


    // DOM Elements
    const vehicleCountEl = document.getElementById('vehicleCount');
    const avgSpeedEl = document.getElementById('avgSpeed');
    const avgWaitTimeEl = document.getElementById('avgWaitTime');
    const startStopBtn = document.getElementById('startStopBtn');
    const addCarBtn = document.getElementById('addCarBtn');
    const resetBtn = document.getElementById('resetBtn');


    // --- Classes ---
    class Vehicle {
        constructor(x, y, speed, direction, type, color) {
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.direction = direction; // 'N', 'S', 'E', 'W'
            this.type = type;
            this.color = color;
            this.width = type.width;
            this.height = type.height;
            this.waitTime = 0;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);

            let angle = 0;
            if (this.direction === 'E') angle = Math.PI / 2;
            else if (this.direction === 'S') angle = Math.PI;
            else if (this.direction === 'W') angle = -Math.PI / 2;

            ctx.rotate(angle);

            // Vehicle Body
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            
            // Windshield
            ctx.fillStyle = 'rgba(200, 230, 255, 0.8)';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, 5);

            // Truck/Bus Cab
            if (this.type.name !== 'car') {
                ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
                ctx.fillRect(-this.width / 2, -this.height / 2 + 7, this.width, 6);
            }

            ctx.restore();
        }

        move() {
            switch (this.direction) {
                case 'N': this.y -= this.speed; break;
                case 'S': this.y += this.speed; break;
                case 'E': this.x += this.speed; break;
                case 'W': this.x -= this.speed; break;
            }

            // Wrap around canvas edges
            if (this.y < -this.height) this.y = canvasHeight + this.height;
            else if (this.y > canvasHeight + this.height) this.y = -this.height;
            else if (this.x < -this.width) this.x = canvasWidth + this.width;
            else if (this.x > canvasWidth + this.width) this.x = -this.width;
        }
    }

    class Intersection {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = 60;
            this.height = 60;
            this.isNSGreen = true; // North-South is green by default
            
            // --- SMART SYSTEM PROPERTIES ---
            this.minGreenTime = 180; // Minimum time a light stays green (3 seconds at 60fps)
            this.greenTimeTimer = 0;
            this.northboundDemand = 0;
            this.southboundDemand = 0;
            this.eastboundDemand = 0;
            this.westboundDemand = 0;
        }

        draw() {
            // Draw traffic lights
            const lightSize = 6;
            const lightOffset = 8;
            ctx.fillStyle = this.isNSGreen ? '#28a745' : '#dc3545';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.height / 2 - lightOffset, lightSize, 0, Math.PI * 2);
            ctx.arc(this.x, this.y + this.height / 2 + lightOffset, lightSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = !this.isNSGreen ? '#28a745' : '#dc3545';
            ctx.beginPath();
            ctx.arc(this.x - this.width / 2 - lightOffset, this.y, lightSize, 0, Math.PI * 2);
            ctx.arc(this.x + this.width / 2 + lightOffset, this.y, lightSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // --- THE "BRAIN" OF THE SMART SYSTEM ---
        update(allVehicles) {
            this.detectTraffic(allVehicles);
            this.greenTimeTimer++;

            // Only consider switching if the minimum green time has passed
            if (this.greenTimeTimer < this.minGreenTime) {
                return;
            }

            const nsTotalDemand = this.northboundDemand + this.southboundDemand;
            const ewTotalDemand = this.eastboundDemand + this.westboundDemand;

            // Decision logic: switch if the other direction has more demand
            if (this.isNSGreen && ewTotalDemand > nsTotalDemand) {
                this.isNSGreen = false;
                this.greenTimeTimer = 0; // Reset timer on switch
            } else if (!this.isNSGreen && nsTotalDemand > ewTotalDemand) {
                this.isNSGreen = true;
                this.greenTimeTimer = 0; // Reset timer on switch
            }
            // If demand is equal, or the current green direction has more demand, do nothing.
        }
        
        // --- THE "EYES" OF THE SMART SYSTEM ---
        detectTraffic(allVehicles) {
            // Reset demand counts for each frame
            this.northboundDemand = 0;
            this.southboundDemand = 0;
            this.eastboundDemand = 0;
            this.westboundDemand = 0;
            const detectionZone = 250; // How far the "sensors" can see

            for (const vehicle of allVehicles) {
                const isWaiting = vehicle.waitTime > 0;
                
                // Southbound vehicles (approaching from the north)
                if(vehicle.direction === 'S' && vehicle.y < this.y && (this.y - vehicle.y) < detectionZone) {
                    this.southboundDemand += isWaiting ? 5 : 1; // Prioritize waiting cars
                }
                // Northbound vehicles (approaching from the south)
                else if (vehicle.direction === 'N' && vehicle.y > this.y && (vehicle.y - this.y) < detectionZone) {
                    this.northboundDemand += isWaiting ? 5 : 1;
                }
                // Eastbound vehicles (approaching from the west)
                else if (vehicle.direction === 'E' && vehicle.x < this.x && (this.x - vehicle.x) < detectionZone) {
                    this.eastboundDemand += isWaiting ? 5 : 1;
                }
                // Westbound vehicles (approaching from the east)
                else if (vehicle.direction === 'W' && vehicle.x > this.x && (vehicle.x - this.x) < detectionZone) {
                    this.westboundDemand += isWaiting ? 5 : 1;
                }
            }
        }
    }


    // --- Functions ---
    function init() {
        vehicles = [];
        intersections = [];
        roads.vertical = [];
        roads.horizontal = [];

        const roadX = canvasWidth / 2;
        const roadY = canvasHeight / 2;

        roads.vertical.push(roadX);
        roads.horizontal.push(roadY);
        intersections.push(new Intersection(roadX, roadY));

        for (let i = 0; i < 15; i++) {
            addVehicle();
        }

        if (!simulationRunning) {
            startStopBtn.textContent = 'Start';
        } else { 
            gameLoop();
        }
    }

    function addVehicle() {
        const directions = ['N', 'S', 'E', 'W'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const speed = 1 + Math.random();
        let x, y;

        const randType = Math.random();
        let type;
        if (randType < 0.7) type = VEHICLE_TYPES.CAR;
        else if (randType < 0.9) type = VEHICLE_TYPES.TRUCK;
        else type = VEHICLE_TYPES.BUS;
        
        const color = VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)];

        // Assign vehicles to strict lanes
        switch(direction) {
            case 'N':
                x = roads.vertical[0] + LANE_OFFSET;
                y = canvasHeight + type.height;
                break;
            case 'S':
                x = roads.vertical[0] - LANE_OFFSET;
                y = -type.height;
                break;
            case 'E':
                x = -type.width;
                y = roads.horizontal[0] + LANE_OFFSET;
                break;
            case 'W':
                x = canvasWidth + type.width;
                y = roads.horizontal[0] - LANE_OFFSET;
                break;
        }
        
        vehicles.push(new Vehicle(x, y, speed, direction, type, color));
    }

    function drawUrbanSurroundings() {
        // ... (Drawing code is unchanged)
        ctx.fillStyle = '#4a576d'; 
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        const roadWidth = 60;
        const sidewalkWidth = 20;
        const totalRoadWidth = roadWidth + sidewalkWidth * 2;
        ctx.fillStyle = '#a0a0a0';
        roads.vertical.forEach(x => { ctx.fillRect(x - totalRoadWidth / 2, 0, totalRoadWidth, canvasHeight); });
        roads.horizontal.forEach(y => { ctx.fillRect(0, y - totalRoadWidth / 2, canvasWidth, totalRoadWidth); });
        ctx.fillStyle = '#666'; 
        roads.vertical.forEach(x => { ctx.fillRect(x - roadWidth / 2, 0, roadWidth, canvasHeight); });
        roads.horizontal.forEach(y => { ctx.fillRect(0, y - roadWidth / 2, canvasWidth, roadWidth); });
        ctx.fillStyle = '#333b4a';
        ctx.fillRect(0, 0, roads.vertical[0] - totalRoadWidth / 2, roads.horizontal[0] - totalRoadWidth / 2);
        ctx.fillRect(roads.vertical[0] + totalRoadWidth / 2, 0, canvasWidth, roads.horizontal[0] - totalRoadWidth / 2);
        ctx.fillRect(0, roads.horizontal[0] + totalRoadWidth / 2, roads.vertical[0] - totalRoadWidth / 2, canvasHeight);
        ctx.fillRect(roads.vertical[0] + totalRoadWidth / 2, roads.horizontal[0] + totalRoadWidth / 2, canvasWidth, canvasHeight);
        ctx.strokeStyle = '#f0c14a';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 15]);
        roads.vertical.forEach(x => { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke(); });
        roads.horizontal.forEach(y => { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke(); });
        const intersection = intersections[0];
        ctx.fillStyle = 'white';
        ctx.setLineDash([]);
        for(let i = -1; i <= 1; i += 2) {
            for(let j = -1; j <= 1; j += 0.5) {
                ctx.fillRect(intersection.x + (j * 10), intersection.y + (i * (roadWidth / 2 + 5)), 5, 10);
                ctx.fillRect(intersection.x + (i * (roadWidth / 2 + 5)), intersection.y + (j * 10), 10, 5);
            }
        }
    }

    function updateDataDashboard() {
        if (!vehicleCountEl) return;
        vehicleCountEl.textContent = vehicles.length;
        let totalSpeed = 0;
        let waitingVehicles = 0;
        let totalWaitTime = 0;
        vehicles.forEach(v => {
            totalSpeed += v.speed;
            if (v.waitTime > 0) {
                waitingVehicles++;
                totalWaitTime += v.waitTime;
            }
        });
        const avgSpeed = vehicles.length > 0 ? (totalSpeed / vehicles.length * 20).toFixed(1) : 0;
        avgSpeedEl.textContent = `${avgSpeed} km/h`;
        const avgWaitTime = waitingVehicles > 0 ? (totalWaitTime / waitingVehicles / 60).toFixed(2) : 0;
        avgWaitTimeEl.textContent = `${avgWaitTime}s`;
    }

    function gameLoop() {
        if (simulationRunning) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawUrbanSurroundings();

            intersections.forEach(intersection => {
                intersection.draw();
                intersection.update(vehicles); // Pass vehicle data to the intersection's brain
            });

            vehicles.forEach((vehicle, index) => {
                let isStoppedAtLight = false;
                let isBlockedByCar = false;
                const stopDistance = 45; 
                const safeDistance = vehicle.height + 10;

                const intersection = intersections[0];
                const dx = vehicle.x - intersection.x;
                const dy = vehicle.y - intersection.y;
                
                if (vehicle.direction === 'S' && !intersection.isNSGreen && dy > -stopDistance && dy < 0) isStoppedAtLight = true;
                else if (vehicle.direction === 'N' && !intersection.isNSGreen && dy < stopDistance && dy > 0) isStoppedAtLight = true;
                else if (vehicle.direction === 'E' && intersection.isNSGreen && dx > -stopDistance && dx < 0) isStoppedAtLight = true;
                else if (vehicle.direction === 'W' && intersection.isNSGreen && dx < stopDistance && dx > 0) isStoppedAtLight = true;

                for (let i = 0; i < vehicles.length; i++) {
                    if (index === i) continue;
                    const other = vehicles[i];
                    if (vehicle.x === other.x || vehicle.y === other.y) {
                         switch(vehicle.direction) {
                             case 'S': if (other.y > vehicle.y && other.y - vehicle.y < safeDistance) isBlockedByCar = true; break;
                             case 'N': if (other.y < vehicle.y && vehicle.y - other.y < safeDistance) isBlockedByCar = true; break;
                             case 'E': if (other.x > vehicle.x && other.x - vehicle.x < safeDistance) isBlockedByCar = true; break;
                             case 'W': if (other.x < vehicle.x && vehicle.x - other.x < safeDistance) isBlockedByCar = true; break;
                         }
                    }
                }
                
                if (isStoppedAtLight || isBlockedByCar) {
                    vehicle.waitTime++;
                } else {
                    vehicle.move();
                    vehicle.waitTime = 0;
                }
                vehicle.draw();
            });

            updateDataDashboard();
        }
        requestAnimationFrame(gameLoop);
    }

    // --- Event Listeners ---
    if(startStopBtn) {
        startStopBtn.addEventListener('click', () => {
            simulationRunning = !simulationRunning;
            startStopBtn.textContent = simulationRunning ? 'Stop' : 'Start';
            if(simulationRunning) { gameLoop(); }
        });
    }
    if(addCarBtn) { addCarBtn.addEventListener('click', () => { addVehicle(); }); }
    if(resetBtn) { resetBtn.addEventListener('click', () => { init(); }); }

    // --- Start Simulation ---
    init();
});
